import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import Resume from "../models/resume.model.js";
import { extractPdfText } from "./user.controller.js";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_BASE = process.env.PYTHON_BASE || "http://localhost:8000";

// ── Helper: compute ATS score from Python microservice ──
// Accepts either a resumeId (looks up textContent) OR a direct resumeText string.
// If the Resume doc has empty textContent, auto-repairs by re-extracting from PDF.
async function computeAtsScore(resumeId, jobDescription, resumeText = null) {
  try {
    if (!jobDescription) return null;

    let text = resumeText;
    if (!text && resumeId) {
      const resume = await Resume.findById(resumeId);
      text = resume?.textContent?.trim() || null;

      // Auto-repair: if textContent is empty but the file exists, re-extract
      if (!text && resume?.filename) {
        console.log(
          `🔧 Auto-repairing empty textContent for resume ${resumeId}…`
        );
        const filePath = path.join(__dirname, "../uploads", resume.filename);
        if (fs.existsSync(filePath)) {
          text = await extractPdfText(filePath);
          if (text) {
            resume.textContent = text;
            await resume.save();
            console.log(`✅ Resume ${resumeId} repaired: ${text.length} chars`);
          }
        }
      }
    }

    if (!text) {
      console.warn("⚠️  ATS skipped: no resume text available");
      return null;
    }

    console.log(`🐍 Calling Python ATS service…`);
    const { data } = await axios.post(
      `${PYTHON_BASE}/calculate_weighted_score`,
      { jd: jobDescription, resume: text },
      { timeout: 60000 }
    );
    console.log(`✅ Python ATS responded: score=${data?.ats_score}`);
    return data;
  } catch (err) {
    console.warn("⚠️  ATS scoring failed:", err.message);
    return null;
  }
}

// ── Helper: persist ATS result into an application doc ──
async function saveAtsResult(applicationId, atsResult) {
  if (!atsResult || atsResult.ats_score == null) return;
  await Application.findByIdAndUpdate(
    applicationId,
    {
      $set: {
        atsScore: atsResult.ats_score,
        atsBreakdown: atsResult.breakdown || null,
        "atsKeywords.matched": atsResult.keywords?.matched || [],
        "atsKeywords.missing": atsResult.keywords?.missing || [],
      },
    },
    { new: true }
  );
  console.log(
    `💾 ATS score ${atsResult.ats_score} saved → application ${applicationId}`
  );
}

export const applyToJob = async (req, res) => {
  try {

    const job = await Job.findById(req.params.jobId).select(
      "description requirements company"
    );

    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only job seekers can apply" });
    }

    const existing = await Application.findOne({
      job: req.params.jobId,
      applicant: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    // Use the user's Resume ObjectId — falls back to null if none uploaded yet
    const resumeObjectId = req.user.resumeId || null;

    // Create the application first
    const application = await Application.create({
      job: req.params.jobId,
      company: job.company || "Amazon Web Services",
      applicant: req.user._id,
      resume: resumeObjectId,
    }); // Compute ATS score asynchronously — don't block the response
    
    if (job && resumeObjectId) {
      const jd = `${job.description}\n${job.requirements}`;
      computeAtsScore(resumeObjectId, jd)
        .then((atsResult) => saveAtsResult(application._id, atsResult))
        .catch((e) => console.warn("ATS async update failed:", e.message));
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ applicant: req.user._id })
      .populate("job", "title company location type description requirements")
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // GET all applicants for a job (employer)
// export const getApplicantsForJob = async (req, res) => {
//     try {
//         const job = await Job.findById(req.params.jobId);

//         if(!job || job.company.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ message: "Not authorized to view applicants"})
//         }

//         const apps = await Application.find({ job: req.params.jobId }).populate("job", "title location category type")

//         res.json(apps);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

export const getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job || job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view applicants" });
    }
    const apps = await Application.find({ job: req.params.jobId })
      .populate("job", "title location category type description requirements")
      .populate("applicant", "name email avatar resume resumeId")
      .populate("resume", "filename fileUrl skills uploadedAt");

    // Sort by ATS score descending (null scores go to bottom)
    apps.sort((a, b) => {
      const sa = a.atsScore ?? -1;
      const sb = b.atsScore ?? -1;
      return sb - sa;
    });

    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET application by ID (jobseeker or employer)
export const getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("job", "title")
      .populate("applicant", "name email avatar resume resumeId")
      .populate("resume", "filename fileUrl skills uploadedAt");

    if (!app)
      return res
        .status(404)
        .json({ message: "Application not found", id: req.params.id });

    const isOwner =
      app.applicant._id.toString() === req.user._id.toString() ||
      app.job.company.toString() === req.user._id.toString();

    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this application" });
    }

    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update application status (Employer)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findById(req.params.id).populate("job");

    if (!app || app.job.company.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this application" });
    }

    app.status = status;
    await app.save();

    res.json({ message: "Application status updated to ", status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/applications/:id/invite — Employer sends AI interview invite ──
export const sendInterviewInvite = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("job")
      .populate("applicant");

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Authorization check
    if (app.job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Generate AI interview link
    const interviewLink = `http://localhost:5173/interview/review/${app._id}`;

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: app.applicant.email,
      subject: "AI Interview Invitation",
      html: `
<div style="background:#f3f4f6;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <div style="
      max-width:620px;
      margin:auto;
      background:white;
      border-radius:12px;
      overflow:hidden;
      box-shadow:0 6px 18px rgba(0,0,0,0.08);
  ">
    
    <!-- Header -->
    <div style="
        background:linear-gradient(135deg,#6d28d9,#4f46e5);
        padding:32px;
        text-align:center;
        color:white;
    ">
      <h1 style="margin:0;font-size:30px;">AI Interview Invitation</h1>
      <p style="margin-top:8px;font-size:16px;opacity:0.9;">
        You've been shortlisted for the next stage
      </p>
    </div>

    <!-- Content -->
    <div style="padding:40px 34px;text-align:center;color:#374151;">
      
      <h2 style="font-size:24px;margin-bottom:10px;">
        Hi ${app.applicant.name},
      </h2>

      <p style="font-size:17px;line-height:1.7;margin-bottom:18px;">
        Congratulations! After reviewing your application, 
        <b>${req.user.name}</b> has shortlisted you for the next stage 
        of the hiring process for the position of 
        <b style="color:#4f46e5;">${app.job.title}</b>.
      </p>

      <p style="font-size:16px;margin-bottom:30px;">
        Please begin your <b>AI-powered interview</b> by clicking the button below.
      </p>

      <!-- Button -->
      <a href="${interviewLink}" style="
          display:inline-block;
          padding:15px 36px;
          background:#6d28d9;
          color:white;
          font-size:17px;
          font-weight:bold;
          text-decoration:none;
          border-radius:8px;
          box-shadow:0 4px 12px rgba(0,0,0,0.18);
      ">
        Start AI Interview
      </a>

      <p style="
          margin-top:28px;
          font-size:14px;
          color:#6b7280;
          line-height:1.6;
      ">
        The interview will take approximately <b>5–10 minutes</b>.  
        Please complete it at your earliest convenience.
      </p>

      <!-- Backup link -->
      <p style="margin-top:18px;font-size:13px;color:#9ca3af;">
        If the button doesn't work, copy and paste this link into your browser:
        <br>
        <span style="color:#4f46e5;">${interviewLink}</span>
      </p>

    </div>

    <!-- Footer -->
    <div style="
        background:#f9fafb;
        padding:24px;
        text-align:center;
        font-size:14px;
        color:#6b7280;
    ">
      <p style="margin:0;">
        Best of luck with your interview!
      </p>

      <p style="margin-top:8px;font-size:15px;color:#374151;">
        <b>${req.user.name}</b><br>
      </p>
    </div>

  </div>
</div>
`
    });

    // Update DB
    app.interviewInvited = true;
    await app.save();

    res.json({
      message: "AI Interview invitation sent",
      applicationId: app._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/applications/:id/recalculate-ats — Employer triggers re-scoring ──
export const recalculateAts = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("job", "title description requirements company")
      .populate("resume", "textContent");

    if (!app) return res.status(404).json({ message: "Application not found" });

    if (app.job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const resumeText = app.resume?.textContent?.trim();
    if (!resumeText) {
      return res.status(400).json({
        message: "No resume text found — candidate must upload a PDF resume",
      });
    }

    const jd = `${app.job.description}\n${app.job.requirements}`;

    console.log(`🔁 Re-calculating ATS for application ${app._id}…`);
    const atsResult = await computeAtsScore(null, jd, resumeText);

    if (!atsResult || atsResult.ats_score == null) {
      return res.status(502).json({
        message:
          "Python ATS service returned no score. Is the Python server running?",
      });
    }

    await Application.findByIdAndUpdate(app._id, {
      $set: {
        atsScore: atsResult.ats_score,
        atsBreakdown: atsResult.breakdown || null,
        "atsKeywords.matched": atsResult.keywords?.matched || [],
        "atsKeywords.missing": atsResult.keywords?.missing || [],
      },
    });

    res.json({
      message: "ATS score recalculated",
      atsScore: atsResult.ats_score,
      atsBreakdown: atsResult.breakdown,
      atsKeywords: atsResult.keywords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
