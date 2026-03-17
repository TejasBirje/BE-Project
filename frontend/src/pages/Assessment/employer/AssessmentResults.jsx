import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import { BASE_URL } from "../../../utils/apiPaths";

export default function AssessmentResults() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [subRes, asRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/assessments/${assessmentId}/results`, {
            headers,
          }),
          axios.get(`${BASE_URL}/api/assessments/${assessmentId}`, { headers }),
        ]);

        setSubmissions(subRes.data.submissions);
        setAssessment(asRes.data.assessment);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [assessmentId]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getScoreColor = (score, total) => {
    const pct = (score / total) * 100;
    if (pct >= 70) return "#10b981";
    if (pct >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getScorePct = (score, total) =>
    total > 0 ? Math.round((score / total) * 100) : 0;

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCenter}>
          <div style={styles.spinner} />
          <p style={{ color: "#64748b" }}>Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button
            style={styles.backBtn}
            onClick={() => navigate("/employer/assessments")}
          >
            ← Back
          </button>
          <div>
            <h1 style={styles.title}>
              {assessment?.title || "Assessment Results"}
            </h1>
            <p style={styles.subtitle}>
              {submissions.length} candidate
              {submissions.length !== 1 ? "s" : ""} completed
            </p>
          </div>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Stats Row */}
        {submissions.length > 0 && (
          <div style={styles.statsRow}>
            {[
              {
                label: "Total Appeared",
                val: submissions.length,
                color: "#6366f1",
              },
              {
                label: "Passed",
                val: submissions.filter((s) => s.isPassed).length,
                color: "#10b981",
              },
              {
                label: "Failed",
                val: submissions.filter((s) => !s.isPassed).length,
                color: "#ef4444",
              },
              {
                label: "Avg Score",
                val:
                  Math.round(
                    submissions.reduce((acc, s) => acc + s.scores.total, 0) /
                      submissions.length,
                  ) + " pts",
                color: "#f59e0b",
              },
            ].map(({ label, val, color }) => (
              <div key={label} style={styles.statCard}>
                <span style={{ ...styles.statVal, color }}>{val}</span>
                <span style={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {submissions.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ color: "#64748b", fontSize: "1rem" }}>
              No submissions yet for this assessment.
            </p>
          </div>
        ) : (
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    "Candidate",
                    "Aptitude",
                    "Technical",
                    "Coding",
                    "Total",
                    "Time Taken",
                    "Status",
                    "",
                  ].map((h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const pct = getScorePct(sub.scores.total, sub.totalMarks);
                  const color = getScoreColor(sub.scores.total, sub.totalMarks);
                  return (
                    <tr
                      key={sub._id}
                      style={styles.tr}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#1e293b")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={styles.td}>
                        <div style={styles.candidateName}>
                          {sub.candidateId?.name || "N/A"}
                        </div>
                        <div style={styles.candidateEmail}>
                          {sub.candidateId?.email || ""}
                        </div>
                      </td>
                      <td style={styles.td}>{sub.scores.aptitude}</td>
                      <td style={styles.td}>{sub.scores.technical}</td>
                      <td style={styles.td}>{sub.scores.coding}</td>
                      <td style={styles.td}>
                        <div style={styles.scoreCell}>
                          <span style={{ color, fontWeight: 700 }}>
                            {sub.scores.total}
                          </span>
                          <span style={styles.scoreDenom}>
                            /{sub.totalMarks}
                          </span>
                          <span style={{ color, fontSize: "0.75rem" }}>
                            ({pct}%)
                          </span>
                        </div>
                      </td>
                      <td style={styles.td}>{formatTime(sub.timeTaken)}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            background: sub.isPassed ? "#022c22" : "#1e0a0a",
                            color: sub.isPassed ? "#6ee7b7" : "#fca5a5",
                            border: `1px solid ${
                              sub.isPassed ? "#065f46" : "#7f1d1d"
                            }`,
                          }}
                        >
                          {sub.isPassed ? "Passed" : "Failed"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.viewBtn}
                          onClick={() =>
                            setSelected(selected?._id === sub._id ? null : sub)
                          }
                        >
                          {selected?._id === sub._id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Panel */}
        {selected && (
          <div style={styles.detailPanel}>
            <div style={styles.detailHeader}>
              <h3 style={styles.detailTitle}>
                Detailed Report — {selected.candidateId?.name}
              </h3>
              <button style={styles.closeBtn} onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>

            {/* Score Breakdown */}
            <div style={styles.breakdownGrid}>
              {[
                {
                  label: "Aptitude",
                  score: selected.scores.aptitude,
                  color: "#6366f1",
                },
                {
                  label: "Technical",
                  score: selected.scores.technical,
                  color: "#f59e0b",
                },
                {
                  label: "Coding",
                  score: selected.scores.coding,
                  color: "#10b981",
                },
                {
                  label: "Total",
                  score: selected.scores.total,
                  color: "#e2e8f0",
                },
              ].map(({ label, score, color }) => (
                <div key={label} style={styles.breakdownCard}>
                  <span style={{ ...styles.breakdownScore, color }}>
                    {score}
                  </span>
                  <span style={styles.breakdownLabel}>{label}</span>
                </div>
              ))}
            </div>

            {/* MCQ Answer breakdown */}
            <div style={styles.sectionBlock}>
              <p style={styles.sectionTitle}>Aptitude Answers</p>
              <div style={styles.answerList}>
                {selected.aptitudeAnswers?.map((a, i) => (
                  <div key={i} style={styles.answerRow}>
                    <span
                      style={{
                        ...styles.answerDot,
                        background: a.isCorrect ? "#10b981" : "#ef4444",
                      }}
                    />
                    <span style={styles.answerText}>
                      Q{i + 1}: {a.selectedOption || "Not attempted"} —{" "}
                      {a.marksAwarded} marks
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.sectionBlock}>
              <p style={styles.sectionTitle}>Technical Answers</p>
              <div style={styles.answerList}>
                {selected.technicalAnswers?.map((a, i) => (
                  <div key={i} style={styles.answerRow}>
                    <span
                      style={{
                        ...styles.answerDot,
                        background: a.isCorrect ? "#10b981" : "#ef4444",
                      }}
                    />
                    <span style={styles.answerText}>
                      Q{i + 1}: {a.selectedOption || "Not attempted"} —{" "}
                      {a.marksAwarded} marks
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.sectionBlock}>
              <p style={styles.sectionTitle}>Coding Submissions</p>
              {selected.codingAnswers?.map((a, i) => (
                <div key={i} style={styles.codeBlock}>
                  <div style={styles.codeBlockHeader}>
                    <span>Problem {i + 1}</span>
                    <span style={{ color: "#f59e0b" }}>
                      {a.marksAwarded} marks
                    </span>
                    <span style={styles.langTag}>{a.language}</span>
                  </div>
                  <pre style={styles.codeSnippet}>
                    {a.code || "No code submitted"}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    padding: "2rem 1rem",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  container: { maxWidth: "1100px", margin: "0 auto" },
  loadingCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
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
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  backBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontSize: "0.85rem",
    marginTop: "4px",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: 0,
  },
  subtitle: { color: "#64748b", margin: "0.25rem 0 0", fontSize: "0.9rem" },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  statCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  statVal: { fontSize: "1.8rem", fontWeight: 800 },
  statLabel: {
    fontSize: "0.78rem",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  errorBox: {
    background: "#1e0a0a",
    border: "1px solid #7f1d1d",
    borderRadius: "8px",
    color: "#fca5a5",
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    fontSize: "0.88rem",
  },
  emptyState: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "3rem",
    textAlign: "center",
  },
  tableCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "1.5rem",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.9rem 1rem",
    textAlign: "left",
    fontSize: "0.75rem",
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #1e293b",
  },
  tr: { transition: "background 0.15s", cursor: "pointer" },
  td: {
    padding: "0.9rem 1rem",
    fontSize: "0.88rem",
    color: "#cbd5e1",
    borderBottom: "1px solid #0f172a",
  },
  candidateName: { fontWeight: 600, color: "#e2e8f0" },
  candidateEmail: { fontSize: "0.75rem", color: "#475569", marginTop: "2px" },
  scoreCell: { display: "flex", alignItems: "center", gap: "0.3rem" },
  scoreDenom: { color: "#475569", fontSize: "0.8rem" },
  badge: {
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  viewBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "6px",
    padding: "4px 12px",
    fontSize: "0.78rem",
    cursor: "pointer",
  },
  detailPanel: {
    background: "#0f172a",
    border: "1px solid #6366f1",
    borderRadius: "12px",
    padding: "1.5rem",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  detailTitle: {
    color: "#e2e8f0",
    fontSize: "1rem",
    fontWeight: 700,
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "1.1rem",
  },
  breakdownGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  breakdownCard: {
    background: "#1e293b",
    borderRadius: "8px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.3rem",
  },
  breakdownScore: { fontSize: "1.8rem", fontWeight: 800 },
  breakdownLabel: {
    fontSize: "0.75rem",
    color: "#64748b",
    textTransform: "uppercase",
  },
  sectionBlock: { marginBottom: "1.5rem" },
  sectionTitle: {
    fontSize: "0.78rem",
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "0.75rem",
  },
  answerList: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  answerRow: { display: "flex", alignItems: "center", gap: "0.6rem" },
  answerDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  answerText: { fontSize: "0.85rem", color: "#94a3b8" },
  codeBlock: {
    background: "#0a0f1e",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    marginBottom: "0.75rem",
    overflow: "hidden",
  },
  codeBlockHeader: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    padding: "0.5rem 0.9rem",
    borderBottom: "1px solid #1e293b",
    fontSize: "0.82rem",
    color: "#94a3b8",
  },
  langTag: {
    background: "#1e293b",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.72rem",
    color: "#64748b",
  },
  codeSnippet: {
    padding: "0.9rem",
    margin: 0,
    fontSize: "0.78rem",
    color: "#94a3b8",
    overflowX: "auto",
    fontFamily: "monospace",
    lineHeight: 1.6,
    maxHeight: "200px",
    overflow: "auto",
  },
};
