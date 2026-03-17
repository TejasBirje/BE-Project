import express from "express";
import {
  validateInviteToken,
  startAssessment,
  saveProgress,
  submitAssessment,
  getCandidateOwnResult,
} from "../controllers/attempt.controller.js";

const router = express.Router();

// No JWT needed — token in URL acts as authentication for candidate
router.get("/invite/:token", validateInviteToken);
router.post("/start/:token", startAssessment);
router.post("/save/:token", saveProgress);
router.post("/submit/:token", submitAssessment);
router.get("/result/:token", getCandidateOwnResult);

export default router;
