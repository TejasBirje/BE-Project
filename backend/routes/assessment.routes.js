import express from "express";
import {
  createAssessment,
  getEmployerAssessments,
  getAssessmentById,
  sendAssessmentInvite,
  getAssessmentResults,
  getCandidateResult,
  deleteAssessment,
} from "../controllers/assessment.controller.js";
// import { verifyToken } from "../middleware/auth.middleware.js"; // your existing JWT middleware
import { protect as verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes protected — employer only
router.post("/create", verifyToken, createAssessment);
router.get("/my-assessments", verifyToken, getEmployerAssessments);
router.get("/:assessmentId", verifyToken, getAssessmentById);
router.post("/invite", verifyToken, sendAssessmentInvite);
router.get("/:assessmentId/results", verifyToken, getAssessmentResults);
router.get(
  "/:assessmentId/results/:candidateId",
  verifyToken,
  getCandidateResult,
);
router.delete("/:assessmentId", verifyToken, deleteAssessment);

export default router;
