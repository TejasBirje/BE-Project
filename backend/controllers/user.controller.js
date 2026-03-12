import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.model.js";
import Resume from "../models/resume.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract plain text from a PDF file using pdf-parse v2 (ESM, PDFParse class).
 * Returns empty string on any failure so the upload still succeeds.
 */
export async function extractPdfText(absoluteFilePath) {
  try {
    const { PDFParse } = await import("pdf-parse");
    const buffer = fs.readFileSync(absoluteFilePath);
    const uint8 = new Uint8Array(buffer);
    const parser = new PDFParse({ data: uint8 });
    await parser.load();
    const result = await parser.getText(); // { pages: [{ text: string }] }
    const fullText = result.pages.map((p) => p.text).join("\n");
    console.log(`📄 Extracted ${fullText.length} chars from PDF`);
    return fullText;
  } catch (err) {
    console.warn("⚠️  PDF text extraction failed:", err.message);
    return "";
  }
}

// ── PUT /api/user/profile ──
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, companyName, companyDescription, companyLogo } =
      req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;

    if (user.role === "employer") {
      user.companyName = companyName || user.companyName;
      user.companyDescription = companyDescription || user.companyDescription;
      user.companyLogo = companyLogo || user.companyLogo;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
      resume: user.resume || "",
      resumeId: user.resumeId || null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/user/upload-resume ──
// Accepts a PDF via multer, creates a Resume document, updates User.resume + User.resumeId
export const uploadResume = async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only job seekers can upload a resume" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Build the public URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`; // If user already had a resume doc, delete the old one + file
    if (user.resumeId) {
      const oldResume = await Resume.findById(user.resumeId);
      if (oldResume) {
        const oldFile = path.join(__dirname, "../uploads", oldResume.filename);
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
        await Resume.findByIdAndDelete(user.resumeId);
      }
    }

    // Extract raw text from PDF using absolute path (pdf-parse v2 API)
    const absoluteFilePath = path.join(
      __dirname,
      "../uploads",
      req.file.filename
    );
    const textContent = await extractPdfText(absoluteFilePath);

    const resumeDoc = await Resume.create({
      userId: user._id,
      filename: req.file.filename,
      fileUrl,
      textContent,
      skills: [],
    });

    // Update user
    user.resume = fileUrl;
    user.resumeId = resumeDoc._id;
    await user.save();

    res.status(201).json({
      message: "Resume uploaded successfully",
      resumeId: resumeDoc._id,
      fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.log("uploadResume error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/user/resume ──
export const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Only jobseekers can delete resume" });
    }

    // Delete Resume document + physical file if it exists
    if (user.resumeId) {
      const resumeDoc = await Resume.findById(user.resumeId);
      if (resumeDoc) {
        const filePath = path.join(__dirname, "../uploads", resumeDoc.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await Resume.findByIdAndDelete(user.resumeId);
      }
    } else if (user.resume) {
      // Legacy: resume stored as URL only (no Resume doc) — try to delete file
      const fileName = user.resume.split("/").pop();
      const filePath = path.join(__dirname, "../uploads", fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    user.resume = "";
    user.resumeId = null;
    await user.save();

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/user/repair-resume — Re-extract text for current user's Resume doc ──
// Useful when the Resume was uploaded before pdf-parse was fixed
export const repairResumeText = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.resumeId) {
      return res.status(400).json({ message: "No resume on file to repair" });
    }

    const resumeDoc = await Resume.findById(user.resumeId);
    if (!resumeDoc) {
      return res.status(404).json({ message: "Resume document not found" });
    }

    const filePath = path.join(__dirname, "../uploads", resumeDoc.filename);
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "Resume PDF file not found on disk" });
    }

    const textContent = await extractPdfText(filePath);
    if (!textContent) {
      return res
        .status(500)
        .json({ message: "PDF text extraction returned empty" });
    }

    resumeDoc.textContent = textContent;
    await resumeDoc.save();

    console.log(
      `🔧 Repaired resume ${resumeDoc._id}: ${textContent.length} chars`
    );
    res.json({
      message: "Resume text repaired successfully",
      resumeId: resumeDoc._id,
      charsExtracted: textContent.length,
    });
  } catch (error) {
    console.error("repairResumeText error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/user/:id ──
export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
