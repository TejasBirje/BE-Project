import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  Bot,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  AlertTriangle,
  Send,
  WifiOff,
  ShieldAlert,
  X,
  Camera,
} from "lucide-react";
import useSpeechToText from "../../hooks/useSpeechToText";
import useTextToSpeech from "../../hooks/useTextToSpeech";
import useInterviewTimer from "../../hooks/useInterviewTimer";
import useCheatingDetection from "../../hooks/useCheatingDetection";
import { BASE_URL } from "../../utils/apiPaths";

// ── Phases ──
const PHASE = {
  LOADING: "loading",
  INTERVIEW: "interview",
  FEEDBACK: "feedback",
  TERMINATED: "terminated",
};

const InterviewSession = ({
  resumeId,
  jobDescription = "",
  questionLimit = 5,
  userId = null,
  onComplete,
  onEnd,
}) => {
  // ── Core State ──
  const [phase, setPhase] = useState(PHASE.LOADING);
  const [interviewId, setInterviewId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [showChat, setShowChat] = useState(true);
  const [autoVoice, setAutoVoice] = useState(true);
  const [socketError, setSocketError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting"); // connecting | connected | reconnecting | disconnected
  const [terminationReason, setTerminationReason] = useState(null);

  // ── UI Modals ──
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [cheatFlagCounts, setCheatFlagCounts] = useState({});
  const [lastCheatFlag, setLastCheatFlag] = useState(null);

  // ── Refs ──
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const streamRef = useRef("");
  const endingRef = useRef(false);

  // ── Custom Hooks ──
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    setOnResult,
  } = useSpeechToText();

  const { speak, isSpeaking, setOnSpeechEnd } = useTextToSpeech();
  const { formattedTime, startTimer, stopTimer } = useInterviewTimer();

  const {
    videoRef,
    webcamError: proctorError,
    detectorReady,
    faceCount,
    lastFlagType,
  } = useCheatingDetection({
    enabled: phase === PHASE.INTERVIEW,
    interviewId,
    socketRef,
    detectionIntervalMs: 500,
    lookAwayThresholdMs: 3000,
    enableObjectDetection: false,
  });

  useEffect(() => {
    if (!lastFlagType) return;

    setCheatFlagCounts((prev) => ({
      ...prev,
      [lastFlagType]: (prev[lastFlagType] || 0) + 1,
    }));
    setLastCheatFlag(lastFlagType);

    if (lastFlagType === "TAB_SWITCH") {
      setShowTabWarning(true);
    }
  }, [lastFlagType]);

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // ── Start timer when interview begins ──
  useEffect(() => {
    if (phase === PHASE.INTERVIEW) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [phase, startTimer, stopTimer]);

  // ── Send message handler ──
  const sendMessage = useCallback(
    (text) => {
      if (!text?.trim() || !interviewId || !socketRef.current) return;

      const userMsg = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      resetTranscript();
      setIsAiThinking(true);
      setStreamingText("");
      streamRef.current = "";

      socketRef.current.emit("chatMessage", {
        message: text.trim(),
        interviewId,
      });
    },
    [interviewId, resetTranscript],
  );

  // ── Auto-voice: when AI finishes speaking → start listening ──
  useEffect(() => {
    if (!autoVoice) return;
    setOnSpeechEnd(() => {
      if (phase === PHASE.INTERVIEW && !isAiThinking) {
        startListening();
      }
    });
  }, [autoVoice, phase, isAiThinking, setOnSpeechEnd, startListening]);

  // ── Auto-voice: speech recognition result → auto-send ──
  useEffect(() => {
    if (!autoVoice) return;
    setOnResult((text) => {
      if (text?.trim()) {
        sendMessage(text);
      }
    });
  }, [autoVoice, setOnResult, sendMessage]);

  // ── Fill input with transcript when not in auto-voice ──
  useEffect(() => {
    if (!autoVoice && transcript) {
      setInputText(transcript);
    }
  }, [transcript, autoVoice]);

  // ── Socket.io setup ──
  useEffect(() => {
    const socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected to interview server:", socket.id);
      setConnectionStatus("connected");
      setSocketError(null);
      socket.emit("joinInterview", {
        resumeId,
        limit: questionLimit,
        jobDescription,
        userId,
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setConnectionStatus("disconnected");
      setSocketError("Failed to connect to interview server");
    });

    socket.on("reconnecting", () => {
      setConnectionStatus("reconnecting");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("reconnect", () => {
      setConnectionStatus("connected");
    });

    socket.on("interviewStarted", ({ interviewId: id }) => {
      console.log("🎙️ Interview started:", id);
      setInterviewId(id);
      setPhase(PHASE.INTERVIEW);
      endingRef.current = false;

      setIsAiThinking(true);
      setStreamingText("");
      streamRef.current = "";

      socket.emit("chatMessage", {
        message:
          "Hello, I'm ready for the interview. Please start with the first question.",
        interviewId: id,
      });
      setMessages([
        {
          role: "user",
          content:
            "Hello, I'm ready for the interview. Please start with the first question.",
        },
      ]);
    });

    socket.on("aiResponseChunk", (chunk) => {
      streamRef.current += chunk;
      setStreamingText(streamRef.current);
    });

    socket.on("aiResponseComplete", ({ fullResponse }) => {
      const aiMsg = {
        role: "model",
        content: fullResponse || streamRef.current,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setStreamingText("");
      streamRef.current = "";
      setIsAiThinking(false);

      if (fullResponse || streamRef.current) {
        speak(fullResponse || streamRef.current);
      }
    });

    socket.on(
      "interviewComplete",
      ({ feedback: fb, atsScore: ats, keywords: kw }) => {
        stopTimer();
        setFeedback(fb);
        setAtsScore(ats);
        setKeywords(kw || []);
        setTerminationReason("completed");
        setPhase(PHASE.FEEDBACK);

        if (onComplete) {
          onComplete({ feedback: fb, atsScore: ats, keywords: kw });
        }
      },
    );

    socket.on(
      "interviewTerminated",
      ({ reason, feedback: fb, atsScore: ats, keywords: kw }) => {
        stopTimer();
        stopListening();
        setFeedback(fb);
        setAtsScore(ats);
        setKeywords(kw || []);
        setTerminationReason(reason);
        setPhase(PHASE.TERMINATED);
      },
    );

    socket.on("error", (err) => {
      console.error("Interview error:", err);
      setSocketError(typeof err === "string" ? err : err.message);
      setIsAiThinking(false);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, questionLimit, jobDescription, userId]);

  // ── End interview handler (with confirmation) ──
  const handleEndInterview = useCallback(() => {
    if (endingRef.current) return;

    if (socketRef.current && interviewId) {
      endingRef.current = true;
      socketRef.current.emit("endInterview", { interviewId });
      setIsAiThinking(true);
      setShowEndConfirmModal(false);
    } else {
      if (onEnd) onEnd();
    }
  }, [interviewId, onEnd]);

  // ── Mic toggle ──
  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ── Send via input ──
  const handleSend = () => sendMessage(inputText);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── AI status ──
  const getAiStatus = () => {
    if (isAiThinking) return { text: "Thinking...", color: "bg-amber-400" };
    if (isSpeaking) return { text: "Speaking...", color: "bg-cyan-400" };
    return { text: "Listening", color: "bg-emerald-400" };
  };

  const aiStatus = getAiStatus();
  const questionCount = messages.filter((m) => m.role === "model").length;

  // ── Connection status config ──
  const connectionConfig = {
    connecting: { color: "bg-amber-400", text: "Connecting" },
    connected: { color: "bg-emerald-400", text: "Connected" },
    reconnecting: { color: "bg-amber-400", text: "Reconnecting" },
    disconnected: { color: "bg-red-400", text: "Disconnected" },
  };
  const connStatus =
    connectionConfig[connectionStatus] || connectionConfig.connecting;

  // ═══════════════════════════════════════════
  // RENDER: Loading
  // ═══════════════════════════════════════════
  if (phase === PHASE.LOADING) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Spinner */}
          <div className="w-12 h-12 border-[3px] border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 animate-pulse">
            {socketError
              ? `Error: ${socketError}`
              : "Setting up your interview..."}
          </p>
          {socketError && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: Terminated (cheating)
  // ═══════════════════════════════════════════
  if (phase === PHASE.TERMINATED) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800/60 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-red-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mb-2 text-red-400">
            Interview Terminated
          </h2>
          <p className="text-sm text-center text-slate-400 mb-6">
            Your interview was ended because tab switching was detected. This is
            considered a violation of interview integrity.
          </p>

          {/* Still show feedback if available */}
          {feedback && (
            <>
              <div className="flex gap-3 mb-5">
                <div className="flex-1 bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {feedback.technicalScore ?? "–"}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">
                    Technical
                  </div>
                </div>
                <div className="flex-1 bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {feedback.communicationScore ?? "–"}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">
                    Communication
                  </div>
                </div>
              </div>

              {feedback.summary && (
                <p className="text-sm text-slate-400 bg-slate-700/30 border-l-2 border-red-500/50 rounded-r-lg p-3 mb-5 leading-relaxed">
                  {feedback.summary}
                </p>
              )}
            </>
          )}

          <button
            onClick={() => onEnd?.()}
            className="w-full py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: Feedback
  // ═══════════════════════════════════════════
  if (phase === PHASE.FEEDBACK && feedback) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-[fadeUp_0.5s_ease]">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Interview Complete
          </h2>

          {/* Scores */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-cyan-400">
                {feedback.technicalScore ?? "–"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">
                Technical
              </div>
            </div>
            <div className="flex-1 bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-cyan-400">
                {feedback.communicationScore ?? "–"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">
                Communication
              </div>
            </div>
            {atsScore !== null && (
              <div className="flex-1 bg-slate-700/40 border border-slate-600/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-cyan-400">
                  {atsScore}%
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">
                  ATS Score
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {feedback.summary && (
            <p className="text-sm text-slate-300 bg-slate-700/30 border-l-2 border-cyan-500/50 rounded-r-lg p-4 mb-6 leading-relaxed">
              {feedback.summary}
            </p>
          )}

          {/* Strengths & Weaknesses */}
          <div className="flex gap-4 mb-6">
            {feedback.strengths?.length > 0 && (
              <div className="flex-1">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400 mb-2">
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-400 leading-snug">
                      <span className="text-slate-600 mr-1.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.weaknesses?.length > 0 && (
              <div className="flex-1">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-2">
                  Areas to Improve
                </h4>
                <ul className="space-y-1">
                  {feedback.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-slate-400 leading-snug">
                      <span className="text-slate-600 mr-1.5">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={() => onEnd?.()}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: Interview
  // ═══════════════════════════════════════════
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-[#1a1a2e] to-slate-900 text-slate-200 flex flex-col relative select-none">
      {/* ── Tab Switch Warning Overlay ── */}
      {showTabWarning && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-amber-900/30 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-center text-amber-300 mb-2">
              Warning: Tab Switch Detected
            </h3>
            <p className="text-sm text-center text-amber-200/70 mb-5">
              Switching tabs during an interview is logged as a cheating flag.
              Please stay on this tab for the rest of your session.
            </p>
            <button
              onClick={() => setShowTabWarning(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-semibold rounded-xl transition-colors"
            >
              I Understand, Continue Interview
            </button>
          </div>
        </div>
      )}

      {/* ── End Interview Confirmation Modal ── */}
      {showEndConfirmModal && (
        <div
          className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowEndConfirmModal(false)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PhoneOff className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100 text-center mb-1">
              End Interview?
            </h3>
            <p className="text-sm text-slate-400 text-center mb-6">
              Are you sure you want to end this interview? Your feedback will be
              generated based on questions answered so far.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirmModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-300 bg-slate-700 border border-slate-600 rounded-xl hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEndInterview}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                Yes, End Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06] z-10">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-200">
          {/* Connection status dot */}
          <span
            className={`w-2 h-2 rounded-full ${connStatus.color} ${
              connectionStatus === "connected" ? "animate-pulse" : ""
            }`}
            title={connStatus.text}
          />
          AI Interview Session
        </div>
        <div className="flex items-center gap-3">
          {/* Timer */}
          <span className="text-sm text-slate-400 tabular-nums font-mono">
            {formattedTime}
          </span>
          {/* Progress */}
          <span className="text-xs text-slate-500">
            Q {questionCount}/{questionLimit}
          </span>
          <span className="text-xs text-slate-500">
            {detectorReady ? `Faces: ${faceCount}` : "Proctoring..."}
          </span>
          {/* Progress bar */}
          <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((questionCount / questionLimit) * 100, 100)}%`,
              }}
            />
          </div>
          {/* Auto-voice toggle */}
          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoVoice}
              onChange={(e) => setAutoVoice(e.target.checked)}
              className="w-3.5 h-3.5 accent-cyan-400 cursor-pointer"
            />
            Auto Voice
          </label>
          {/* Connection icon */}
          {connectionStatus !== "connected" && (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* AI Section */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.03)_0%,transparent_70%)]">
          {/* Avatar with pulse rings */}
          <div className="relative flex items-center justify-center">
            {/* Rings */}
            {[180, 220, 260].map((size, i) => (
              <div
                key={i}
                className={`absolute rounded-full border-2 border-cyan-400 pointer-events-none transition-all duration-500 ${
                  isSpeaking
                    ? "opacity-20 animate-[pulseExpand_1.5s_ease-in-out_infinite]"
                    : `opacity-[${[0.08, 0.05, 0.03][i]}]`
                }`}
                style={{
                  width: size,
                  height: size,
                  animationDelay: isSpeaking ? `${i * 0.3}s` : undefined,
                  opacity: isSpeaking ? undefined : [0.08, 0.05, 0.03][i],
                }}
              />
            ))}
            {/* Avatar */}
            <div
              className={`w-36 h-36 rounded-full bg-gradient-to-br from-slate-800 to-[#1e2a4a] border-2 flex items-center justify-center relative z-10 transition-all duration-500 ${
                isSpeaking
                  ? "border-cyan-400 shadow-[0_0_60px_rgba(0,212,255,0.25)]"
                  : "border-cyan-500/20 shadow-[0_0_30px_rgba(0,212,255,0.08)]"
              }`}
            >
              <Bot className="w-16 h-16 text-cyan-300" strokeWidth={1.5} />
            </div>
          </div>

          <div className="mt-4 text-sm font-medium text-slate-400">
            AI Interviewer
          </div>
          <div className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${aiStatus.color} ${
                isAiThinking
                  ? "animate-[dotPulse_0.6s_ease-in-out_infinite]"
                  : isSpeaking
                    ? "animate-[dotPulse_1s_ease-in-out_infinite]"
                    : ""
              }`}
            />
            {aiStatus.text}
          </div>

          {/* Sound wave bars */}
          <div className="flex items-center gap-0.5 mt-3 h-6">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-sm transition-all duration-200 ${
                  isSpeaking
                    ? "bg-cyan-400 opacity-80 animate-[waveBar_0.8s_ease-in-out_infinite]"
                    : "bg-cyan-400/20 h-2"
                }`}
                style={{
                  animationDelay: isSpeaking
                    ? `${[0, 0.1, 0.2, 0.3, 0.15, 0.25, 0.05][i]}s`
                    : undefined,
                  height: isSpeaking ? undefined : "8px",
                }}
              />
            ))}
          </div>
        </div>

        {/* User PIP */}
        <div
          className={`absolute bottom-24 right-5 w-40 h-[120px] rounded-xl bg-gradient-to-br from-slate-800 to-[#16213e] border-2 flex flex-col items-center justify-center z-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 ${
            isListening
              ? "border-emerald-400 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(16,185,129,0.3)]"
              : "border-slate-700/50"
          }`}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover rounded-xl scale-x-[-1]"
          />

          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/55 to-transparent" />

          {proctorError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <Camera className="w-5 h-5 text-red-300" />
              </div>
            </div>
          )}

          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-200 font-medium">You</span>
            <span className="text-emerald-300">{isListening ? "Listening" : "Ready"}</span>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/[0.06] flex flex-col z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] text-sm font-semibold text-slate-400">
              <span>Transcript</span>
              <span className="text-[11px] text-slate-600">
                {messages.length} messages
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[90%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed animate-[msgSlide_0.3s_ease] ${
                    msg.role === "model"
                      ? "self-start bg-cyan-500/[0.08] border border-cyan-500/[0.12] text-slate-200"
                      : "self-end bg-purple-500/[0.12] border border-purple-500/[0.18] text-slate-200"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wide mb-1 text-slate-500">
                    {msg.role === "model" ? "AI" : "You"}
                  </div>
                  {msg.content}
                </div>
              ))}

              {/* Streaming text */}
              {streamingText && (
                <div className="max-w-[90%] self-start px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed bg-cyan-500/[0.08] border border-cyan-500/[0.12] text-slate-200">
                  <div className="text-[10px] uppercase tracking-wide mb-1 text-slate-500">
                    AI
                  </div>
                  {streamingText}
                  <span className="inline-block ml-0.5 animate-pulse text-cyan-400">
                    ▌
                  </span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-white/[0.06] flex gap-2">
              <input
                type="text"
                placeholder={
                  isAiThinking ? "AI is responding..." : "Type your answer..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAiThinking}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/30 focus:outline-none transition-colors disabled:opacity-40"
              />
              <button
                onClick={handleSend}
                disabled={isAiThinking || !inputText.trim()}
                className="px-3 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-900 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Bar ── */}
      <div className="flex items-center justify-center gap-4 px-6 py-4 bg-white/[0.03] backdrop-blur-xl border-t border-white/[0.06] z-10">
        {/* Mic */}
        <button
          className={`w-13 h-13 rounded-full flex items-center justify-center transition-all duration-200 ${
            isListening
              ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-[btnPulse_1.5s_ease-in-out_infinite]"
              : "bg-white/10 text-slate-200 hover:bg-white/15"
          } disabled:opacity-30 disabled:cursor-not-allowed disabled:animate-none`}
          style={{ width: 52, height: 52 }}
          onClick={handleMicToggle}
          disabled={isAiThinking || isSpeaking}
        >
          {isListening ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </button>

        {/* End Call */}
        <button
          className="w-[60px] h-13 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          style={{ height: 52 }}
          onClick={() => setShowEndConfirmModal(true)}
        >
          <PhoneOff className="w-5 h-5" />
        </button>

        {/* Chat toggle */}
        <button
          className={`rounded-full flex items-center justify-center transition-all duration-200 ${
            showChat
              ? "bg-cyan-500/20 text-cyan-400"
              : "bg-white/10 text-slate-200 hover:bg-white/15"
          }`}
          style={{ width: 52, height: 52 }}
          onClick={() => setShowChat(!showChat)}
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

      {/* Socket error toast */}
      {socketError && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-5 py-2.5 rounded-lg text-sm shadow-lg z-50 flex items-center gap-2">
          {socketError}
          <button
            onClick={() => setSocketError(null)}
            className="ml-1 hover:text-red-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {proctorError && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-amber-500/90 text-slate-900 px-5 py-2.5 rounded-lg text-sm shadow-lg z-50">
          Camera access is required for cheating detection.
        </div>
      )}

      {lastCheatFlag && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-800/90 border border-slate-700 text-slate-200 px-4 py-2 rounded-lg text-xs shadow-lg z-40">
          Last flag: {lastCheatFlag} | Total flags: {Object.values(cheatFlagCounts).reduce((a, b) => a + b, 0)}
        </div>
      )}

      {/* ── Keyframe styles (Tailwind can't do these complex animations) ── */}
      <style>{`
        @keyframes pulseExpand {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.3; }
        }
        @keyframes waveBar {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes btnPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.5); }
        }
        @keyframes msgSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default InterviewSession;
