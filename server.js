// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import quizresultRoutes from "./routes/quizresultRoutes.js";
import otpRoutes from "./routes/otp.js";
import userRoutes from "./routes/userRoutes.js";
import demoCallRoutes from "./routes/demoCallRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import recaptchaRoutes from "./routes/recaptchaRoutes.js";
import fs from "fs";

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const jsonPath = "/tmp/recaptcha.json";
  fs.writeFileSync(jsonPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = jsonPath;
}
dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "https://stellarcampus.com"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/quizresult", quizresultRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/demo-call", demoCallRoutes);
app.use("/api/recaptcha", recaptchaRoutes);

// GLOBAL ERROR HANDLER
app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
