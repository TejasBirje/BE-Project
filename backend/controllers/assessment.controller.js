import Application from "../models/application.model.js";
import Assessment from "../models/assessment.model.js";
import AssessmentInvite from "../models/assessmentInvite.model.js";
import AssessmentSubmission from "../models/assessmentSubmission.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

// ----------------------------
// Create Assessment (Employer)
// ----------------------------
export const createAssessment = async (req, res) => {
  try {
    const {
      title,
      jobId,
      aptitudeCount,
      technicalCount,
      codingProblems,
      timeLimit,
      passingMarks,
    } = req.body;

    const assessment = new Assessment({
      title,
      jobId,
      employerId: req.user._id,
      aptitudeCount,
      technicalCount,
      codingProblems,
      timeLimit,
      passingMarks,
    });

    await assessment.save();

    res.status(201).json({
      success: true,
      message: "Assessment created successfully",
      assessment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------
// Delete Assessment (Employer)
// ----------------------------
export const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.assessmentId);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Make sure only the owner can delete
    if (assessment.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this assessment",
      });
    }

    await Assessment.findByIdAndDelete(req.params.assessmentId);

    res.status(200).json({
      success: true,
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------
// Get All Assessments by Employer
// ----------------------------
export const getEmployerAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({
      employerId: req.user._id,
    }).populate("jobId", "title");

    res.status(200).json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------
// Get Single Assessment
// ----------------------------
export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(
      req.params.assessmentId,
    ).populate("jobId", "title");

    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });
    }

    res.status(200).json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------
// Send Invite to Candidate (Employer)
// ----------------------------
// export const sendAssessmentInvite = async (req, res) => {
//   try {
//     const { assessmentId, candidateId, jobId } = req.body;

//     // Check if invite already sent
//     const existingInvite = await AssessmentInvite.findOne({
//       assessmentId,
//       candidateId,
//     });

//     if (existingInvite) {
//       return res.status(400).json({
//         success: false,
//         message: "Invite already sent to this candidate",
//       });
//     }

//     // Generate unique token
//     const token = crypto.randomBytes(32).toString("hex");

//     // Set expiry to 7 days from now
//     const expiresAt = new Date();
//     expiresAt.setDate(expiresAt.getDate() + 7);

//     // Create invite document
//     const invite = new AssessmentInvite({
//       assessmentId,
//       candidateId,
//       employerId: req.user._id,
//       jobId,
//       token,
//       expiresAt,
//     });

//     await invite.save();

//     // Get candidate email
//     const candidate = await User.findById(candidateId);
//     if (!candidate) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Candidate not found" });
//     }

//     // Get assessment details
//     const assessment = await Assessment.findById(assessmentId);

//     // Send email
//     const assessmentLink = `${process.env.FRONTEND_URL}/assessment/${token}`;

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"Job Portal" <${process.env.EMAIL_USER}>`,
//       to: candidate.email,
//       subject: "You have been invited to take an Online Assessment",
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2>Online Assessment Invitation</h2>
//           <p>Dear ${candidate.name},</p>
//           <p>You have been invited to take an online assessment for <strong>${assessment.title}</strong>.</p>
//           <p><strong>Assessment Details:</strong></p>
//           <ul>
//             <li>Aptitude Questions: ${assessment.aptitudeCount}</li>
//             <li>Technical Questions: ${assessment.technicalCount}</li>
//             <li>Coding Problems: ${assessment.codingProblems.length}</li>
//             <li>This link is valid for 7 days</li>
//           </ul>
//           <p>Click the button below to start your assessment:</p>
//           <a href="${assessmentLink}"
//              style="background:#4F46E5;color:white;padding:12px 24px;
//                     text-decoration:none;border-radius:6px;display:inline-block;">
//             Start Assessment
//           </a>
//           <p style="margin-top:20px;color:#666;">
//             If the button doesn't work, copy this link: ${assessmentLink}
//           </p>
//         </div>
//       `,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Assessment invite sent successfully",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const sendAssessmentInvite = async (req, res) => {
  try {
    const { assessmentId, jobId, atsScoreCutoff = 0 } = req.body;

    // Validate assessment exists
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });
    }

    // Fetch all applications for this job that meet the ATS cutoff
    const applications = await Application.find({
      job: jobId, // ✅ "job" matches your model
      atsScore: { $gte: atsScoreCutoff },
    });

    if (applications.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No candidates meet the ATS cutoff score for this job",
        summary: {
          totalQualified: 0,
          sent: 0,
          skipped: 0,
          failed: 0,
        },
      });
    }

    // Setup email transporter once outside the loop
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let sentCount = 0;
    let skippedCount = 0;
    const failedCandidates = [];

    // Loop through each qualifying candidate
    for (const application of applications) {
      const candidateId = application.applicant; // ✅ "applicant" matches your model

      try {
        // Skip if invite already sent to this candidate for this assessment
        const existingInvite = await AssessmentInvite.findOne({
          assessmentId,
          candidateId,
        });

        if (existingInvite) {
          skippedCount++;
          continue;
        }

        // Generate unique token for each candidate
        const token = crypto.randomBytes(32).toString("hex");

        // Set expiry to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Create invite document
        const invite = new AssessmentInvite({
          assessmentId,
          candidateId,
          employerId: req.user._id,
          jobId,
          token,
          expiresAt,
        });

        await invite.save();

        // Get candidate details
        const candidate = await User.findById(candidateId);
        if (!candidate) {
          failedCandidates.push(candidateId);
          continue;
        }

        // Build unique link for this candidate
        const assessmentLink = `${process.env.FRONTEND_URL}/assessment/${token}`;

        // Send email
        await transporter.sendMail({
          from: `"Job Portal" <${process.env.EMAIL_USER}>`,
          to: candidate.email,
          subject: "You have been invited to take an Online Assessment",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Online Assessment Invitation</h2>
              <p>Dear ${candidate.name},</p>
              <p>You have been invited to take an online assessment for <strong>${assessment.title}</strong>.</p>
              <p><strong>Your ATS Score: ${application.atsScore}%</strong> — you have qualified for the next round.</p>
              <p><strong>Assessment Details:</strong></p>
              <ul>
                <li>Aptitude Questions: ${assessment.aptitudeCount}</li>
                <li>Technical Questions: ${assessment.technicalCount}</li>
                <li>Coding Problems: ${assessment.codingProblems.length}</li>
                <li>Total Time: ${
                  assessment.timeLimit.aptitude +
                  assessment.timeLimit.technical +
                  assessment.timeLimit.coding
                } minutes</li>
                <li>This link is valid for 7 days</li>
              </ul>
              <p>Click the button below to start your assessment:</p>
              <a href="${assessmentLink}" 
                 style="background:#4F46E5;color:white;padding:12px 24px;
                        text-decoration:none;border-radius:6px;display:inline-block;">
                Start Assessment
              </a>
              <p style="margin-top:20px;color:#666;">
                If the button doesn't work, copy this link: ${assessmentLink}
              </p>
            </div>
          `,
        });

        sentCount++;
      } catch (candidateError) {
        console.error(
          `Failed for candidate ${candidateId}:`,
          candidateError.message,
        );
        failedCandidates.push(candidateId);
        continue;
      }
    }

    res.status(200).json({
      success: true,
      message: "Assessment invites processed successfully",
      summary: {
        totalQualified: applications.length,
        sent: sentCount,
        skipped: skippedCount,
        failed: failedCandidates.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------
// Get All Results for an Assessment (Employer)
// ----------------------------
export const getAssessmentResults = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const submissions = await AssessmentSubmission.find({
      assessmentId,
      status: "completed",
    }).populate("candidateId", "name email");

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ----------------------------
// Get Single Candidate Result (Employer)
// ----------------------------
export const getCandidateResult = async (req, res) => {
  try {
    const { assessmentId, candidateId } = req.params;

    const submission = await AssessmentSubmission.findOne({
      assessmentId,
      candidateId,
      status: "completed",
    }).populate("candidateId", "name email");

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Result not found" });
    }

    res.status(200).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
