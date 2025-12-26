import Education from "../models/Education.js";
import { getSignedUploadUrl } from "../utils/s3.js";

/* Upload file (presigned URL) */
export const uploadEducationFile = async (req, res) => {
  const { fileName, fileType, folder } = req.body;

  if (!fileName || !fileType)
    return res.status(400).json({ message: "Invalid file data" });

  const data = await getSignedUploadUrl({ fileName, fileType, folder });
  res.json(data);
};

/* Save education record */
export const saveEducation = async (req, res) => {
  const { level, percentage, cgpa, marksheetUrl } = req.body;

  if (!marksheetUrl)
    return res.status(400).json({ message: "Marksheet missing" });

  const education = await Education.create({
    userId: req.user.id,
    level,
    percentage,
    cgpa,
    marksheetUrl,
  });

  res.status(201).json({ success: true, education });
};

/* Fetch education list */
export const getEducation = async (req, res) => {
  const data = await Education.find({ userId: req.user.id }).sort({
    createdAt: 1,
  });

  res.json({ success: true, educations: data });
};
