// Verify Resume documents have textContent
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const Resume = (await import("./models/resume.model.js")).default;
const resumes = await Resume.find({}).lean();
for (const r of resumes) {
  console.log("Resume:", r._id.toString());
  console.log("  filename:", r.filename);
  console.log("  textContent length:", (r.textContent || "").length);
  console.log("  preview:", (r.textContent || "").slice(0, 150));
}

await mongoose.disconnect();
process.exit(0);
