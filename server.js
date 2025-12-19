/**
 * ------------------------------------------------------------------
 * Main Express Server
 * ------------------------------------------------------------------
 * Responsibilities:
 * - Load environment variables
 * - Connect to MongoDB
 * - Register global middlewares
 * - Register API routes
 * - Attach global error handler
 * - Start Express HTTP server
 *
 * Best Practices Followed:
 * - CORS configured with explicit allowed origins
 * - express.json() to parse incoming JSON request body
 * - All errors thrown inside async handlers bubble to global handler
 * - Routes separated for maintainability
 * ------------------------------------------------------------------
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Database connection
import connectDB from "./config/db.js";

// Route modules
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import quizresultRoutes from "./routes/quizresultRoutes.js";
import otpRoutes from "./routes/otp.js";
import userRoutes from "./routes/userRoutes.js";
import demoCallRoutes from "./routes/demoCallRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

// Global error middleware
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

/* ------------------------------------------------------------------
   CORS CONFIGURATION
   - Allows specific frontend domains
   - Restricts allowed HTTP methods
   - Supports Authorization header for JWT
------------------------------------------------------------------ */
app.use(
  cors({
    origin: ["http://localhost:5173", "https://stellarcampus.com"],
    methods: ["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ------------------------------------------------------------------
   BODY PARSER
   - Enables Express to read JSON request bodies
------------------------------------------------------------------ */
app.use(express.json());

/* ------------------------------------------------------------------
   ROUTES
   Organized REST API structure:
   - /api/auth          → Authentication (Login, Register, Google OAuth)
   - /api/quiz          → Quiz CRUD & publish control
   - /api/quizresult    → Quiz submissions and scoring
   - /api/otp           → OTP registration flow
   - /api/users         → Admin user management
   - /api/demo-call     → Demo call booking & admin view
------------------------------------------------------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/quizresult", quizresultRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/demo-call", demoCallRoutes);
app.use("/api/applications", applicationRoutes);
/* ------------------------------------------------------------------
   GLOBAL ERROR HANDLER
   - Must be last middleware
   - Captures thrown errors and returns proper JSON responses
------------------------------------------------------------------ */
app.use(errorHandler);

/* ------------------------------------------------------------------
   START SERVER
   - Uses PORT from env file
   - Logs active port for debugging/monitoring
------------------------------------------------------------------ */
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "LOADED" : "MISSING");
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "LOADED" : "MISSING");

export default app;