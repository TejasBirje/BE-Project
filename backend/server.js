import express from "express"
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js"
import authRoutes from "./routes/auth.route.js"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

// Connect DB
connectDB();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Server uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}.`)
})

