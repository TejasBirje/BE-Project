// One-time migration: re-extract text for Resume docs with empty textContent
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
await mongoose.connect(process.env.MONGO_URI);

const Resume = (await import("./models/resume.model.js")).default;
const { extractPdfText } = await import("./controllers/user.controller.js");

const resumes = await Resume.find({
  $or: [{ textContent: "" }, { textContent: null }],
});
console.log("Found", resumes.length, "resumes with empty textContent");

for (const r of resumes) {
  const filePath = path.join(__dirname, "uploads", r.filename);
  if (!fs.existsSync(filePath)) {
    console.log("SKIP (file missing):", r.filename);
    continue;
  }
  const text = await extractPdfText(filePath);
  if (text) {
    r.textContent = text;
    await r.save();
    console.log("✅ REPAIRED:", r._id.toString(), "—", text.length, "chars");
  } else {
    console.log("❌ FAILED:", r._id.toString());
  }
}

await mongoose.disconnect();
console.log("Done.");
process.exit(0);
