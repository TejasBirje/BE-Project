import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to the uploads directory (backend/uploads/)
const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Ensure the directory exists at startup
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/**
 * Multer storage configuration
 * Defines where and how files will be stored on the server
 */
const storage = multer.diskStorage({
  // Destination folder for uploads (absolute path prevents CWD-relative issues)
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },

  // File naming strategy
  filename: (req, file, cb) => {
    // Using original file name (not recommended for production due to collisions)
    // Better approach: `${Date.now()}-${file.originalname}`
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/**
 * File filter
 * Controls which file types are allowed to be uploaded
 */
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  // Check if uploaded file type is allowed
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    // Reject file with custom error message
    cb(
      new Error("Only .jpeg, .jpg, .png and .pdf formats are supported."),
      false
    );
  }
};

/**
 * Multer instance
 * Combines storage + file filter
 * This middleware is used in routes for handling file uploads
 */
const upload = multer({ storage, fileFilter });

export default upload;
