import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InterviewSession from "../../components/interview/InterviewSession";

const InterviewPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // resumeId can come from URL param OR from the logged-in user's profile
  const resumeId = params.get("resumeId") || user?.resumeId || "";
  const jobDescription = params.get("jd")
    ? decodeURIComponent(params.get("jd"))
    : "";
  const questionLimit = parseInt(params.get("limit") || "5", 10);

  if (!resumeId) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0f0f0f",
          color: "#e8e8e8",
          fontFamily: "Inter, sans-serif",
          flexDirection: "column",
          gap: 16,
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <h2>No Resume Found</h2>
        <p style={{ color: "#8892b0", fontSize: 14, maxWidth: 400 }}>
          You need to upload a resume before starting an interview. Go to your
          profile and upload a PDF resume first.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => navigate("/profile")}
            style={{
              padding: "10px 24px",
              background: "linear-gradient(135deg, #00d4ff, #7c3aed)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Upload Resume
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 24px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              color: "#e8e8e8",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <InterviewSession
        resumeId={resumeId}
        jobDescription={jobDescription}
        questionLimit={questionLimit}
        userId={user?._id || null}
        onComplete={(data) => {
          console.log("Interview complete:", data);
        }}
        onEnd={() => navigate("/interview-history")}
      />
    </div>
  );
};

export default InterviewPage;
