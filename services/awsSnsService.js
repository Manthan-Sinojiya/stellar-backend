// /**
//  * --------------------------------------------------------
//  * AWS SNS OTP SERVICE
//  * --------------------------------------------------------
//  * - Sends OTP via SMS using AWS SNS
//  * - AWS SDK v3 (official & recommended)
//  * - Supports Indian mobile numbers (+91)
//  * - Uses default AWS credential provider chain
//  * --------------------------------------------------------
//  */

// import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

// /**
//  * AWS SDK automatically resolves credentials from:
//  * - Environment variables
//  * - IAM Role (EC2 / ECS / EKS)
//  * - ~/.aws/credentials
//  */
// const snsClient = new SNSClient({
//   region: process.env.AWS_REGION,
// });

// /**
//  * Send OTP via SMS
//  * @param {string} mobile - 10 digit Indian mobile number
//  * @param {string} otp - 6 digit OTP
//  */
// export const sendOtp = async (mobile, otp) => {
//   try {
//     const message = 
      // `Your Stellar verification code is ${otp}. ` +
      // `This OTP is valid for 5 minutes. ` +
      // `OTP is confidential. We never call you asking for OTP. ` +
      // `Please do not share it with anyone. - Stellar Campus`;

//     const command = new PublishCommand({
//       Message: message,
//       PhoneNumber: `+91${mobile}`,
//       MessageAttributes: {
//         "AWS.SNS.SMS.SMSType": {
//           DataType: "String",
//           StringValue: "Transactional", // ensures OTP messages are flagged as transactional
//         },
//       },
//     });

//     await snsClient.send(command);
//   } catch (error) {
//     console.error("AWS SNS ERROR:", error);
//     throw new Error("OTP delivery failed");
//   }
// };


/**
 * --------------------------------------------------------
 * AWS SNS OTP SERVICE (Unified)
 * --------------------------------------------------------
 * - Sends OTP via SMS using AWS SNS
 * - Supports multiple OTP use cases
 * - AWS SDK v3 (official & recommended)
 * - Indian mobile numbers (+91)
 * --------------------------------------------------------
 */

import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
});

/**
 * OTP message templates
 * Centralized to avoid duplication
 */
const otpMessages = {
  REGISTRATION: (otp) =>
    `Your Stellar verification code is ${otp}. ` +
    `This OTP is valid for 5 minutes. ` +
    `OTP is confidential. We never call you asking for OTP. ` +
    `Please do not share it with anyone. - Stellar Campus`,

  RESET_PASSWORD: (otp) =>
    `Your Stellar password reset OTP is ${otp}. ` +
    `This code is valid for 5 minutes. ` +
    `Please do not share it with anyone. - Stellar Campus`,
  };

/**
 * Send OTP via AWS SNS
 * @param {string} mobile - 10 digit Indian mobile number
 * @param {string} otp - 6 digit OTP
 * @param {"REGISTRATION" | "RESET_PASSWORD"} type
 */
export const sendOtp = async (mobile, otp, type = "REGISTRATION") => {
  try {
    const messageBuilder = otpMessages[type];

    if (!messageBuilder) {
      throw new Error("Invalid OTP message type");
    }

    const command = new PublishCommand({
      Message: messageBuilder(otp),
      PhoneNumber: `+91${mobile}`,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
      },
    });

    await snsClient.send(command);
  } catch (error) {
    console.error("AWS SNS ERROR:", error);
    throw new Error("OTP delivery failed. Please try again.");
  }
};
