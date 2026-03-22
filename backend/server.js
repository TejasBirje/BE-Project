import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import http from "http";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import jobRoutes from "./routes/job.route.js";
import applicationRoutes from "./routes/application.route.js";
import savedJobRoutes from "./routes/savedJob.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import interviewRoutes from "./routes/interview.route.js";
import initInterviewSocket from "./interviewServer.js";
import { fileURLToPath } from "url";
import assessmentRoutes from "./routes/assessment.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";
import judgeRoutes from "./routes/judge.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Create HTTP server (needed for Socket.io)
const server = http.createServer(app);

// CORS
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.options(/.*/, cors()); // ✅ use regex instead of string to handle preflight requests for all routes

// Connect DB
connectDB();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/save-jobs", savedJobRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/interview", interviewRoutes);
// add alongside your existing routes
app.use("/api/assessments", assessmentRoutes);
app.use("/api/attempt", attemptRoutes);

// Judge routes (for code execution during interviews and assessments)
app.use("/api/judge", judgeRoutes);

// Server uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// Initialise Socket.io for interview sessions
initInterviewSocket(server);

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}.`);
});
