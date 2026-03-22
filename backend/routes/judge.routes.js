import express from "express";
import { runCode } from "../controllers/judge.controller.js";

const router = express.Router();

// POST /api/judge/run
// Called by frontend when candidate clicks "Run Code"
// No JWT needed — candidate uses assessment token for auth, not JWT
router.post("/run", runCode);

export default router;
