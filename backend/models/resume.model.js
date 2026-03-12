import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true }, // accessible URL  e.g. http://localhost:5000/uploads/xxx.pdf
  textContent: { type: String, default: "" }, // raw extracted text (for ATS / interview)
  skills: [String],
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Resume", resumeSchema);
