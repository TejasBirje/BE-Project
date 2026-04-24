import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
  jobDescription: { type: String, default: "" },
  questionLimit: { type: Number, default: 5 },
  responses: [
    {
      question: { type: String, default: "" },
      answer: { type: String, default: "" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  questions: [
    {
      question: String,
      topic: String,
      difficulty: String,
      similarity: Number,
    },
  ],
  messages: [
    {
      role: String, // 'user' or 'model'
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  status: { type: String, default: "ongoing" }, // 'ongoing' or 'completed'
  feedback: {
    technicalScore: Number, // 0-10
    communicationScore: Number, // 0-10
    strengths: [String],
    weaknesses: [String],
    summary: String,
  },
  atsScore: { type: Number, default: null },
  tabSwitchDetected: { type: Boolean, default: false },
  terminationReason: {
    type: String,
    enum: ["completed", "manual", "tab_switch", null],
    default: null,
  },
  keywords: [
    {
      keyword: String,
      score: Number,
    },
  ],
  cheatingFlags: [
    {
      type: {
        type: String,
        enum: [
          "TAB_SWITCH",
          "NO_FACE",
          "MULTIPLE_FACES",
          "LOOKING_AWAY",
          "PHONE_DETECTED",
        ],
      },
      timestamp: { type: Number, required: true },
    },
  ],
  aiScore: {
    label: {
      type: String,
      enum: ["AI", "HUMAN", null],
      default: null,
    },
    score: { type: Number, default: null },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Interview", interviewSchema);
