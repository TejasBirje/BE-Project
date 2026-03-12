import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to the Resume document — avoids storing duplicate resume data
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Rejected", "Accepted"],
      default: "Applied",
    }, // ── ATS Score (computed by Python microservice on apply) ──
    atsScore: {
      type: Number,
      default: null,
    },
    // Stored as Mixed so the sub-doc is only written when the score exists
    atsBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    atsKeywords: {
      matched: { type: [String], default: [] },
      missing: { type: [String], default: [] },
    },

    // ── Interview Invite — employer sends this before candidate can start ──
    interviewInvited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
