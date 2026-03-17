import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import { BASE_URL } from "../../../utils/apiPaths";

// Section constants
const SECTIONS = ["aptitude", "technical", "coding"];

export default function AssessmentTest() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Assessment data from backend
  const [aptitudeQuestions, setAptitudeQuestions] = useState([]);
  const [technicalQuestions, setTechnicalQuestions] = useState([]);
  const [codingProblems, setCodingProblems] = useState([]);
  const [timeLimit, setTimeLimit] = useState({
    aptitude: 20,
    technical: 20,
    coding: 40,
  });

  // Navigation state
  const [currentSection, setCurrentSection] = useState(0); // 0=aptitude, 1=technical, 2=coding
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Answers state
  const [aptitudeAnswers, setAptitudeAnswers] = useState({});
  const [technicalAnswers, setTechnicalAnswers] = useState({});
  const [codingAnswers, setCodingAnswers] = useState([]);

  // Timer state — per section
  const [sectionTimeLeft, setSectionTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Tab switch detection
  const tabSwitchCount = useRef(0);
  const [tabWarning, setTabWarning] = useState(false);

  // ── Load assessment on mount ──
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.post(`${BASE_URL}/api/attempt/start/${token}`);
        const d = res.data;
        setAptitudeQuestions(d.aptitudeQuestions);
        setTechnicalQuestions(d.technicalQuestions);
        setCodingProblems(d.codingProblems);
        setTimeLimit(d.timeLimit);
        setSectionTimeLeft(d.timeLimit.aptitude * 60);

        // Init coding answers
        setCodingAnswers(
          d.codingProblems.map((p) => ({
            problemId: p._id,
            code: "",
            language: "javascript",
          })),
        );

        // If returning to already-started test, restore saved answers
        if (d.alreadyStarted && d.savedAnswers) {
          const { aptitudeAnswers: sa, technicalAnswers: st } = d.savedAnswers;
          if (sa) {
            const aMap = {};
            sa.forEach((a) => {
              aMap[a.questionId] = a.selectedOption;
            });
            setAptitudeAnswers(aMap);
          }
          if (st) {
            const tMap = {};
            st.forEach((a) => {
              tMap[a.questionId] = a.selectedOption;
            });
            setTechnicalAnswers(tMap);
          }
          setSectionTimeLeft(d.remainingSeconds);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // ── Section timer ──
  useEffect(() => {
    if (loading) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSectionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSectionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentSection, loading]);

  // ── Auto-save every 30s ──
  useEffect(() => {
    if (loading) return;
    autoSaveRef.current = setInterval(() => {
      autoSave();
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [loading, aptitudeAnswers, technicalAnswers, codingAnswers]);

  // ── Tab switch detection ──
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;
        setTabWarning(true);
        setTimeout(() => setTabWarning(false), 4000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const autoSave = async () => {
    try {
      const body = buildAnswerPayload();
      await axios.post(`${API}/api/attempt/save/${token}`, body);
    } catch (_) {}
  };

  const buildAnswerPayload = () => {
    const aptArr = Object.entries(aptitudeAnswers).map(([qId, opt]) => ({
      questionId: qId,
      selectedOption: opt,
    }));
    const techArr = Object.entries(technicalAnswers).map(([qId, opt]) => ({
      questionId: qId,
      selectedOption: opt,
    }));
    return {
      aptitudeAnswers: aptArr,
      technicalAnswers: techArr,
      codingAnswers,
    };
  };

  const handleSectionTimeout = () => {
    if (currentSection < 2) {
      const nextSection = currentSection + 1;
      setCurrentSection(nextSection);
      setCurrentQuestion(0);
      const sectionKeys = ["aptitude", "technical", "coding"];
      setSectionTimeLeft(timeLimit[sectionKeys[nextSection]] * 60);
    } else {
      handleSubmit(true);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (!auto) {
      const confirmed = window.confirm(
        "Are you sure you want to submit the assessment? This cannot be undone.",
      );
      if (!confirmed) return;
    }
    clearInterval(timerRef.current);
    clearInterval(autoSaveRef.current);
    setSubmitting(true);

    try {
      const body = buildAnswerPayload();
      await axios.post(`${BASE_URL}/api/attempt/submit/${token}`, body);
      navigate(`/assessment/${token}/result`);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isUrgent = sectionTimeLeft <= 120; // last 2 minutes

  const currentQuestions =
    currentSection === 0
      ? aptitudeQuestions
      : currentSection === 1
        ? technicalQuestions
        : [];

  const currentAnswers =
    currentSection === 0 ? aptitudeAnswers : technicalAnswers;

  const setAnswer = (qId, option) => {
    if (currentSection === 0)
      setAptitudeAnswers((p) => ({ ...p, [qId]: option }));
    else setTechnicalAnswers((p) => ({ ...p, [qId]: option }));
  };

  const answeredCount = Object.keys(currentAnswers).length;

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCenter}>
          <div style={styles.spinner} />
          <p style={{ color: "#64748b" }}>Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCenter}>
          <div style={styles.errorCard}>
            <p style={{ color: "#fca5a5" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const sectionLabels = ["Aptitude MCQ", "Technical MCQ", "Coding"];

  return (
    <div style={styles.page}>
      {/* Tab switch warning */}
      {tabWarning && (
        <div style={styles.tabWarning}>
          Tab switch detected ({tabSwitchCount.current} time
          {tabSwitchCount.current > 1 ? "s" : ""}). This is being logged.
        </div>
      )}

      {/* ── Top bar ── */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <span style={styles.assessmentLabel}>Assessment</span>
          <div style={styles.sectionTabs}>
            {sectionLabels.map((label, i) => (
              <div
                key={i}
                style={{
                  ...styles.sectionTab,
                  background: currentSection === i ? "#1e293b" : "transparent",
                  color: currentSection === i ? "#e2e8f0" : "#475569",
                  borderBottom:
                    currentSection === i
                      ? "2px solid #6366f1"
                      : "2px solid transparent",
                }}
              >
                {i < currentSection ? "✓ " : ""}
                {label}
              </div>
            ))}
          </div>
        </div>
        <div style={styles.topRight}>
          <div
            style={{
              ...styles.timerBox,
              background: isUrgent ? "#1e0a0a" : "#0f172a",
              borderColor: isUrgent ? "#7f1d1d" : "#1e293b",
              color: isUrgent ? "#fca5a5" : "#e2e8f0",
            }}
          >
            <span style={styles.timerIcon}>⏱</span>
            <span style={styles.timerVal}>{formatTime(sectionTimeLeft)}</span>
          </div>
          {currentSection === 2 && (
            <button
              style={styles.submitBtn}
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit All"}
            </button>
          )}
        </div>
      </div>

      {/* ── MCQ Section ── */}
      {currentSection < 2 && (
        <div style={styles.mcqLayout}>
          {/* Left: Question panel */}
          <div style={styles.questionPanel}>
            <div style={styles.qHeader}>
              <span style={styles.qCounter}>
                Question {currentQuestion + 1} of {currentQuestions.length}
              </span>
              <span style={styles.qAnswered}>{answeredCount} answered</span>
            </div>

            <div style={styles.questionBox}>
              <p style={styles.questionText}>
                {currentQuestions[currentQuestion]?.questionText}
              </p>

              <div style={styles.optionsList}>
                {currentQuestions[currentQuestion]?.options?.map((opt, oi) => {
                  const qId = currentQuestions[currentQuestion]._id;
                  const selected = currentAnswers[qId] === opt;
                  return (
                    <button
                      key={oi}
                      style={{
                        ...styles.optionBtn,
                        background: selected ? "#1e1b4b" : "#1e293b",
                        border: `1px solid ${selected ? "#6366f1" : "#334155"}`,
                        color: selected ? "#a5b4fc" : "#cbd5e1",
                      }}
                      onClick={() => setAnswer(qId, opt)}
                    >
                      <span
                        style={{
                          ...styles.optionDot,
                          background: selected ? "#6366f1" : "#334155",
                        }}
                      >
                        {["A", "B", "C", "D"][oi]}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div style={styles.navRow}>
              <button
                style={{
                  ...styles.navBtn,
                  opacity: currentQuestion === 0 ? 0.4 : 1,
                }}
                onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
                disabled={currentQuestion === 0}
              >
                ← Previous
              </button>

              {currentQuestion < currentQuestions.length - 1 ? (
                <button
                  style={styles.navBtnPrimary}
                  onClick={() => setCurrentQuestion((p) => p + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  style={styles.navBtnPrimary}
                  onClick={() => {
                    if (currentSection < 2) {
                      const next = currentSection + 1;
                      setCurrentSection(next);
                      setCurrentQuestion(0);
                      const sectionKeys = ["aptitude", "technical", "coding"];
                      setSectionTimeLeft(timeLimit[sectionKeys[next]] * 60);
                    }
                  }}
                >
                  {currentSection === 1 ? "Go to Coding →" : "Next Section →"}
                </button>
              )}
            </div>
          </div>

          {/* Right: Question grid */}
          <div style={styles.gridPanel}>
            <p style={styles.gridTitle}>Questions</p>
            <div style={styles.questionGrid}>
              {currentQuestions.map((q, i) => {
                const answered = !!currentAnswers[q._id];
                const isCurrent = currentQuestion === i;
                return (
                  <button
                    key={i}
                    style={{
                      ...styles.gridBtn,
                      background: isCurrent
                        ? "#6366f1"
                        : answered
                          ? "#10b981"
                          : "#1e293b",
                      color: isCurrent || answered ? "#fff" : "#64748b",
                      border: isCurrent
                        ? "2px solid #818cf8"
                        : "1px solid transparent",
                    }}
                    onClick={() => setCurrentQuestion(i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div style={styles.legend}>
              {[
                { color: "#6366f1", label: "Current" },
                { color: "#10b981", label: "Answered" },
                { color: "#1e293b", label: "Not visited" },
              ].map(({ color, label }) => (
                <div key={label} style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: color }} />
                  <span style={styles.legendLabel}>{label}</span>
                </div>
              ))}
            </div>

            <button
              style={styles.finishSectionBtn}
              onClick={() => {
                if (currentSection < 2) {
                  const next = currentSection + 1;
                  setCurrentSection(next);
                  setCurrentQuestion(0);
                  const sectionKeys = ["aptitude", "technical", "coding"];
                  setSectionTimeLeft(timeLimit[sectionKeys[next]] * 60);
                }
              }}
            >
              {currentSection === 0 ? "Finish Aptitude →" : "Go to Coding →"}
            </button>
          </div>
        </div>
      )}

      {/* ── Coding Section ── */}
      {currentSection === 2 && (
        <div style={styles.codingLayout}>
          {/* Problem list sidebar */}
          <div style={styles.problemSidebar}>
            <p style={styles.gridTitle}>Problems</p>
            {codingProblems.map((p, i) => (
              <button
                key={i}
                style={{
                  ...styles.problemTabBtn,
                  background: currentQuestion === i ? "#1e293b" : "transparent",
                  borderLeft: `3px solid ${
                    currentQuestion === i ? "#6366f1" : "transparent"
                  }`,
                  color: currentQuestion === i ? "#e2e8f0" : "#64748b",
                }}
                onClick={() => setCurrentQuestion(i)}
              >
                <span style={styles.problemNum}>P{i + 1}</span>
                {p.title}
                {codingAnswers[i]?.code?.trim() && (
                  <span style={styles.codedBadge}>✓</span>
                )}
              </button>
            ))}

            <button
              style={styles.submitAllBtn}
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>

          {/* Problem + editor */}
          <div style={styles.codingMain}>
            {codingProblems[currentQuestion] && (
              <>
                <div style={styles.problemStatement}>
                  <h3 style={styles.problemTitle}>
                    {codingProblems[currentQuestion].title}
                    <span style={styles.marksBadge}>
                      {codingProblems[currentQuestion].marks} marks
                    </span>
                  </h3>
                  <p style={styles.problemDesc}>
                    {codingProblems[currentQuestion].description}
                  </p>

                  {codingProblems[currentQuestion].sampleInput && (
                    <div style={styles.sampleBlock}>
                      <p style={styles.sampleLabel}>Sample Input:</p>
                      <pre style={styles.sampleCode}>
                        {codingProblems[currentQuestion].sampleInput}
                      </pre>
                    </div>
                  )}
                  {codingProblems[currentQuestion].sampleOutput && (
                    <div style={styles.sampleBlock}>
                      <p style={styles.sampleLabel}>Sample Output:</p>
                      <pre style={styles.sampleCode}>
                        {codingProblems[currentQuestion].sampleOutput}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Code editor area */}
                <div style={styles.editorArea}>
                  <div style={styles.editorHeader}>
                    <select
                      style={styles.langSelect}
                      value={
                        codingAnswers[currentQuestion]?.language || "javascript"
                      }
                      onChange={(e) => {
                        const updated = [...codingAnswers];
                        updated[currentQuestion] = {
                          ...updated[currentQuestion],
                          language: e.target.value,
                        };
                        setCodingAnswers(updated);
                      }}
                    >
                      {["javascript", "python", "java", "cpp", "c"].map(
                        (lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ),
                      )}
                    </select>
                    <span style={styles.editorHint}>
                      Write your solution below
                    </span>
                  </div>
                  <textarea
                    style={styles.codeEditor}
                    value={codingAnswers[currentQuestion]?.code || ""}
                    onChange={(e) => {
                      const updated = [...codingAnswers];
                      updated[currentQuestion] = {
                        ...updated[currentQuestion],
                        code: e.target.value,
                      };
                      setCodingAnswers(updated);
                    }}
                    placeholder={`// Write your ${
                      codingAnswers[currentQuestion]?.language || "javascript"
                    } solution here...`}
                    spellCheck={false}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  loadingCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "1rem",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #1e293b",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorCard: {
    background: "#1e0a0a",
    border: "1px solid #7f1d1d",
    borderRadius: "12px",
    padding: "2rem",
  },
  tabWarning: {
    background: "#451a03",
    color: "#fed7aa",
    textAlign: "center",
    padding: "0.6rem",
    fontSize: "0.85rem",
    borderBottom: "1px solid #92400e",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#0f172a",
    borderBottom: "1px solid #1e293b",
    padding: "0 1.5rem",
    height: "56px",
    flexShrink: 0,
  },
  topLeft: { display: "flex", alignItems: "center", gap: "2rem" },
  assessmentLabel: {
    fontSize: "0.8rem",
    color: "#475569",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  sectionTabs: { display: "flex", gap: "0" },
  sectionTab: {
    padding: "0 1.25rem",
    height: "56px",
    display: "flex",
    alignItems: "center",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "default",
    transition: "all 0.15s",
  },
  topRight: { display: "flex", alignItems: "center", gap: "1rem" },
  timerBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    border: "1px solid",
    borderRadius: "8px",
    padding: "0.4rem 0.9rem",
    fontFamily: "monospace",
  },
  timerIcon: { fontSize: "0.9rem" },
  timerVal: { fontSize: "1.1rem", fontWeight: 700 },
  submitBtn: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 1.2rem",
    fontWeight: 600,
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  mcqLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 240px",
    flex: 1,
    overflow: "hidden",
  },
  questionPanel: {
    padding: "2rem",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  qHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qCounter: { fontSize: "0.85rem", color: "#64748b", fontWeight: 600 },
  qAnswered: {
    fontSize: "0.78rem",
    color: "#10b981",
    background: "#022c22",
    padding: "3px 10px",
    borderRadius: "999px",
    border: "1px solid #065f46",
  },
  questionBox: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.75rem",
  },
  questionText: {
    fontSize: "1rem",
    color: "#e2e8f0",
    lineHeight: 1.7,
    marginBottom: "1.5rem",
    margin: "0 0 1.5rem",
  },
  optionsList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  optionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.9rem",
    padding: "0.85rem 1rem",
    borderRadius: "10px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "0.9rem",
    transition: "all 0.15s",
    width: "100%",
  },
  optionDot: {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "8px",
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
    fontSize: "0.88rem",
  },
  navBtnPrimary: {
    background: "#6366f1",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    padding: "0.6rem 1.4rem",
    cursor: "pointer",
    fontSize: "0.88rem",
    fontWeight: 600,
  },
  gridPanel: {
    background: "#0f172a",
    borderLeft: "1px solid #1e293b",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    overflowY: "auto",
  },
  gridTitle: {
    fontSize: "0.72rem",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 600,
    margin: 0,
  },
  questionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "0.4rem",
  },
  gridBtn: {
    width: "100%",
    aspectRatio: "1",
    borderRadius: "6px",
    border: "none",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  legend: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  legendItem: { display: "flex", alignItems: "center", gap: "0.5rem" },
  legendDot: {
    width: "10px",
    height: "10px",
    borderRadius: "3px",
    flexShrink: 0,
  },
  legendLabel: { fontSize: "0.75rem", color: "#64748b" },
  finishSectionBtn: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "8px",
    padding: "0.6rem",
    fontSize: "0.82rem",
    cursor: "pointer",
    marginTop: "auto",
  },
  codingLayout: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    flex: 1,
    overflow: "hidden",
  },
  problemSidebar: {
    background: "#0f172a",
    borderRight: "1px solid #1e293b",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    overflowY: "auto",
  },
  problemTabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.7rem 0.9rem",
    borderRadius: "0 8px 8px 0",
    border: "none",
    borderLeft: "3px solid transparent",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 500,
    textAlign: "left",
    transition: "all 0.15s",
  },
  problemNum: {
    fontSize: "0.7rem",
    color: "#475569",
    fontWeight: 700,
    minWidth: "20px",
  },
  codedBadge: {
    marginLeft: "auto",
    color: "#10b981",
    fontSize: "0.75rem",
  },
  submitAllBtn: {
    marginTop: "auto",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem",
    fontWeight: 600,
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  codingMain: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  problemStatement: {
    padding: "1.5rem",
    borderBottom: "1px solid #1e293b",
    overflowY: "auto",
    maxHeight: "45vh",
  },
  problemTitle: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    color: "#e2e8f0",
    fontSize: "1.1rem",
    fontWeight: 700,
    margin: "0 0 1rem",
  },
  marksBadge: {
    background: "#1e293b",
    color: "#f59e0b",
    fontSize: "0.75rem",
    padding: "3px 10px",
    borderRadius: "999px",
    fontWeight: 600,
  },
  problemDesc: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    lineHeight: 1.7,
    margin: "0 0 1rem",
    whiteSpace: "pre-wrap",
  },
  sampleBlock: { marginBottom: "0.75rem" },
  sampleLabel: {
    fontSize: "0.75rem",
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "0.4rem",
  },
  sampleCode: {
    background: "#1e293b",
    borderRadius: "6px",
    padding: "0.6rem 0.9rem",
    fontSize: "0.82rem",
    color: "#94a3b8",
    fontFamily: "monospace",
    margin: 0,
    overflowX: "auto",
  },
  editorArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  editorHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.6rem 1rem",
    background: "#0f172a",
    borderBottom: "1px solid #1e293b",
  },
  langSelect: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "0.82rem",
    cursor: "pointer",
    outline: "none",
  },
  editorHint: { fontSize: "0.78rem", color: "#334155" },
  codeEditor: {
    flex: 1,
    background: "#060d1a",
    border: "none",
    color: "#a5b4fc",
    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
    fontSize: "0.88rem",
    lineHeight: 1.7,
    padding: "1rem 1.25rem",
    resize: "none",
    outline: "none",
    overflow: "auto",
  },
};
