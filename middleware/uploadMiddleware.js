import multer from "multer";
import path from "path";
import fs from "fs";

/* --------------------------------------------------
   Utility: Ensure Directory Exists
-------------------------------------------------- */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/* --------------------------------------------------
   File Filter (Shared)
-------------------------------------------------- */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF, JPG, or JPEG files are allowed"));
  }

  cb(null, true);
};

/* --------------------------------------------------
   Storage Factory
-------------------------------------------------- */
const createStorage = (folderName) => {
  const uploadPath = `uploads/${folderName}`;
  ensureDir(uploadPath);

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, uniqueName + path.extname(file.originalname));
    },
  });
};

/* --------------------------------------------------
   EXPORTS
-------------------------------------------------- */

// 🟢 Education Marksheet Upload
export const uploadMarksheet = multer({
  storage: createStorage("marksheets"),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter,
});

// 🟣 Certification Upload
export const uploadCertification = multer({
  storage: createStorage("certifications"),
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter,
});
