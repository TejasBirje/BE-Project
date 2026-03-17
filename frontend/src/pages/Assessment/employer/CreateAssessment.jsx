import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { BASE_URL } from "../../../utils/apiPaths";

const emptyProblem = () => ({
  title: "",
  description: "",
  sampleInput: "",
  sampleOutput: "",
  testCases: [{ input: "", output: "" }],
  marks: 10,
});

export default function CreateAssessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=basic, 2=coding, 3=review
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    jobId: "",
    aptitudeCount: 10,
    technicalCount: 10,
    passingMarks: 50,
    timeLimit: { aptitude: 20, technical: 20, coding: 40 },
    codingProblems: [emptyProblem()],
  });

  const updateField = (field, value) =>
    setForm((p) => ({ ...p, [field]: value }));

  const updateTimeLimit = (section, value) =>
    setForm((p) => ({
      ...p,
      timeLimit: { ...p.timeLimit, [section]: Number(value) },
    }));

  const updateProblem = (idx, field, value) => {
    const updated = [...form.codingProblems];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm((p) => ({ ...p, codingProblems: updated }));
  };

  const updateTestCase = (probIdx, tcIdx, field, value) => {
    const updated = [...form.codingProblems];
    updated[probIdx].testCases[tcIdx] = {
      ...updated[probIdx].testCases[tcIdx],
      [field]: value,
    };
    setForm((p) => ({ ...p, codingProblems: updated }));
  };

  const addTestCase = (probIdx) => {
    const updated = [...form.codingProblems];
    updated[probIdx].testCases.push({ input: "", output: "" });
    setForm((p) => ({ ...p, codingProblems: updated }));
  };

  const removeTestCase = (probIdx, tcIdx) => {
    const updated = [...form.codingProblems];
    updated[probIdx].testCases = updated[probIdx].testCases.filter(
      (_, i) => i !== tcIdx,
    );
    setForm((p) => ({ ...p, codingProblems: updated }));
  };

  const addProblem = () =>
    setForm((p) => ({
      ...p,
      codingProblems: [...p.codingProblems, emptyProblem()],
    }));

  const removeProblem = (idx) =>
    setForm((p) => ({
      ...p,
      codingProblems: p.codingProblems.filter((_, i) => i !== idx),
    }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${BASE_URL}/api/assessments/create`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Assessment created successfully!");
      setTimeout(() => navigate("/employer/assessments"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  };

  const totalTime =
    form.timeLimit.aptitude + form.timeLimit.technical + form.timeLimit.coding;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.badge}>NEW</span>
            <h1 style={styles.title}>Create Assessment</h1>
          </div>
          <p style={styles.subtitle}>
            Configure an online test for your candidates
          </p>
        </div>

        {/* Step Indicator */}
        <div style={styles.steps}>
          {["Basic Setup", "Coding Problems", "Review & Create"].map(
            (label, i) => {
              const num = i + 1;
              const active = step === num;
              const done = step > num;
              return (
                <div key={num} style={styles.stepItem}>
                  <div
                    style={{
                      ...styles.stepCircle,
                      background: done
                        ? "#10b981"
                        : active
                          ? "#6366f1"
                          : "#1e293b",
                      border: `2px solid ${
                        done ? "#10b981" : active ? "#6366f1" : "#334155"
                      }`,
                    }}
                  >
                    {done ? "✓" : num}
                  </div>
                  <span
                    style={{
                      ...styles.stepLabel,
                      color: active ? "#e2e8f0" : "#64748b",
                    }}
                  >
                    {label}
                  </span>
                  {i < 2 && <div style={styles.stepLine} />}
                </div>
              );
            },
          )}
        </div>

        {/* Error / Success */}
        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        {/* ── STEP 1: Basic Setup ── */}
        {step === 1 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Assessment Details</h2>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Assessment Title *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Full Stack Developer Test"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Job ID *</label>
                <input
                  style={styles.input}
                  placeholder="Paste the Job ID here"
                  value={form.jobId}
                  onChange={(e) => updateField("jobId", e.target.value)}
                />
              </div>
            </div>

            <h2 style={{ ...styles.cardTitle, marginTop: "2rem" }}>
              Question Count
            </h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Aptitude Questions</label>
                <div style={styles.counterRow}>
                  <button
                    style={styles.counterBtn}
                    onClick={() =>
                      updateField(
                        "aptitudeCount",
                        Math.max(1, form.aptitudeCount - 1),
                      )
                    }
                  >
                    −
                  </button>
                  <span style={styles.counterVal}>{form.aptitudeCount}</span>
                  <button
                    style={styles.counterBtn}
                    onClick={() =>
                      updateField("aptitudeCount", form.aptitudeCount + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Technical Questions</label>
                <div style={styles.counterRow}>
                  <button
                    style={styles.counterBtn}
                    onClick={() =>
                      updateField(
                        "technicalCount",
                        Math.max(1, form.technicalCount - 1),
                      )
                    }
                  >
                    −
                  </button>
                  <span style={styles.counterVal}>{form.technicalCount}</span>
                  <button
                    style={styles.counterBtn}
                    onClick={() =>
                      updateField("technicalCount", form.technicalCount + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <h2 style={{ ...styles.cardTitle, marginTop: "2rem" }}>
              Time Limits (minutes)
            </h2>
            <div style={styles.timeLimitGrid}>
              {[
                { key: "aptitude", label: "Aptitude", color: "#6366f1" },
                { key: "technical", label: "Technical", color: "#f59e0b" },
                { key: "coding", label: "Coding", color: "#10b981" },
              ].map(({ key, label, color }) => (
                <div
                  key={key}
                  style={{
                    ...styles.timeCard,
                    borderTop: `3px solid ${color}`,
                  }}
                >
                  <span style={styles.timeLabel}>{label}</span>
                  <input
                    type="number"
                    style={styles.timeInput}
                    value={form.timeLimit[key]}
                    min={5}
                    onChange={(e) => updateTimeLimit(key, e.target.value)}
                  />
                  <span style={styles.timeUnit}>min</span>
                </div>
              ))}
            </div>
            <p style={styles.totalTime}>
              Total assessment time:{" "}
              <strong style={{ color: "#e2e8f0" }}>{totalTime} minutes</strong>
            </p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Passing Marks</label>
              <input
                type="number"
                style={{ ...styles.input, width: "160px" }}
                value={form.passingMarks}
                min={1}
                onChange={(e) =>
                  updateField("passingMarks", Number(e.target.value))
                }
              />
            </div>

            <div style={styles.actionRow}>
              <button
                style={styles.primaryBtn}
                onClick={() => {
                  if (!form.title || !form.jobId) {
                    setError("Please fill in Title and Job ID");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
              >
                Next: Coding Problems →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Coding Problems ── */}
        {step === 2 && (
          <div>
            {form.codingProblems.map((prob, pi) => (
              <div key={pi} style={{ ...styles.card, marginBottom: "1.5rem" }}>
                <div style={styles.problemHeader}>
                  <h2 style={styles.cardTitle}>Problem {pi + 1}</h2>
                  {form.codingProblems.length > 1 && (
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeProblem(pi)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Problem Title *</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. Two Sum"
                    value={prob.title}
                    onChange={(e) => updateProblem(pi, "title", e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Problem Description *</label>
                  <textarea
                    style={styles.textarea}
                    rows={5}
                    placeholder="Describe the problem clearly with examples..."
                    value={prob.description}
                    onChange={(e) =>
                      updateProblem(pi, "description", e.target.value)
                    }
                  />
                </div>

                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Sample Input</label>
                    <textarea
                      style={styles.textarea}
                      rows={3}
                      placeholder="[2, 7, 11, 15], target = 9"
                      value={prob.sampleInput}
                      onChange={(e) =>
                        updateProblem(pi, "sampleInput", e.target.value)
                      }
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Sample Output</label>
                    <textarea
                      style={styles.textarea}
                      rows={3}
                      placeholder="[0, 1]"
                      value={prob.sampleOutput}
                      onChange={(e) =>
                        updateProblem(pi, "sampleOutput", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Marks</label>
                  <input
                    type="number"
                    style={{ ...styles.input, width: "120px" }}
                    value={prob.marks}
                    min={1}
                    onChange={(e) =>
                      updateProblem(pi, "marks", Number(e.target.value))
                    }
                  />
                </div>

                {/* Test Cases */}
                <div style={styles.testCasesSection}>
                  <div style={styles.tcHeader}>
                    <span style={styles.tcTitle}>Test Cases (hidden)</span>
                    <button
                      style={styles.addTcBtn}
                      onClick={() => addTestCase(pi)}
                    >
                      + Add Test Case
                    </button>
                  </div>
                  {prob.testCases.map((tc, ti) => (
                    <div key={ti} style={styles.tcRow}>
                      <span style={styles.tcNum}>#{ti + 1}</span>
                      <div style={styles.tcFields}>
                        <input
                          style={styles.tcInput}
                          placeholder="Input"
                          value={tc.input}
                          onChange={(e) =>
                            updateTestCase(pi, ti, "input", e.target.value)
                          }
                        />
                        <input
                          style={styles.tcInput}
                          placeholder="Expected Output"
                          value={tc.output}
                          onChange={(e) =>
                            updateTestCase(pi, ti, "output", e.target.value)
                          }
                        />
                      </div>
                      {prob.testCases.length > 1 && (
                        <button
                          style={styles.removeTcBtn}
                          onClick={() => removeTestCase(pi, ti)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button style={styles.addProblemBtn} onClick={addProblem}>
              + Add Another Problem
            </button>

            <div style={styles.actionRow}>
              <button style={styles.ghostBtn} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button style={styles.primaryBtn} onClick={() => setStep(3)}>
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Review Assessment</h2>

            <div style={styles.reviewGrid}>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Title</span>
                <span style={styles.reviewVal}>{form.title}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Job ID</span>
                <span style={styles.reviewVal}>{form.jobId}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Aptitude Questions</span>
                <span style={styles.reviewVal}>{form.aptitudeCount}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Technical Questions</span>
                <span style={styles.reviewVal}>{form.technicalCount}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Coding Problems</span>
                <span style={styles.reviewVal}>
                  {form.codingProblems.length}
                </span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Passing Marks</span>
                <span style={styles.reviewVal}>{form.passingMarks}</span>
              </div>
              <div style={styles.reviewItem}>
                <span style={styles.reviewLabel}>Total Time</span>
                <span style={styles.reviewVal}>{totalTime} minutes</span>
              </div>
            </div>

            <div style={styles.reviewProblems}>
              <p style={styles.reviewLabel}>Coding Problems:</p>
              {form.codingProblems.map((p, i) => (
                <div key={i} style={styles.reviewProblemChip}>
                  <strong>P{i + 1}:</strong> {p.title || "Untitled"} — {p.marks}{" "}
                  marks, {p.testCases.length} test case(s)
                </div>
              ))}
            </div>

            <div style={styles.actionRow}>
              <button style={styles.ghostBtn} onClick={() => setStep(2)}>
                ← Back
              </button>
              <button
                style={{
                  ...styles.primaryBtn,
                  opacity: loading ? 0.7 : 1,
                }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Assessment"}
              </button>
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
  container: {
    maxWidth: "860px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "2rem",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "0.4rem",
  },
  badge: {
    background: "#6366f1",
    color: "#fff",
    fontSize: "0.65rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    margin: 0,
    fontSize: "0.95rem",
  },
  steps: {
    display: "flex",
    alignItems: "center",
    marginBottom: "2rem",
    gap: 0,
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  stepCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  stepLabel: {
    fontSize: "0.82rem",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  stepLine: {
    width: "60px",
    height: "1px",
    background: "#1e293b",
    margin: "0 0.5rem",
  },
  card: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "2rem",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 1.25rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    marginBottom: "1rem",
  },
  label: {
    fontSize: "0.82rem",
    color: "#94a3b8",
    fontWeight: 500,
  },
  input: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.6rem 0.9rem",
    color: "#e2e8f0",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.6rem 0.9rem",
    color: "#e2e8f0",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  counterRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  counterBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#e2e8f0",
    fontSize: "1.2rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  counterVal: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#e2e8f0",
    minWidth: "32px",
    textAlign: "center",
  },
  timeLimitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginBottom: "0.75rem",
  },
  timeCard: {
    background: "#1e293b",
    borderRadius: "10px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
  },
  timeLabel: {
    fontSize: "0.78rem",
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  timeInput: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "6px",
    padding: "0.4rem 0.6rem",
    color: "#e2e8f0",
    fontSize: "1.3rem",
    fontWeight: 700,
    textAlign: "center",
    width: "80px",
    outline: "none",
  },
  timeUnit: {
    fontSize: "0.75rem",
    color: "#475569",
  },
  totalTime: {
    color: "#64748b",
    fontSize: "0.85rem",
    marginBottom: "1.5rem",
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "2rem",
  },
  primaryBtn: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem 1.6rem",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  ghostBtn: {
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.7rem 1.4rem",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
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
  successBox: {
    background: "#022c22",
    border: "1px solid #065f46",
    borderRadius: "8px",
    color: "#6ee7b7",
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    fontSize: "0.88rem",
  },
  problemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
  },
  removeBtn: {
    background: "transparent",
    border: "1px solid #7f1d1d",
    color: "#f87171",
    borderRadius: "6px",
    padding: "4px 12px",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  testCasesSection: {
    background: "#0a0f1e",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "1rem",
    marginTop: "0.5rem",
  },
  tcHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  tcTitle: {
    fontSize: "0.82rem",
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  addTcBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "0.78rem",
    cursor: "pointer",
  },
  tcRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "0.5rem",
  },
  tcNum: {
    color: "#475569",
    fontSize: "0.78rem",
    minWidth: "24px",
  },
  tcFields: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.5rem",
    flex: 1,
  },
  tcInput: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "6px",
    padding: "0.4rem 0.6rem",
    color: "#e2e8f0",
    fontSize: "0.82rem",
    outline: "none",
    fontFamily: "monospace",
  },
  removeTcBtn: {
    background: "transparent",
    border: "none",
    color: "#475569",
    cursor: "pointer",
    fontSize: "0.9rem",
    padding: "4px",
  },
  addProblemBtn: {
    width: "100%",
    background: "transparent",
    border: "1px dashed #334155",
    color: "#64748b",
    borderRadius: "10px",
    padding: "0.9rem",
    fontSize: "0.9rem",
    cursor: "pointer",
    marginBottom: "1.5rem",
    transition: "border-color 0.2s",
  },
  reviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },
  reviewItem: {
    background: "#1e293b",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewLabel: {
    fontSize: "0.82rem",
    color: "#64748b",
  },
  reviewVal: {
    fontSize: "0.9rem",
    color: "#e2e8f0",
    fontWeight: 600,
  },
  reviewProblems: {
    marginBottom: "1rem",
  },
  reviewProblemChip: {
    background: "#1e293b",
    borderRadius: "6px",
    padding: "0.5rem 0.9rem",
    fontSize: "0.85rem",
    color: "#94a3b8",
    marginTop: "0.4rem",
  },
};
