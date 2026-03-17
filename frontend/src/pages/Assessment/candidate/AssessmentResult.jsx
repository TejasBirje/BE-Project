import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import { BASE_URL } from "../../../utils/apiPaths";

export default function AssessmentResult() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/attempt/result/${token}`);
        setResult(res.data.submission);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load result");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const getPct = (score, total) =>
    total > 0 ? Math.round((score / total) * 100) : 0;

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={{ color: "#64748b" }}>Loading your result...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.center}>
          <div style={styles.errorCard}>
            <p style={{ color: "#fca5a5" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { scores, totalMarks, isPassed, timeTaken, assessmentId } = result;
  const pct = getPct(scores.total, totalMarks);

  const sectionBreakdown = [
    {
      label: "Aptitude",
      score: scores.aptitude,
      color: "#6366f1",
      answers: result.aptitudeAnswers,
    },
    {
      label: "Technical",
      score: scores.technical,
      color: "#f59e0b",
      answers: result.technicalAnswers,
    },
    {
      label: "Coding",
      score: scores.coding,
      color: "#10b981",
      answers: result.codingAnswers,
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Result hero */}
        <div style={styles.hero}>
          <div
            style={{
              ...styles.resultBadge,
              background: isPassed ? "#022c22" : "#1e0a0a",
              border: `1px solid ${isPassed ? "#065f46" : "#7f1d1d"}`,
              color: isPassed ? "#6ee7b7" : "#fca5a5",
            }}
          >
            {isPassed ? "PASSED" : "FAILED"}
          </div>

          <h1 style={styles.heroTitle}>
            {assessmentId?.title || "Assessment Complete"}
          </h1>

          {/* Big score ring */}
          <div style={styles.scoreRingWrapper}>
            <svg viewBox="0 0 120 120" width="160" height="160">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={isPassed ? "#10b981" : "#ef4444"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 326} 326`}
                strokeDashoffset="81.5"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
              <text
                x="60"
                y="56"
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="22"
                fontWeight="800"
                fontFamily="DM Sans, sans-serif"
              >
                {pct}%
              </text>
              <text
                x="60"
                y="74"
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontFamily="DM Sans, sans-serif"
              >
                {scores.total}/{totalMarks}
              </text>
            </svg>
          </div>

          <p style={styles.timeTaken}>
            Completed in{" "}
            <strong style={{ color: "#e2e8f0" }}>
              {formatTime(timeTaken)}
            </strong>
          </p>
        </div>

        {/* Section breakdown */}
        <div style={styles.breakdownRow}>
          {sectionBreakdown.map(({ label, score, color }) => {
            const sectionPct = getPct(score, Math.ceil(totalMarks / 3));
            return (
              <div key={label} style={styles.breakdownCard}>
                <span
                  style={{
                    ...styles.sectionLabel,
                    color,
                  }}
                >
                  {label}
                </span>
                <span style={{ ...styles.sectionScore, color }}>{score}</span>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min(sectionPct, 100)}%`,
                      background: color,
                    }}
                  />
                </div>
                <span style={styles.sectionPct}>
                  {Math.min(sectionPct, 100)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* MCQ Answers Review */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Aptitude — Answer Review</h2>
          <div style={styles.answersGrid}>
            {result.aptitudeAnswers?.map((a, i) => (
              <div
                key={i}
                style={{
                  ...styles.answerChip,
                  background: a.isCorrect ? "#022c22" : "#1e0a0a",
                  border: `1px solid ${a.isCorrect ? "#065f46" : "#7f1d1d"}`,
                }}
              >
                <span style={styles.answerNum}>Q{i + 1}</span>
                <span
                  style={{
                    color: a.isCorrect ? "#6ee7b7" : "#fca5a5",
                    fontSize: "0.8rem",
                  }}
                >
                  {a.isCorrect ? "✓" : "✕"}
                </span>
                <span style={styles.answerMark}>+{a.marksAwarded}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Technical — Answer Review</h2>
          <div style={styles.answersGrid}>
            {result.technicalAnswers?.map((a, i) => (
              <div
                key={i}
                style={{
                  ...styles.answerChip,
                  background: a.isCorrect ? "#022c22" : "#1e0a0a",
                  border: `1px solid ${a.isCorrect ? "#065f46" : "#7f1d1d"}`,
                }}
              >
                <span style={styles.answerNum}>Q{i + 1}</span>
                <span
                  style={{
                    color: a.isCorrect ? "#6ee7b7" : "#fca5a5",
                    fontSize: "0.8rem",
                  }}
                >
                  {a.isCorrect ? "✓" : "✕"}
                </span>
                <span style={styles.answerMark}>+{a.marksAwarded}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coding submissions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Coding — Submissions</h2>
          {result.codingAnswers?.length === 0 && (
            <p style={{ color: "#475569", fontSize: "0.88rem" }}>
              No coding problems in this assessment.
            </p>
          )}
          {result.codingAnswers?.map((a, i) => (
            <div key={i} style={styles.codeCard}>
              <div style={styles.codeCardHeader}>
                <span style={styles.codeCardTitle}>Problem {i + 1}</span>
                <span style={styles.codeLang}>{a.language}</span>
                <span style={{ color: "#f59e0b", fontSize: "0.85rem" }}>
                  {a.marksAwarded} marks awarded
                </span>
              </div>
              <pre style={styles.codeSnippet}>
                {a.code || "No code submitted"}
              </pre>
            </div>
          ))}
        </div>

        {/* Footer message */}
        <div
          style={{
            ...styles.footerMsg,
            background: isPassed ? "#022c22" : "#1e0a0a",
            border: `1px solid ${isPassed ? "#065f46" : "#7f1d1d"}`,
          }}
        >
          <p style={{ color: isPassed ? "#6ee7b7" : "#fca5a5", margin: 0 }}>
            {isPassed
              ? "Congratulations! You have passed this assessment. The employer will be in touch with next steps."
              : "You did not meet the passing criteria this time. Better luck next time!"}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "2rem 1rem 4rem",
  },
  center: {
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
  container: { maxWidth: "760px", margin: "0 auto" },
  hero: {
    textAlign: "center",
    padding: "2rem 0",
    marginBottom: "2rem",
  },
  resultBadge: {
    display: "inline-block",
    padding: "5px 18px",
    borderRadius: "999px",
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    marginBottom: "1rem",
  },
  heroTitle: {
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "#e2e8f0",
    margin: "0 0 1.5rem",
  },
  scoreRingWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1rem",
  },
  timeTaken: {
    color: "#64748b",
    fontSize: "0.9rem",
    margin: 0,
  },
  breakdownRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "2rem",
  },
  breakdownCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  sectionLabel: {
    fontSize: "0.72rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  sectionScore: {
    fontSize: "2rem",
    fontWeight: 800,
    lineHeight: 1,
  },
  progressBar: {
    height: "4px",
    background: "#1e293b",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.8s ease",
  },
  sectionPct: { fontSize: "0.78rem", color: "#475569" },
  section: { marginBottom: "2rem" },
  sectionTitle: {
    fontSize: "0.78rem",
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 1rem",
  },
  answersGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  answerChip: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    borderRadius: "6px",
    padding: "5px 10px",
  },
  answerNum: { fontSize: "0.75rem", color: "#64748b" },
  answerMark: { fontSize: "0.72rem", color: "#475569" },
  codeCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "1rem",
  },
  codeCardHeader: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    padding: "0.7rem 1rem",
    borderBottom: "1px solid #1e293b",
  },
  codeCardTitle: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: 600,
  },
  codeLang: {
    background: "#1e293b",
    color: "#64748b",
    fontSize: "0.72rem",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  codeSnippet: {
    padding: "1rem",
    margin: 0,
    fontSize: "0.8rem",
    color: "#94a3b8",
    fontFamily: "monospace",
    lineHeight: 1.7,
    overflowX: "auto",
    maxHeight: "200px",
    overflow: "auto",
  },
  footerMsg: {
    borderRadius: "10px",
    padding: "1.25rem",
    textAlign: "center",
    fontSize: "0.9rem",
    lineHeight: 1.6,
  },
};
