import mongoose from "mongoose";

const assessmentInviteSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "started", "completed", "expired"],
      default: "pending",
    },
    invitedAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    submittedAt: { type: Date },
    expiresAt: {
      type: Date,
      required: true,
      // invite link expires in 7 days by default
    },
  },
  { timestamps: true },
);

const AssessmentInvite = mongoose.model(
  "AssessmentInvite",
  assessmentInviteSchema,
);
export default AssessmentInvite;
