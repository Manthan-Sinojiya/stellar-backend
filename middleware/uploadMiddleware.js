import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = "uploads/marksheets";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF, JPG, or JPEG files are allowed"));
  }

  cb(null, true);
};

// ✅ 1MB = 1024 * 1024 bytes
export const uploadMarksheet = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // ✅ 1MB limit
  fileFilter,
});
