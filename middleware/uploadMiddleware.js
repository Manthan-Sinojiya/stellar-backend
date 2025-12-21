import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/marksheets",
  filename: (_, file, cb) => {
    cb(
      null,
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    );
  },
});

export const uploadMarksheet = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_, file, cb) => {
    const allowed = /pdf|jpg|jpeg/;
    const isValid =
      allowed.test(file.mimetype) &&
      allowed.test(path.extname(file.originalname).toLowerCase());

    if (!isValid) {
      cb(new Error("Only PDF/JPG/JPEG allowed"));
    }
    cb(null, true);
  },
});
