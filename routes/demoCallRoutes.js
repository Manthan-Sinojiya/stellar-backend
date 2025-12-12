/**
 * ------------------------------------------------------------------
 * DEMO CALL & OTP ROUTES
 * ------------------------------------------------------------------
 * Endpoints:
 *  🔹 POST /send-otp        → Send OTP via MSG91
 *  🔹 POST /verify-otp      → Verify OTP via MSG91
 *
 *  🔹 POST /book            → Create demo call request
 *  🔹 GET  /all             → Admin: fetch all demo call entries
 *  🔹 DELETE /:id           → Delete demo call entry
 *  🔹 PUT /status/:id       → Update demo call follow-up status
 *
 * Notes:
 * - asyncHandler ensures thrown errors go to global handler
 * - Controller functions contain logic; routes stay clean
 * ------------------------------------------------------------------
 */

import express from "express";
import asyncHandler from "express-async-handler";
import {
  sendOtp,
  verifyOtp,
  bookDemoCall,
  getAllDemoCalls,
  deleteDemoCall,
  updateDemoCallStatus,
} from "../controllers/demoCallController.js";

const router = express.Router();

/* ------------------------------------------------------------------
   OTP Routes
------------------------------------------------------------------ */
router.post("/send-otp", asyncHandler(sendOtp));
router.post("/verify-otp", asyncHandler(verifyOtp));

/* ------------------------------------------------------------------
   Demo Call Routes
------------------------------------------------------------------ */
router.post("/book", asyncHandler(bookDemoCall));
router.get("/all", asyncHandler(getAllDemoCalls));
router.delete("/:id", asyncHandler(deleteDemoCall));
router.put("/status/:id", asyncHandler(updateDemoCallStatus));

export default router;
