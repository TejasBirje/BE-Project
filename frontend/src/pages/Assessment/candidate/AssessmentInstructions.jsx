import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import { BASE_URL } from "../../../utils/apiPaths";

export default function AssessmentInstructions() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/attempt/invite/${token}`);
        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Invalid or expired invite link",
        );
      } finally {
        setLoading(false);
      }
    };
    validate();
  }, [token]);

  const handleStart = async () => {
    if (!agreed) return;
    setStarting(true);
    try {
      await axios.post(`${BASE_URL}/api/attempt/start/${token}`);
      navigate(`/assessment/${token}/test`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start assessment");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={{ color: "#64748b" }}>Validating your invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.center}>
          <div style={styles.errorCard}>
            <div style={styles.errorIcon}>✕</div>
            <h2 style={styles.errorTitle}>Link Invalid</h2>
            <p style={styles.errorMsg}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { assessment, invite } = data;
  const totalTime =
    assessment.timeLimit.aptitude +
    assessment.timeLimit.technical +
    assessment.timeLimit.coding;
  const totalQuestions =
    assessment.aptitudeCount +
    assessment.technicalCount +
    assessment.codingProblemsCount;

  const sections = [
    {
      label: "Aptitude",
      count: `${assessment.aptitudeCount} questions`,
      time: `${assessment.timeLimit.aptitude} min`,
      color: "#6366f1",
      desc: "Logical reasoning, quantitative aptitude, speed & distance",
    },
    {
      label: "Technical",
      count: `${assessment.technicalCount} questions`,
      time: `${assessment.timeLimit.technical} min`,
      color: "#f59e0b",
      desc: "DSA, OOP, databases, web concepts, algorithms",
    },
    {
      label: "Coding",
      count: `${assessment.codingProblemsCount} problems`,
      time: `${assessment.timeLimit.coding} min`,
      color: "#10b981",
      desc: "Write and submit code solutions in your preferred language",
    },
  ];

  const rules = [
    "Do not refresh the page during the assessment.",
    "Each section has its own timer. Once time runs out, it moves to the next section automatically.",
    "MCQ answers are auto-saved every 30 seconds.",
    "You cannot go back to a previous section once submitted.",
    "Switching tabs will be detected and logged.",
    "The assessment must be completed in one sitting.",
    "Ensure stable internet before starting.",
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div style={styles.logo}>JobPortal</div>
          <div style={styles.expiry}>
            Link valid until:{" "}
            <strong style={{ color: "#e2e8f0" }}>
              {new Date(invite.expiresAt).toLocaleDateString()}
            </strong>
          </div>
        </div>

        {/* Hero */}
        <div style={styles.hero}>
          <span style={styles.heroBadge}>ONLINE ASSESSMENT</span>
          <h1 style={styles.heroTitle}>{assessment.title}</h1>
          <div style={styles.heroStats}>
            <div style={styles.heroStat}>
              <span style={styles.heroStatVal}>{totalQuestions}</span>
              <span style={styles.heroStatLabel}>Total Questions</span>
            </div>
            <div style={styles.heroDivider} />
            <div style={styles.heroStat}>
              <span style={styles.heroStatVal}>{totalTime}</span>
              <span style={styles.heroStatLabel}>Total Minutes</span>
            </div>
            <div style={styles.heroDivider} />
            <div style={styles.heroStat}>
              <span style={styles.heroStatVal}>{assessment.passingMarks}</span>
              <span style={styles.heroStatLabel}>Passing Marks</span>
            </div>
            <div style={styles.heroDivider} />
            <div style={styles.heroStat}>
              <span style={styles.heroStatVal}>3</span>
              <span style={styles.heroStatLabel}>Sections</span>
            </div>
          </div>
        </div>

        <div style={styles.body}>
          {/* Sections */}
          <div style={styles.sectionsGrid}>
            {sections.map((sec, i) => (
              <div
                key={i}
                style={{
                  ...styles.sectionCard,
                  borderTop: `3px solid ${sec.color}`,
                }}
              >
                <div style={styles.sectionTop}>
                  <span
                    style={{
                      ...styles.sectionLabel,
                      color: sec.color,
                    }}
                  >
                    {sec.label}
                  </span>
                  <span style={styles.sectionTime}>{sec.time}</span>
                </div>
                <div style={{ ...styles.sectionCount, color: sec.color }}>
                  {sec.count}
                </div>
                <p style={styles.sectionDesc}>{sec.desc}</p>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div style={styles.rulesCard}>
            <h2 style={styles.rulesTitle}>Rules & Guidelines</h2>
            <ul style={styles.rulesList}>
              {rules.map((rule, i) => (
                <li key={i} style={styles.ruleItem}>
                  <span style={styles.ruleDot} />
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Agreement + Start */}
          <div style={styles.startCard}>
            <label style={styles.agreeRow}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.agreeText}>
                I have read all the instructions and agree to the rules. I
                understand that cheating or malpractice will result in
                disqualification.
              </span>
            </label>

            {error && <div style={styles.inlineError}>{error}</div>}

            <button
              style={{
                ...styles.startBtn,
                opacity: agreed && !starting ? 1 : 0.4,
                cursor: agreed && !starting ? "pointer" : "not-allowed",
              }}
              onClick={handleStart}
              disabled={!agreed || starting}
            >
              {starting ? "Starting..." : "Start Assessment →"}
            </button>
          </div>
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
    background: "#0f172a",
    border: "1px solid #7f1d1d",
    borderRadius: "16px",
    padding: "3rem",
    textAlign: "center",
    maxWidth: "400px",
  },
  errorIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#1e0a0a",
    color: "#ef4444",
    fontSize: "1.4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem",
  },
  errorTitle: { color: "#e2e8f0", margin: "0 0 0.5rem" },
  errorMsg: { color: "#64748b", fontSize: "0.9rem" },
  container: { maxWidth: "860px", margin: "0 auto", padding: "0 1rem 3rem" },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem 0",
    borderBottom: "1px solid #1e293b",
    marginBottom: "2.5rem",
  },
  logo: {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "#6366f1",
    letterSpacing: "-0.02em",
  },
  expiry: { fontSize: "0.82rem", color: "#64748b" },
  hero: {
    textAlign: "center",
    marginBottom: "2.5rem",
  },
  heroBadge: {
    display: "inline-block",
    background: "#1e1b4b",
    color: "#818cf8",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    padding: "4px 12px",
    borderRadius: "999px",
    border: "1px solid #3730a3",
    marginBottom: "1rem",
  },
  heroTitle: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#e2e8f0",
    margin: "0 0 1.5rem",
    lineHeight: 1.2,
  },
  heroStats: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "2rem",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem 2rem",
    // display: "inline-flex",
  },
  heroStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.2rem",
  },
  heroStatVal: {
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "#e2e8f0",
  },
  heroStatLabel: {
    fontSize: "0.72rem",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  heroDivider: {
    width: "1px",
    height: "36px",
    background: "#1e293b",
  },
  body: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  sectionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
  },
  sectionCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "1.25rem",
  },
  sectionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.4rem",
  },
  sectionLabel: {
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  sectionTime: {
    fontSize: "0.75rem",
    color: "#475569",
    background: "#1e293b",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  sectionCount: {
    fontSize: "1.1rem",
    fontWeight: 700,
    marginBottom: "0.4rem",
  },
  sectionDesc: {
    fontSize: "0.8rem",
    color: "#64748b",
    lineHeight: 1.5,
    margin: 0,
  },
  rulesCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "1.5rem",
  },
  rulesTitle: {
    fontSize: "0.82rem",
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 1rem",
  },
  rulesList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  ruleItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    fontSize: "0.88rem",
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  ruleDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#334155",
    flexShrink: 0,
    marginTop: "7px",
  },
  startCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  agreeRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    cursor: "pointer",
  },
  checkbox: { marginTop: "3px", accentColor: "#6366f1", cursor: "pointer" },
  agreeText: { fontSize: "0.88rem", color: "#94a3b8", lineHeight: 1.5 },
  inlineError: {
    background: "#1e0a0a",
    border: "1px solid #7f1d1d",
    borderRadius: "6px",
    color: "#fca5a5",
    padding: "0.6rem 0.9rem",
    fontSize: "0.85rem",
  },
  startBtn: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.9rem",
    fontSize: "1rem",
    fontWeight: 700,
    width: "100%",
    letterSpacing: "0.02em",
    transition: "opacity 0.2s",
  },
};
