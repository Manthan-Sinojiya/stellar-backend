import express from "express";
import { getSignedUploadUrl } from "../utils/s3.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/presigned-url", protect, async (req, res) => {
  const { fileName, fileType, folder } = req.body;

  if (!fileName || !fileType) {
    return res.status(400).json({ message: "Invalid file data" });
  }

  const data = await getSignedUploadUrl({ fileName, fileType, folder });
  res.json(data);
});


export default router;
