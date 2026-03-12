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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Create HTTP server (needed for Socket.io)
const server = http.createServer(app);

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

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

// Server uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// Initialise Socket.io for interview sessions
initInterviewSocket(server);

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}.`);
});
