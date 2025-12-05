import express from "express";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

const router = express.Router();

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
      return res.json({
        success: false,
        reason: assessment.tokenProperties.invalidReason,
      });
    }

    const score = assessment.riskAnalysis.score;

    console.log("reCAPTCHA Score:", score);

    if (score < 0.5) {
      return res.json({ success: false, score });
    }

    return res.json({ success: true, score });

  } catch (err) {
    console.error(err);
    res.json({ success: false, error: "Verification failed" });
  }
});

export default router;
