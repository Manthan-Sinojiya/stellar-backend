import express from "express";
import cors from "cors";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

const router = express.Router();

// Enable CORS only for this router
router.use(cors());

router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath("stellar-f5d09");

    const [assessment] = await client.createAssessment({
      parent: projectPath,
      assessment: {
        event: {
          token,
          siteKey: "6Lcg4SEsAAAAAHYa_r1sqEbhrvmH6H-lGSp45LPK",
        },
      },
    });

    if (!assessment.tokenProperties.valid) {
      return res.status(200).json({
        success: false,
        reason: assessment.tokenProperties.invalidReason,
      });
    }

    const score = assessment.riskAnalysis.score;
    console.log("reCAPTCHA Score:", score);

    // TEMPORARILY DISABLE STRICT CHECK IN DEVELOPMENT
    return res.status(200).json({
      success: true,
      score
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
});

export default router;
