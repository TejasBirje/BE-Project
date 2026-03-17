import mongoose from "mongoose";

const mcqAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  selectedOption: { type: String, default: null },
  isCorrect: { type: Boolean, default: false },
  marksAwarded: { type: Number, default: 0 },
});

const codingAnswerSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId },
  code: { type: String, default: "" },
  language: { type: String, default: "javascript" },
  testResults: [
    {
      input: String,
      expectedOutput: String,
      actualOutput: String,
      passed: Boolean,
    },
  ],
  marksAwarded: { type: Number, default: 0 },
});

const assessmentSubmissionSchema = new mongoose.Schema(
  {
    inviteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentInvite",
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    // questions that were randomly selected for this candidate
    aptitudeQuestions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    ],
    technicalQuestions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    ],
    // candidate's answers
    aptitudeAnswers: [mcqAnswerSchema],
    technicalAnswers: [mcqAnswerSchema],
    codingAnswers: [codingAnswerSchema],
    scores: {
      aptitude: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      coding: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    totalMarks: { type: Number, default: 0 },
    isPassed: { type: Boolean, default: false },
    timeTaken: { type: Number }, // in seconds
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
  },
  { timestamps: true },
);

const AssessmentSubmission = mongoose.model(
  "AssessmentSubmission",
  assessmentSubmissionSchema,
);
export default AssessmentSubmission;
