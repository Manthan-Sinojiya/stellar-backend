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

// ❌ REMOVED: router.use(cors());  
// The global CORS in server.js now handles this.

router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Missing reCAPTCHA token",
        });
    }

    const client = new RecaptchaEnterpriseServiceClient();
    // ⚠️ Ensure 'stellar-f5d09' is your actual Google Cloud Project ID
    const projectPath = client.projectPath("stellar-f5d09");

    const [assessment] = await client.createAssessment({
      parent: projectPath,
      assessment: {
        event: {
          token,
          // ⚠️ Ensure this is the correct reCAPTCHA Enterprise Site Key
          siteKey: "6Lcg4SEsAAAAAHYa_r1sqEbhrvmH6H-lGSp45LPK",
        },
      },
    });

    if (!assessment.tokenProperties.valid) {
      // Log for server-side debugging
      console.warn("reCAPTCHA Invalid:", assessment.tokenProperties.invalidReason); 
      
      return res.status(200).json({
        success: false,
        reason: assessment.tokenProperties.invalidReason,
      });
    }

    const score = assessment.riskAnalysis.score;
    console.log("reCAPTCHA Score:", score);

    // TEMPORARILY DISABLE STRICT CHECK IN DEVELOPMENT (As per your original code)
    return res.status(200).json({
      success: true,
      score
    });

  } catch (err) {
    // 🚨 Log the full error to help debug the 500 error
    console.error("reCAPTCHA Verification Error:", err.message, err.stack); 
    res.status(500).json({
      success: false,
      message: "Verification failed due to server error.",
      details: err.message // Optionally send error message for dev environment
    });
  }
});

export default router;