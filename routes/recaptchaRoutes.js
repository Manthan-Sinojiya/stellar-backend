// import express from "express";
// import cors from "cors";
// import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

// const router = express.Router();

// // Enable CORS only for this router
// router.use(cors());

// router.post("/verify", async (req, res) => {
//   try {
//     const { token } = req.body;

//     const client = new RecaptchaEnterpriseServiceClient();
//     const projectPath = client.projectPath("stellar-f5d09");

//     const [assessment] = await client.createAssessment({
//       parent: projectPath,
//       assessment: {
//         event: {
//           token,
//           siteKey: "6Lcg4SEsAAAAAHYa_r1sqEbhrvmH6H-lGSp45LPK",
//         },
//       },
//     });

//     if (!assessment.tokenProperties.valid) {
//       return res.status(200).json({
//         success: false,
//         reason: assessment.tokenProperties.invalidReason,
//       });
//     }

//     const score = assessment.riskAnalysis.score;
//     console.log("reCAPTCHA Score:", score);

//     // TEMPORARILY DISABLE STRICT CHECK IN DEVELOPMENT
//     return res.status(200).json({
//       success: true,
//       score
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Verification failed",
//     });
//   }
// });

// export default router;


// recaptchaRoutes.js
import express from "express";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

const router = express.Router();

// ❌ REMOVED: router.use(cors()); // Global CORS in server.js is sufficient and avoids conflicts.

// --- CRITICAL AUTHENTICATION SETUP ---
// You must set GOOGLE_SA_KEY_JSON (or similar) on Render with the JSON content.
const credentialsJson = process.env.GOOGLE_SA_KEY_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
const credentials = credentialsJson ? JSON.parse(credentialsJson) : null;
// ------------------------------------

const PROJECT_ID = "stellar-f5d09";
const SITE_KEY = "6Lcg4SEsAAAAAHYa_r1sqEbhrvmH6H-lGSp45LPK";

router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    // Initialize client, passing credentials directly. This fixes the ENOENT error.
    const client = new RecaptchaEnterpriseServiceClient({ credentials });
    
    const projectPath = client.projectPath(PROJECT_ID);

    const [assessment] = await client.createAssessment({
      parent: projectPath,
      assessment: {
        event: {
          token,
          siteKey: SITE_KEY,
        },
      },
    });

    if (!assessment.tokenProperties.valid) {
      console.warn("reCAPTCHA Invalid:", assessment.tokenProperties.invalidReason); 
      return res.status(200).json({
        success: false,
        reason: assessment.tokenProperties.invalidReason,
      });
    }

    const score = assessment.riskAnalysis.score;
    console.log("reCAPTCHA Score:", score);

    return res.status(200).json({
      success: true,
      score
    });

  } catch (err) {
    console.error("reCAPTCHA Verification Error (500):", err.message, err.stack);
    res.status(500).json({
      success: false,
      message: "Verification failed due to server error.",
      details: err.message
    });
  }
});

export default router;