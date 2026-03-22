import mongoose from "mongoose";

// Question schema (Mongoose)
const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ["aptitude", "technical"], required: true },
  questionText: String,
  options: [String],
  correctAnswer: String,
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  topic: String,
  marks: { type: Number, default: 1 }, // ✅ ADDED THIS LINE
});

const Question = mongoose.model("Question", questionSchema);
export default Question;
