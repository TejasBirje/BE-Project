import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  applyToJob,
  getApplicationById,
  getMyApplications,
  getApplicantsForJob,
  updateStatus,
  sendInterviewInvite,
  recalculateAts,
} from "../controllers/application.controller.js";

const router = express.Router();

router.post("/:jobId", protect, applyToJob);
router.get("/my", protect, getMyApplications);
router.get("/job/:jobId", protect, getApplicantsForJob);
router.get("/:id", protect, getApplicationById);
router.put("/:id/status", protect, updateStatus);
router.put("/:id/invite", protect, sendInterviewInvite);
router.post("/:id/recalculate-ats", protect, recalculateAts);

export default router;
