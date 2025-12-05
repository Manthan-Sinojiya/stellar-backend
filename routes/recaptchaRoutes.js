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

// Define credentials outside the route handler for performance and readability
const credentials = process.env.GOOGLE_SA_KEY_JSON ? 
    JSON.parse(process.env.GOOGLE_SA_KEY_JSON) : null;

// Use the environment variable for the project ID
const PROJECT_ID = "stellar-f5d09";
const SITE_KEY = "6Lcg4SEsAAAAAHYa_r1sqEbhrvmH6H-lGSp45LPK";

// The overall application structure remains the same
router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, message: "Missing reCAPTCHA token" });
    }

    // Initialize the client, explicitly passing credentials if they exist
    // If credentials is null, it falls back to default authentication (which usually fails on Render)
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

    // ... (rest of the logic is the same)
    if (!assessment.tokenProperties.valid) {
      console.warn("reCAPTCHA Invalid:", assessment.tokenProperties.invalidReason); 
      return res.status(200).json({
        success: false,
        reason: assessment.tokenProperties.invalidReason,
      });
    }

    const score = assessment.riskAnalysis.score;
    return res.status(200).json({ success: true, score });

  } catch (err) {
    console.error("reCAPTCHA Verification Error:", err.message, err.stack); 
    res.status(500).json({
      success: false,
      message: "Verification failed due to server error.",
      details: err.message
    });
  }
});

export default router;