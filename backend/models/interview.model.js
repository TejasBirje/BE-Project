import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
  jobDescription: { type: String, default: "" },
  questionLimit: { type: Number, default: 5 },
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
  keywords: [
    {
      keyword: String,
      score: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Interview", interviewSchema);
