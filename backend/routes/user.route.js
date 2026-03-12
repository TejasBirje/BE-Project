import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  deleteResume,
  getPublicProfile,
  updateProfile,
  uploadResume,
  repairResumeText,
} from "../controllers/user.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// Protected Routes
router.put("/profile", protect, updateProfile);

// Upload resume PDF → creates Resume doc in MongoDB
router.post("/upload-resume", protect, upload.single("resume"), uploadResume);

// Delete resume (removes Resume doc + file)
router.delete("/resume", protect, deleteResume);

// Re-extract text from an already-uploaded resume PDF (repair migration)
router.post("/repair-resume", protect, repairResumeText);

// Public Routes
router.get("/:id", getPublicProfile);

export default router;
