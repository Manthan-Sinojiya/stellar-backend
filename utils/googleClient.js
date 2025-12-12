/**
 * ------------------------------------------------------------------
 * GOOGLE OAUTH2 CLIENT INITIALIZATION
 * ------------------------------------------------------------------
 * Purpose:
 * - Creates an OAuth2 client instance for Google Login integration
 * - Handles authorization code exchange → access token + profile details
 *
 * Why "postmessage" redirect URI?
 * - Required for exchanging authorization code from frontend SPA (React)
 * - Allows secure token exchange without redirecting the user
 *
 * Environment Variables Required:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 *
 * Used In:
 * - authController.js (googleAuth function)
 * ------------------------------------------------------------------
 */

import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,      // Google App Client ID
  process.env.GOOGLE_CLIENT_SECRET,  // Google App Client Secret
  "postmessage"                      // Required redirect URI for SPA → backend code exchange
);
