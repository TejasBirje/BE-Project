import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { BASE_URL } from "../../../utils/apiPaths";

// ── Send Invite Modal ──────────────────────────────────────────────────────────
// function SendInviteModal({ assessment, onClose }) {
//   const [candidateId, setCandidateId] = useState("");
//   const [jobId, setJobId] = useState(
//     assessment.jobId?._id || assessment.jobId || "",
//   );
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleSend = async () => {
//     if (!candidateId.trim()) {
//       setError("Please enter a Candidate ID");
//       return;
//     }
//     setLoading(true);
//     setError("");
//     try {
//       const token = localStorage.getItem("token");
//       await axios.post(
//         `${BASE_URL}/api/assessments/invite`,
//         {
//           assessmentId: assessment._id,
//           candidateId: candidateId.trim(),
//           jobId: jobId.trim(),
//         },
//         { headers: { Authorization: `Bearer ${token}` } },
//       );
//       setSuccess("Invite sent successfully! Candidate will receive an email.");
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to send invite");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={modal.overlay} onClick={onClose}>
//       <div style={modal.box} onClick={(e) => e.stopPropagation()}>
//         <div style={modal.header}>
//           <div>
//             <p style={modal.label}>SEND ASSESSMENT INVITE</p>
//             <h3 style={modal.title}>{assessment.title}</h3>
//           </div>
//           <button style={modal.closeBtn} onClick={onClose}>
//             ✕
//           </button>
//         </div>

//         {success ? (
//           <div style={modal.successBlock}>
//             <div style={modal.successIcon}>✓</div>
//             <p style={modal.successText}>{success}</p>
//             <button style={modal.doneBtn} onClick={onClose}>
//               Done
//             </button>
//           </div>
//         ) : (
//           <>
//             <div style={modal.infoRow}>
//               {[
//                 { label: "Aptitude", val: `${assessment.aptitudeCount} Qs` },
//                 { label: "Technical", val: `${assessment.technicalCount} Qs` },
//                 {
//                   label: "Coding",
//                   val: `${assessment.codingProblems?.length || 0} Problems`,
//                 },
//                 {
//                   label: "Total Time",
//                   val: `${
//                     (assessment.timeLimit?.aptitude || 0) +
//                     (assessment.timeLimit?.technical || 0) +
//                     (assessment.timeLimit?.coding || 0)
//                   } min`,
//                 },
//               ].map(({ label, val }) => (
//                 <div key={label} style={modal.infoChip}>
//                   <span style={modal.chipLabel}>{label}</span>
//                   <span style={modal.chipVal}>{val}</span>
//                 </div>
//               ))}
//             </div>

//             <div style={modal.formGroup}>
//               <label style={modal.formLabel}>Candidate ID *</label>
//               <input
//                 style={modal.input}
//                 placeholder="Paste MongoDB ObjectId of candidate"
//                 value={candidateId}
//                 onChange={(e) => setCandidateId(e.target.value)}
//               />
//               <p style={modal.hint}>
//                 Find this on the candidate's profile or application page.
//               </p>
//             </div>

//             <div style={modal.formGroup}>
//               <label style={modal.formLabel}>Job ID</label>
//               <input
//                 style={modal.input}
//                 placeholder="Job ID (auto-filled if available)"
//                 value={jobId}
//                 onChange={(e) => setJobId(e.target.value)}
//               />
//             </div>

//             {error && <div style={modal.errorBox}>{error}</div>}

//             <div style={modal.actions}>
//               <button style={modal.cancelBtn} onClick={onClose}>
//                 Cancel
//               </button>
//               <button
//                 style={{ ...modal.sendBtn, opacity: loading ? 0.6 : 1 }}
//                 onClick={handleSend}
//                 disabled={loading}
//               >
//                 {loading ? "Sending..." : "Send Invite →"}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

function SendInviteModal({ assessment, onClose }) {
  // ✅ CHANGED: removed candidateId state, added atsScoreCutoff
  const [atsScoreCutoff, setAtsScoreCutoff] = useState(60);
  const [jobId, setJobId] = useState(
    assessment.jobId?._id || assessment.jobId || "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [summary, setSummary] = useState(null); // ✅ ADDED: to show results summary

  const handleSend = async () => {
    // ✅ CHANGED: removed candidateId validation, added atsScoreCutoff validation
    if (atsScoreCutoff < 0 || atsScoreCutoff > 100) {
      setError("ATS cutoff must be between 0 and 100");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/api/assessments/invite`,
        {
          assessmentId: assessment._id,
          jobId: jobId.trim(),
          atsScoreCutoff: Number(atsScoreCutoff), // ✅ CHANGED: was candidateId, now atsScoreCutoff
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSummary(res.data.summary); // ✅ ADDED: store summary from backend
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invites");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modal.overlay} onClick={onClose}>
      <div style={modal.box} onClick={(e) => e.stopPropagation()}>
        <div style={modal.header}>
          <div>
            <p style={modal.label}>SEND ASSESSMENT INVITE</p>
            <h3 style={modal.title}>{assessment.title}</h3>
          </div>
          <button style={modal.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* ✅ CHANGED: success block now shows summary cards instead of plain text */}
        {success ? (
          <div style={modal.successBlock}>
            <div style={modal.successIcon}>✓</div>
            <p style={modal.successText}>{success}</p>

            {/* Summary cards */}
            {summary && (
              <div style={modal.summaryGrid}>
                {[
                  {
                    label: "Qualified",
                    val: summary.totalQualified,
                    color: "#818cf8",
                  },
                  {
                    label: "Invites Sent",
                    val: summary.sent,
                    color: "#6ee7b7",
                  },
                  {
                    label: "Already Invited",
                    val: summary.skipped,
                    color: "#fbbf24",
                  },
                  {
                    label: "Failed",
                    val: summary.failed,
                    color: "#fca5a5",
                  },
                ].map(({ label, val, color }) => (
                  <div key={label} style={modal.summaryCard}>
                    <span style={{ ...modal.summaryVal, color }}>{val}</span>
                    <span style={modal.summaryLabel}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            <button style={modal.doneBtn} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Assessment info chips — unchanged */}
            <div style={modal.infoRow}>
              {[
                { label: "Aptitude", val: `${assessment.aptitudeCount} Qs` },
                { label: "Technical", val: `${assessment.technicalCount} Qs` },
                {
                  label: "Coding",
                  val: `${assessment.codingProblems?.length || 0} Problems`,
                },
                {
                  label: "Total Time",
                  val: `${
                    (assessment.timeLimit?.aptitude || 0) +
                    (assessment.timeLimit?.technical || 0) +
                    (assessment.timeLimit?.coding || 0)
                  } min`,
                },
              ].map(({ label, val }) => (
                <div key={label} style={modal.infoChip}>
                  <span style={modal.chipLabel}>{label}</span>
                  <span style={modal.chipVal}>{val}</span>
                </div>
              ))}
            </div>

            {/* ✅ CHANGED: removed Candidate ID input, replaced with ATS cutoff input */}
            <div style={modal.formGroup}>
              <label style={modal.formLabel}>
                Minimum ATS Score Cutoff (%)
              </label>
              <div style={modal.sliderWrapper}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={atsScoreCutoff}
                  onChange={(e) => setAtsScoreCutoff(Number(e.target.value))}
                  style={modal.slider}
                />
                <span style={modal.sliderVal}>{atsScoreCutoff}%</span>
              </div>
              <p style={modal.hint}>
                All candidates who applied to this job with ATS score ≥{" "}
                <strong style={{ color: "#e2e8f0" }}>{atsScoreCutoff}%</strong>{" "}
                will receive an invite automatically.
              </p>
            </div>

            {/* ✅ KEPT: Job ID field — still needed by backend */}
            <div style={modal.formGroup}>
              <label style={modal.formLabel}>Job ID</label>
              <input
                style={modal.input}
                placeholder="Job ID (auto-filled if available)"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              />
            </div>

            {error && <div style={modal.errorBox}>{error}</div>}

            <div style={modal.actions}>
              <button style={modal.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button
                style={{ ...modal.sendBtn, opacity: loading ? 0.6 : 1 }}
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? "Sending Invites..." : "Send Invites →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Assessment Card ────────────────────────────────────────────────────────────
// function AssessmentCard({ assessment, onSendInvite }) {
//   const navigate = useNavigate();
//   const totalTime =
//     (assessment.timeLimit?.aptitude || 0) +
//     (assessment.timeLimit?.technical || 0) +
//     (assessment.timeLimit?.coding || 0);

//   const totalQuestions =
//     assessment.aptitudeCount +
//     assessment.technicalCount +
//     (assessment.codingProblems?.length || 0);

//   const created = new Date(assessment.createdAt).toLocaleDateString("en-IN", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",
//   });

//   return (
//     <div style={card.wrapper}>
//       {/* Top accent line */}
//       <div style={card.accent} />

//       <div style={card.body}>
//         {/* Title row */}
//         <div style={card.titleRow}>
//           <div style={card.titleBlock}>
//             <div style={card.statusDot} />
//             <h3 style={card.title}>{assessment.title}</h3>
//           </div>
//           <span style={card.dateBadge}>{created}</span>
//         </div>

//         {/* Job tag */}
//         {assessment.jobId?.title && (
//           <div style={card.jobTag}>
//             <span style={card.jobIcon}>💼</span>
//             {assessment.jobId.title}
//           </div>
//         )}

//         {/* Stats grid */}
//         <div style={card.statsGrid}>
//           <div style={card.stat}>
//             <span style={{ ...card.statVal, color: "#818cf8" }}>
//               {assessment.aptitudeCount}
//             </span>
//             <span style={card.statLabel}>Aptitude</span>
//           </div>
//           <div style={card.statDivider} />
//           <div style={card.stat}>
//             <span style={{ ...card.statVal, color: "#fbbf24" }}>
//               {assessment.technicalCount}
//             </span>
//             <span style={card.statLabel}>Technical</span>
//           </div>
//           <div style={card.statDivider} />
//           <div style={card.stat}>
//             <span style={{ ...card.statVal, color: "#34d399" }}>
//               {assessment.codingProblems?.length || 0}
//             </span>
//             <span style={card.statLabel}>Coding</span>
//           </div>
//           <div style={card.statDivider} />
//           <div style={card.stat}>
//             <span style={{ ...card.statVal, color: "#e2e8f0" }}>
//               {totalTime}
//             </span>
//             <span style={card.statLabel}>Minutes</span>
//           </div>
//           <div style={card.statDivider} />
//           <div style={card.stat}>
//             <span style={{ ...card.statVal, color: "#fb7185" }}>
//               {assessment.passingMarks}
//             </span>
//             <span style={card.statLabel}>Pass Marks</span>
//           </div>
//         </div>

//         {/* Time breakdown bar */}
//         <div style={card.timeBarWrapper}>
//           <div style={card.timeBarLabel}>Time split</div>
//           <div style={card.timeBar}>
//             <div
//               title={`Aptitude: ${assessment.timeLimit?.aptitude}min`}
//               style={{
//                 ...card.timeSegment,
//                 width: `${((assessment.timeLimit?.aptitude || 0) / totalTime) * 100}%`,
//                 background: "#6366f1",
//               }}
//             />
//             <div
//               title={`Technical: ${assessment.timeLimit?.technical}min`}
//               style={{
//                 ...card.timeSegment,
//                 width: `${((assessment.timeLimit?.technical || 0) / totalTime) * 100}%`,
//                 background: "#f59e0b",
//               }}
//             />
//             <div
//               title={`Coding: ${assessment.timeLimit?.coding}min`}
//               style={{
//                 ...card.timeSegment,
//                 width: `${((assessment.timeLimit?.coding || 0) / totalTime) * 100}%`,
//                 background: "#10b981",
//               }}
//             />
//           </div>
//           <div style={card.timeBarLegend}>
//             {[
//               {
//                 label: `Apt ${assessment.timeLimit?.aptitude}m`,
//                 color: "#6366f1",
//               },
//               {
//                 label: `Tech ${assessment.timeLimit?.technical}m`,
//                 color: "#f59e0b",
//               },
//               {
//                 label: `Code ${assessment.timeLimit?.coding}m`,
//                 color: "#10b981",
//               },
//             ].map(({ label, color }) => (
//               <span key={label} style={{ ...card.legendChip, color }}>
//                 <span style={{ ...card.legendDot, background: color }} />
//                 {label}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Actions */}
//       <div style={card.footer}>
//         <button
//           style={card.resultsBtn}
//           onClick={() =>
//             navigate(`/employer/assessments/${assessment._id}/results`)
//           }
//         >
//           <span>📊</span> View Results
//         </button>
//         <button style={card.inviteBtn} onClick={() => onSendInvite(assessment)}>
//           <span>✉</span> Send Invite
//         </button>
//       </div>
//     </div>
//   );
// }

function AssessmentCard({ assessment, onSendInvite, onDelete }) {
  const navigate = useNavigate();
  // ✅ NEW: delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const totalTime =
    (assessment.timeLimit?.aptitude || 0) +
    (assessment.timeLimit?.technical || 0) +
    (assessment.timeLimit?.coding || 0);

  const created = new Date(assessment.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div style={card.wrapper}>
      <div style={card.accent} />

      <div style={card.body}>
        {/* Title row */}
        <div style={card.titleRow}>
          <div style={card.titleBlock}>
            <div style={card.statusDot} />
            <h3 style={card.title}>{assessment.title}</h3>
          </div>
          <span style={card.dateBadge}>{created}</span>
        </div>

        {/* Job tag */}
        {assessment.jobId?.title && (
          <div style={card.jobTag}>
            <span style={card.jobIcon}>💼</span>
            {assessment.jobId.title}
          </div>
        )}

        {/* Stats grid */}
        <div style={card.statsGrid}>
          <div style={card.stat}>
            <span style={{ ...card.statVal, color: "#818cf8" }}>
              {assessment.aptitudeCount}
            </span>
            <span style={card.statLabel}>Aptitude</span>
          </div>
          <div style={card.statDivider} />
          <div style={card.stat}>
            <span style={{ ...card.statVal, color: "#fbbf24" }}>
              {assessment.technicalCount}
            </span>
            <span style={card.statLabel}>Technical</span>
          </div>
          <div style={card.statDivider} />
          <div style={card.stat}>
            <span style={{ ...card.statVal, color: "#34d399" }}>
              {assessment.codingProblems?.length || 0}
            </span>
            <span style={card.statLabel}>Coding</span>
          </div>
          <div style={card.statDivider} />
          <div style={card.stat}>
            <span style={{ ...card.statVal, color: "#e2e8f0" }}>
              {totalTime}
            </span>
            <span style={card.statLabel}>Minutes</span>
          </div>
          <div style={card.statDivider} />
          <div style={card.stat}>
            <span style={{ ...card.statVal, color: "#fb7185" }}>
              {assessment.passingMarks}
            </span>
            <span style={card.statLabel}>Pass Marks</span>
          </div>
        </div>

        {/* Time breakdown bar */}
        <div style={card.timeBarWrapper}>
          <div style={card.timeBarLabel}>Time split</div>
          <div style={card.timeBar}>
            <div
              title={`Aptitude: ${assessment.timeLimit?.aptitude}min`}
              style={{
                ...card.timeSegment,
                width: `${((assessment.timeLimit?.aptitude || 0) / totalTime) * 100}%`,
                background: "#6366f1",
              }}
            />
            <div
              title={`Technical: ${assessment.timeLimit?.technical}min`}
              style={{
                ...card.timeSegment,
                width: `${((assessment.timeLimit?.technical || 0) / totalTime) * 100}%`,
                background: "#f59e0b",
              }}
            />
            <div
              title={`Coding: ${assessment.timeLimit?.coding}min`}
              style={{
                ...card.timeSegment,
                width: `${((assessment.timeLimit?.coding || 0) / totalTime) * 100}%`,
                background: "#10b981",
              }}
            />
          </div>
          <div style={card.timeBarLegend}>
            {[
              {
                label: `Apt ${assessment.timeLimit?.aptitude}m`,
                color: "#6366f1",
              },
              {
                label: `Tech ${assessment.timeLimit?.technical}m`,
                color: "#f59e0b",
              },
              {
                label: `Code ${assessment.timeLimit?.coding}m`,
                color: "#10b981",
              },
            ].map(({ label, color }) => (
              <span key={label} style={{ ...card.legendChip, color }}>
                <span style={{ ...card.legendDot, background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ NEW: Delete confirmation bar — slides in when delete clicked */}
      {showDeleteConfirm && (
        <div style={card.deleteConfirm}>
          <div style={card.deleteConfirmLeft}>
            <span style={card.deleteWarningIcon}>⚠</span>
            <div>
              <p style={card.deleteConfirmTitle}>Delete this assessment?</p>
              <p style={card.deleteConfirmSub}>
                This will permanently remove "{assessment.title}" and all its
                results. This cannot be undone.
              </p>
            </div>
          </div>
          <div style={card.deleteConfirmBtns}>
            <button
              style={card.cancelDeleteBtn}
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </button>
            <button
              style={card.confirmDeleteBtn}
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete(assessment._id);
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={card.footer}>
        <button
          style={card.resultsBtn}
          onClick={() =>
            navigate(`/employer/assessments/${assessment._id}/results`)
          }
        >
          <span>📊</span> View Results
        </button>
        <button style={card.inviteBtn} onClick={() => onSendInvite(assessment)}>
          <span>✉</span> Send Invite
        </button>
        {/* ✅ NEW: Delete button */}
        <button
          style={card.deleteBtn}
          onClick={() => setShowDeleteConfirm(true)}
        >
          <span>🗑</span>
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function EmployerAssessments() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteTarget, setInviteTarget] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BASE_URL}/api/assessments/my-assessments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setAssessments(res.data.assessments);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load assessments");
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  const filtered = assessments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()),
  );

  // ✅ ADD this function inside EmployerAssessments component
  const handleDelete = async (assessmentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/assessments/${assessmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove from local state immediately — no need to refetch
      setAssessments((prev) => prev.filter((a) => a._id !== assessmentId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete assessment");
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div style={page.base}>
        <div style={page.loadCenter}>
          <div style={page.spinner} />
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            Loading assessments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={page.base}>
      {/* Subtle background grid */}
      <div style={page.bgGrid} />

      <div style={page.container}>
        {/* ── Header ── */}
        <div style={page.header}>
          <div style={page.headerLeft}>
            <span
              style={page.backText}
              onClick={() => navigate("/employer-dashboard")}
            >
              ← Back
            </span>
            <div style={page.breadcrumb}>
              <span style={page.breadcrumbItem}>Employer</span>
              <span style={page.breadcrumbSep}>/</span>
              <span style={page.breadcrumbActive}>Assessments</span>
            </div>
            <h1 style={page.title}>Assessments</h1>
            <p style={page.subtitle}>
              Manage and send online tests to shortlisted candidates
            </p>
          </div>

          <button
            style={page.createBtn}
            onClick={() => navigate("/employer/assessments/create")}
          >
            <span style={page.createIcon}>+</span>
            Create Assessment
          </button>
        </div>

        {/* ── Stats bar ── */}
        {assessments.length > 0 && (
          <div style={page.statsBar}>
            {[
              {
                label: "Total Assessments",
                val: assessments.length,
                color: "#6366f1",
              },
              {
                label: "Total Questions",
                val: assessments.reduce(
                  (acc, a) =>
                    acc +
                    a.aptitudeCount +
                    a.technicalCount +
                    (a.codingProblems?.length || 0),
                  0,
                ),
                color: "#f59e0b",
              },
              {
                label: "Active",
                val: assessments.filter((a) => a.isActive).length,
                color: "#10b981",
              },
            ].map(({ label, val, color }) => (
              <div key={label} style={page.statPill}>
                <span style={{ ...page.statNum, color }}>{val}</span>
                <span style={page.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Search ── */}
        {assessments.length > 0 && (
          <div style={page.searchWrapper}>
            <span style={page.searchIcon}>🔍</span>
            <input
              style={page.searchInput}
              placeholder="Search assessments by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button style={page.clearSearch} onClick={() => setSearch("")}>
                ✕
              </button>
            )}
          </div>
        )}

        {/* ── Error ── */}
        {error && <div style={page.errorBox}>{error}</div>}

        {/* ── Empty state ── */}
        {!loading && assessments.length === 0 && (
          <div style={page.emptyState}>
            <div style={page.emptyIcon}>📋</div>
            <h2 style={page.emptyTitle}>No assessments yet</h2>
            <p style={page.emptyText}>
              Create your first assessment to start testing candidates.
            </p>
            <button
              style={page.emptyBtn}
              onClick={() => navigate("/employer/assessments/create")}
            >
              Create First Assessment
            </button>
          </div>
        )}

        {/* ── No search results ── */}
        {filtered.length === 0 && assessments.length > 0 && (
          <div style={page.emptyState}>
            <p style={{ color: "#64748b" }}>No assessments match "{search}"</p>
          </div>
        )}

        {/* ── Cards grid ── */}
        {filtered.length > 0 && (
          <div style={page.grid}>
            {filtered.map((assessment) => (
              <AssessmentCard
                key={assessment._id}
                assessment={assessment}
                onSendInvite={setInviteTarget}
                onDelete={handleDelete} // ✅ add this to pass delete handler down to card
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Send Invite Modal ── */}
      {inviteTarget && (
        <SendInviteModal
          assessment={inviteTarget}
          onClose={() => setInviteTarget(null)}
        />
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const page = {
  base: {
    minHeight: "100vh",
    background: "#0a0f1e",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bgGrid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2.5rem 1.5rem 4rem",
    position: "relative",
    zIndex: 1,
  },
  loadCenter: {
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  headerLeft: { display: "flex", flexDirection: "column", gap: "0.3rem" },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    marginBottom: "0.2rem",
  },
  breadcrumbItem: { fontSize: "0.75rem", color: "#475569" },
  breadcrumbSep: { fontSize: "0.75rem", color: "#334155" },
  breadcrumbActive: { fontSize: "0.75rem", color: "#818cf8" },
  title: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#e2e8f0",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: "#64748b",
    margin: 0,
    fontSize: "0.9rem",
  },
  createBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0.7rem 1.4rem",
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
    boxShadow: "0 0 24px rgba(99,102,241,0.3)",
    transition: "box-shadow 0.2s",
    flexShrink: 0,
  },
  createIcon: {
    fontSize: "1.1rem",
    fontWeight: 400,
    lineHeight: 1,
  },
  statsBar: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  statPill: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "0.75rem 1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  statNum: {
    fontSize: "1.5rem",
    fontWeight: 800,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  searchIcon: {
    position: "absolute",
    left: "0.9rem",
    fontSize: "0.9rem",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "0.65rem 2.5rem 0.65rem 2.5rem",
    color: "#e2e8f0",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  clearSearch: {
    position: "absolute",
    right: "0.9rem",
    background: "transparent",
    border: "none",
    color: "#475569",
    cursor: "pointer",
    fontSize: "0.85rem",
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
    border: "1px dashed #1e293b",
    borderRadius: "16px",
    padding: "4rem 2rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  emptyIcon: {
    fontSize: "3rem",
    lineHeight: 1,
    opacity: 0.4,
  },
  emptyTitle: {
    color: "#e2e8f0",
    fontSize: "1.2rem",
    fontWeight: 700,
    margin: 0,
  },
  emptyText: {
    color: "#64748b",
    fontSize: "0.9rem",
    margin: 0,
  },
  emptyBtn: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem 1.5rem",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
    gap: "1.25rem",
  },
  backText: {
    fontSize: "0.9rem",
    color: "#6366f1",
    cursor: "pointer",
    marginBottom: "10px",
    display: "inline-block",
  },
};

const card = {
  wrapper: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "border-color 0.2s, transform 0.15s",
    cursor: "default",
  },
  accent: {
    height: "3px",
    background: "linear-gradient(90deg, #6366f1, #818cf8)",
  },
  body: {
    padding: "1.4rem 1.4rem 1rem",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.5rem",
  },
  titleBlock: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flex: 1,
    minWidth: 0,
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#10b981",
    flexShrink: 0,
    boxShadow: "0 0 6px #10b981",
  },
  title: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dateBadge: {
    fontSize: "0.7rem",
    color: "#475569",
    background: "#1e293b",
    padding: "3px 8px",
    borderRadius: "4px",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  jobTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "0.78rem",
    color: "#818cf8",
    background: "#1e1b4b",
    border: "1px solid #3730a3",
    padding: "3px 10px",
    borderRadius: "999px",
    width: "fit-content",
  },
  jobIcon: { fontSize: "0.75rem" },
  statsGrid: {
    display: "flex",
    alignItems: "center",
    background: "#1e293b",
    borderRadius: "8px",
    padding: "0.75rem 0",
  },
  stat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.2rem",
  },
  statVal: {
    fontSize: "1.2rem",
    fontWeight: 800,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "0.64rem",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statDivider: {
    width: "1px",
    height: "28px",
    background: "#334155",
  },
  timeBarWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  timeBarLabel: {
    fontSize: "0.65rem",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  timeBar: {
    display: "flex",
    height: "6px",
    borderRadius: "3px",
    overflow: "hidden",
    background: "#1e293b",
    gap: "1px",
  },
  timeSegment: {
    height: "100%",
    transition: "width 0.4s",
  },
  timeBarLegend: {
    display: "flex",
    gap: "0.75rem",
  },
  legendChip: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    fontSize: "0.7rem",
  },
  legendDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
  },
  footer: {
    display: "flex",
    gap: "0.6rem",
    padding: "0.9rem 1.4rem",
    borderTop: "1px solid #1e293b",
  },
  resultsBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    background: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "8px",
    padding: "0.55rem 0.8rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
  },
  inviteBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    background: "#6366f1",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    padding: "0.55rem 0.8rem",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 0 16px rgba(99,102,241,0.25)",
  },
  // ... all your existing card styles stay the same, add these:
  // ✅ NEW: delete confirmation bar
  deleteConfirm: {
    background: "#1a0a0a",
    border: "1px solid #7f1d1d",
    borderLeft: "4px solid #ef4444",
    margin: "0 0.75rem 0.75rem",
    borderRadius: "8px",
    padding: "0.9rem 1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
  },
  deleteConfirmLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
    flex: 1,
  },
  deleteWarningIcon: {
    fontSize: "1.1rem",
    color: "#f87171",
    flexShrink: 0,
    marginTop: "1px",
  },
  deleteConfirmTitle: {
    color: "#fca5a5",
    fontSize: "0.85rem",
    fontWeight: 700,
    margin: "0 0 0.2rem",
  },
  deleteConfirmSub: {
    color: "#64748b",
    fontSize: "0.75rem",
    margin: 0,
    lineHeight: 1.4,
  },
  deleteConfirmBtns: {
    display: "flex",
    gap: "0.5rem",
    flexShrink: 0,
    alignItems: "center",
  },
  cancelDeleteBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "6px",
    padding: "0.4rem 0.9rem",
    fontSize: "0.8rem",
    cursor: "pointer",
    fontWeight: 500,
  },
  confirmDeleteBtn: {
    background: "#ef4444",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    padding: "0.4rem 0.9rem",
    fontSize: "0.8rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 0 12px rgba(239,68,68,0.3)",
  },

  // ✅ NEW: delete icon button
  deleteBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#475569",
    borderRadius: "8px",
    padding: "0.55rem 0.65rem",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
    flexShrink: 0,
  },
};

const modal = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  box: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "480px",
    padding: "1.75rem",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.25rem",
  },
  label: {
    fontSize: "0.65rem",
    color: "#6366f1",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    margin: "0 0 0.25rem",
  },
  title: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#475569",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "4px",
    lineHeight: 1,
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: "0.5rem",
    marginBottom: "1.25rem",
  },
  infoChip: {
    background: "#1e293b",
    borderRadius: "8px",
    padding: "0.55rem 0.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.2rem",
  },
  chipLabel: {
    fontSize: "0.62rem",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  chipVal: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#e2e8f0",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    marginBottom: "1rem",
  },
  formLabel: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    fontWeight: 500,
  },
  input: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.6rem 0.9rem",
    color: "#e2e8f0",
    fontSize: "0.88rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "monospace",
  },
  hint: {
    fontSize: "0.73rem",
    color: "#475569",
    margin: 0,
  },
  errorBox: {
    background: "#1e0a0a",
    border: "1px solid #7f1d1d",
    borderRadius: "8px",
    color: "#fca5a5",
    padding: "0.6rem 0.9rem",
    fontSize: "0.85rem",
    marginBottom: "1rem",
  },
  actions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid #334155",
    color: "#94a3b8",
    borderRadius: "8px",
    padding: "0.6rem 1.2rem",
    fontSize: "0.88rem",
    cursor: "pointer",
    fontWeight: 500,
  },
  sendBtn: {
    background: "#6366f1",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    padding: "0.6rem 1.4rem",
    fontSize: "0.88rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(99,102,241,0.3)",
  },
  successBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem 0",
    textAlign: "center",
  },
  successIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#022c22",
    border: "1px solid #065f46",
    color: "#6ee7b7",
    fontSize: "1.4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  successText: {
    color: "#6ee7b7",
    fontSize: "0.9rem",
    margin: 0,
    lineHeight: 1.5,
  },
  doneBtn: {
    background: "#10b981",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    padding: "0.6rem 1.5rem",
    fontWeight: 700,
    fontSize: "0.88rem",
    cursor: "pointer",
    marginTop: "0.25rem",
  },
  // ... all your existing styles remain unchanged, add these new ones:
  sliderWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  slider: {
    flex: 1,
    accentColor: "#6366f1",
    cursor: "pointer",
    height: "4px",
  },
  sliderVal: {
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "#6366f1",
    minWidth: "48px",
    textAlign: "right",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: "0.5rem",
    width: "100%",
    margin: "0.5rem 0",
  },
  summaryCard: {
    background: "#1e293b",
    borderRadius: "8px",
    padding: "0.75rem 0.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.25rem",
  },
  summaryVal: {
    fontSize: "1.4rem",
    fontWeight: 800,
    lineHeight: 1,
  },
  summaryLabel: {
    fontSize: "0.62rem",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "center",
  },
};
