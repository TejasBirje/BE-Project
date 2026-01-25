import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { deleteResume, getPublicProfile, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

// Protected Routes
router.put("/profile", protect, updateProfile);
router.delete("/resume", protect, deleteResume);

// Public Routes
router.get("/:id", getPublicProfile);

export default router;