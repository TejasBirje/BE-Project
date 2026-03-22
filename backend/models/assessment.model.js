import mongoose from "mongoose";

// const codingProblemSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   sampleInput: { type: String },
//   sampleOutput: { type: String },
//   testCases: [
//     {
//       input: { type: String, required: true },
//       output: { type: String, required: true },
//     },
//   ],
//   marks: { type: Number, default: 10 },
// });

const codingProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  sampleInput: { type: String },
  sampleOutput: { type: String },
  testCases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
    },
  ],
  marks: { type: Number, default: 10 },

  // ✅ NEW: driver template per language
  // Employer writes this when creating the problem
  // Contains // CANDIDATE_CODE_HERE placeholder
  // where candidate function gets inserted
  driverTemplates: {
    javascript: { type: String, default: "" },
    python: { type: String, default: "" },
    java: { type: String, default: "" },
    cpp: { type: String, default: "" },
    c: { type: String, default: "" },
  },

  // ✅ NEW: function signature starter per language
  // This is what candidate sees in the editor
  // when they open the problem
  functionSignatures: {
    javascript: { type: String, default: "" },
    python: { type: String, default: "" },
    java: { type: String, default: "" },
    cpp: { type: String, default: "" },
    c: { type: String, default: "" },
  },
});

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    aptitudeCount: { type: Number, required: true, default: 10 },
    technicalCount: { type: Number, required: true, default: 10 },
    codingProblems: [codingProblemSchema],
    timeLimit: {
      aptitude: { type: Number, default: 20 }, // in minutes
      technical: { type: Number, default: 20 },
      coding: { type: Number, default: 40 },
    },
    passingMarks: { type: Number, default: 50 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Assessment = mongoose.model("Assessment", assessmentSchema);
export default Assessment;
