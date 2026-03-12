import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getInterview,
  getUserInterviews,
} from "../controllers/interview.controller.js";

const router = express.Router();

// List all interviews for the logged-in user
router.get("/user/all", protect, getUserInterviews);

// Get a single interview by ID
router.get("/:id", protect, getInterview);

export default router;
