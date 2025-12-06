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
import fs from "fs"; // Still needed if you use other fs operations, but not for recaptcha anymore

// NOTE: The previous logic for GOOGLE_APPLICATION_CREDENTIALS is REMOVED 
// as it caused errors. We now handle credentials directly in recaptchaRoutes.js.

dotenv.config();
connectDB();

const app = express();

// --- CRITICAL CORS CONFIGURATION (MUST BE FIRST) ---
app.use(cors({
  // Ensure all allowed origins are listed
  origin: ["http://localhost:5173", "https://stellarcampus.com"],
  // Ensure the OPTIONS method is allowed for preflight requests
  methods: ["GET", "POST", "OPTIONS","PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"],
}));
// ---------------------------------------------------

app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/quizresult", quizresultRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/demo-call", demoCallRoutes);
app.use("/api/recaptcha", recaptchaRoutes); // This route must be covered by the global CORS

// GLOBAL ERROR HANDLER
app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);