/**
 * ------------------------------------------------------------------
 * MongoDB Connection Utility (Mongoose v7+)
 * ------------------------------------------------------------------
 * - Uses express-async-handler to standardize error handling
 * - Ensures MONGO_URI exists before starting server
 * - Automatically applies modern Mongoose defaults (no deprecated opts)
 * - Logs successful connections with host info
 *
 * Production Notes:
 * - Keep MONGO_URI in environment variables or secret manager
 * - For clustered deployments (PM2, Kubernetes), rely on Mongoose's
 *   built-in connection pooling instead of manual pool settings
 * - Errors thrown here are caught by asyncHandler and passed to the
 *   global Express error middleware (if called from Express lifecycle)
 * - If using connectDB at server bootstrap (before app.listen),
 *   wrap it in a try/catch there — asyncHandler is designed primarily
 *   for Express route handlers.
 * ------------------------------------------------------------------
 */

import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

// ------------------------------------------------------------------
// Connects to MongoDB using mongoose
// ------------------------------------------------------------------
const connectDB = asyncHandler(async () => {
  // Validate environment variable early → avoids silent failures
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  /**
   * Mongoose v7+:
   * - No need for useNewUrlParser, useUnifiedTopology, etc.
   * - Modern defaults are used automatically
   * - Connection pooling & retry logic built in
   */
  const conn = await mongoose.connect(process.env.MONGO_URI);

  // Hostname is useful in distributed environments / logs
  console.log(`MongoDB Connected Successfully → ${conn.connection.host}`);

  return conn;
});

export default connectDB;
