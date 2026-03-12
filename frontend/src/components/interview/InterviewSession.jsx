import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { Bot, Mic, MicOff, PhoneOff, MessageSquare, User } from "lucide-react";
import useSpeechToText from "../../hooks/useSpeechToText";
import useTextToSpeech from "../../hooks/useTextToSpeech";
import { BASE_URL } from "../../utils/apiPaths";
import "./InterviewSession.css";

// ── Phases ──
const PHASE = {
  LOADING: "loading",
  INTERVIEW: "interview",
  FEEDBACK: "feedback",
};

const InterviewSession = ({
  resumeId,
  jobDescription = "",
  questionLimit = 5,
  userId = null,
  onComplete,
  onEnd,
}) => {
  // ── State ──
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [socketError, setSocketError] = useState(null);
  // ── Refs ──
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(""); // accumulates streamed text without re-render lag
  const endingRef = useRef(false); // guard: prevent duplicate endInterview emissions

  // ── Hooks ──
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    setOnResult,
  } = useSpeechToText();

  const { speak, isSpeaking, setOnSpeechEnd } = useTextToSpeech();

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // ── Timer ──
  useEffect(() => {
    if (phase === PHASE.INTERVIEW) {
      timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

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
    [interviewId, resetTranscript]
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

  // ── Auto-voice: when speech recognition produces result → auto-send ──
  useEffect(() => {
    if (!autoVoice) return;
    setOnResult((text) => {
      if (text?.trim()) {
        sendMessage(text);
      }
    });
  }, [autoVoice, setOnResult, sendMessage]);

  // ── Fill input with transcript when not in auto-voice mode ──
  useEffect(() => {
    if (!autoVoice && transcript) {
      setInputText(transcript);
    }
  }, [transcript, autoVoice]);

  // ── Socket.io setup ──
  useEffect(() => {
    const socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected to interview server:", socket.id);
      setSocketError(null); // Start the interview — pass userId so the Interview doc is linked to the user
      socket.emit("joinInterview", {
        resumeId,
        limit: questionLimit,
        jobDescription,
        userId,
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setSocketError("Failed to connect to interview server");
    });
    socket.on("interviewStarted", ({ interviewId: id, selectedQuestions }) => {
      console.log("🎙️ Interview started:", id);
      setInterviewId(id);
      setPhase(PHASE.INTERVIEW);
      endingRef.current = false; // reset guard for this fresh session

      // Show initial AI greeting
      setIsAiThinking(true);
      setStreamingText("");
      streamRef.current = "";

      // Send an initial "start" message to trigger the first AI question
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

      // Speak the AI response
      if (fullResponse || streamRef.current) {
        speak(fullResponse || streamRef.current);
      }
    });

    socket.on(
      "interviewComplete",
      ({ feedback: fb, atsScore: ats, keywords: kw }) => {
        clearInterval(timerRef.current);
        setFeedback(fb);
        setAtsScore(ats);
        setKeywords(kw || []);
        setPhase(PHASE.FEEDBACK);

        if (onComplete) {
          onComplete({ feedback: fb, atsScore: ats, keywords: kw });
        }
      }
    );

    socket.on("error", (err) => {
      console.error("Interview error:", err);
      setSocketError(typeof err === "string" ? err : err.message);
      setIsAiThinking(false);
    });

    return () => {
      socket.disconnect();
      clearInterval(timerRef.current);
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, questionLimit, jobDescription, userId]); // ── End interview handler ──
  const handleEndInterview = () => {
    // Guard: only emit once, even if the button is clicked multiple times
    if (endingRef.current) return;

    if (socketRef.current && interviewId) {
      endingRef.current = true;
      // Emit end — the server will generate feedback and emit 'interviewComplete'
      // which transitions us to the FEEDBACK phase. Don't navigate away yet.
      socketRef.current.emit("endInterview", { interviewId });
      setIsAiThinking(true); // show thinking state while feedback is generated
    } else {
      // No active session — just leave
      if (onEnd) onEnd();
    }
  };

  // ── Mic toggle ──
  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ── Send via input ──
  const handleSend = () => {
    sendMessage(inputText);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Determine AI status text ──
  const getAiStatus = () => {
    if (isAiThinking) return { text: "Thinking...", dotClass: "thinking" };
    if (isSpeaking) return { text: "Speaking...", dotClass: "speaking" };
    return { text: "Listening", dotClass: "" };
  };

  const aiStatus = getAiStatus();
  const questionCount = messages.filter((m) => m.role === "model").length;

  // ═══════════════════════════════════════════
  // RENDER: Loading
  // ═══════════════════════════════════════════
  if (phase === PHASE.LOADING) {
    return (
      <div className="interview-session">
        <div className="is-container">
          <div className="is-loading-screen">
            <div className="is-loading-spinner" />
            <div className="is-loading-text">
              {socketError
                ? `Error: ${socketError}`
                : "Setting up your interview..."}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: Feedback
  // ═══════════════════════════════════════════
  if (phase === PHASE.FEEDBACK && feedback) {
    return (
      <div className="interview-session">
        <div className="is-container">
          <div className="is-feedback-screen">
            <div className="feedback-card">
              <h2>Interview Complete</h2>

              <div className="feedback-scores">
                <div className="score-card">
                  <div className="score-value">
                    {feedback.technicalScore ?? "–"}
                  </div>
                  <div className="score-label">Technical</div>
                </div>
                <div className="score-card">
                  <div className="score-value">
                    {feedback.communicationScore ?? "–"}
                  </div>
                  <div className="score-label">Communication</div>
                </div>
                {atsScore !== null && (
                  <div className="score-card">
                    <div className="score-value">{atsScore}%</div>
                    <div className="score-label">ATS Score</div>
                  </div>
                )}
              </div>

              {feedback.summary && (
                <div className="feedback-summary">{feedback.summary}</div>
              )}

              <div className="feedback-lists">
                {feedback.strengths?.length > 0 && (
                  <div className="feedback-list">
                    <h4 className="strengths">Strengths</h4>
                    <ul>
                      {feedback.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.weaknesses?.length > 0 && (
                  <div className="feedback-list">
                    <h4 className="weaknesses">Areas to Improve</h4>
                    <ul>
                      {feedback.weaknesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                className="restart-btn"
                onClick={() => {
                  if (onEnd) onEnd();
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: Interview
  // ═══════════════════════════════════════════
  return (
    <div className="interview-session">
      <div className="is-container">
        {/* ── Top Bar ── */}
        <div className="is-top-bar">
          <div className="title">
            <span className="dot" />
            AI Interview Session
          </div>
          <div className="controls">
            <span className="timer">{formatTime(elapsedTime)}</span>
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              Q {questionCount}/{questionLimit}
            </span>
            <label className="auto-voice-toggle">
              <input
                type="checkbox"
                checked={autoVoice}
                onChange={(e) => setAutoVoice(e.target.checked)}
              />
              Auto Voice
            </label>
          </div>
        </div>

        {/* ── Main Area ── */}
        <div className="is-main">
          {/* AI Section */}
          <div className="is-ai-section">
            <div
              className={`ai-avatar-container ${
                isSpeaking ? "ai-speaking" : ""
              }`}
            >
              <div className="ai-pulse-ring ring-1" />
              <div className="ai-pulse-ring ring-2" />
              <div className="ai-pulse-ring ring-3" />
              <div className="ai-avatar">
                <Bot strokeWidth={1.5} />
              </div>
            </div>

            <div className="ai-label">AI Interviewer</div>
            <div className="ai-status">
              <span className={`status-dot ${aiStatus.dotClass}`} />
              {aiStatus.text}
            </div>

            {/* Sound wave bars */}
            <div className="sound-wave">
              {[...Array(7)].map((_, i) => (
                <div className="bar" key={i} />
              ))}
            </div>
          </div>

          {/* User PIP */}
          <div className={`is-user-pip ${isListening ? "listening" : ""}`}>
            <div className="user-avatar-small">
              <User size={20} />
            </div>
            <div className="user-pip-label">You</div>
            <div className="user-pip-status">
              {isListening ? "🎙️ Listening..." : "Ready"}
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="is-chat-panel">
              <div className="chat-header">
                <span>Transcript</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {messages.length} messages
                </span>
              </div>

              <div className="chat-messages">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`chat-msg ${
                      msg.role === "model" ? "ai" : "user"
                    }`}
                  >
                    <div className="msg-role">
                      {msg.role === "model" ? "AI" : "You"}
                    </div>
                    {msg.content}
                  </div>
                ))}

                {/* Streaming AI text */}
                {streamingText && (
                  <div className="chat-msg ai">
                    <div className="msg-role">AI</div>
                    {streamingText}
                    <span className="streaming-cursor">▌</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="chat-input-area">
                <input
                  type="text"
                  placeholder={
                    isAiThinking ? "AI is responding..." : "Type your answer..."
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAiThinking}
                />
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={isAiThinking || !inputText.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Bar ── */}
        <div className="is-bottom-bar">
          <button
            className={`is-btn mic ${isListening ? "active" : ""}`}
            onClick={handleMicToggle}
            disabled={isAiThinking || isSpeaking}
          >
            {isListening ? <Mic size={22} /> : <MicOff size={22} />}
          </button>

          <button className="is-btn end-call" onClick={handleEndInterview}>
            <PhoneOff size={22} />
          </button>

          <button
            className="is-btn chat-toggle"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare size={22} />
          </button>
        </div>

        {/* Socket error toast */}
        {socketError && (
          <div
            style={{
              position: "absolute",
              bottom: 100,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(239, 68, 68, 0.9)",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 13,
              zIndex: 100,
            }}
          >
            {socketError}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSession;
