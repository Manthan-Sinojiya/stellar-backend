/**
 * --------------------------------------------------------
 * AWS SNS SERVICE
 * --------------------------------------------------------
 * - Sends OTP via SMS using AWS SNS
 * - Uses AWS SDK v3 (recommended)
 * - No hardcoded credentials
 * --------------------------------------------------------
 */

import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Send OTP via SMS
 * @param {string} mobile - 10 digit Indian mobile number
 * @param {string} otp - 6 digit OTP
 */
export const sendOtpSms = async (mobile, otp) => {
  const message = `Your Stellar verification code is ${otp}. Valid for 5 minutes.`;

  const command = new PublishCommand({
    Message: message,
    PhoneNumber: `+91${mobile}`, // India country code
  });

  await snsClient.send(command);
};
