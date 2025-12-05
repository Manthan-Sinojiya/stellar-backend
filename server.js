// // server.js
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import quizRoutes from "./routes/quizRoutes.js";
// import quizresultRoutes from "./routes/quizresultRoutes.js";
// import otpRoutes from "./routes/otp.js";
// import userRoutes from "./routes/userRoutes.js";
// import demoCallRoutes from "./routes/demoCallRoutes.js";
// import { errorHandler } from "./middleware/errorHandler.js";

// dotenv.config();
// connectDB();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ROUTES
// app.use("/api/auth", authRoutes);
// app.use("/api/quiz", quizRoutes);
// app.use("/api/quizresult", quizresultRoutes);
// app.use("/api/otp", otpRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/demo-call", demoCallRoutes);

// // GLOBAL ERROR HANDLER
// app.use(errorHandler);

// app.listen(process.env.PORT, () =>
//   console.log(`Server running on port ${process.env.PORT}`)
// );

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

// --- START: reCAPTCHA Credential Setup (Critical for 500 Error) ---
// This block ensures the Google Cloud client can find the service account credentials.
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const jsonPath = "/tmp/recaptcha.json";
  // Writes the JSON content from the ENV variable to a temporary file
  fs.writeFileSync(jsonPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  // Sets the environment variable that the @google-cloud library looks for
  process.env.GOOGLE_APPLICATION_CREDENTIALS = jsonPath;
}
// --- END: reCAPTCHA Credential Setup ---

dotenv.config();
connectDB();

const app = express();

// --- CORS Configuration (Global, Fixes Conflict) ---
// Note: This needs to be before any routes or express.json() call.
app.use(cors({
  origin: ["http://localhost:5173", "https://stellarcampus.com"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
// --- END CORS Configuration ---

app.use(express.json());

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