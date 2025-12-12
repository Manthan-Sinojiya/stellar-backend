import axios from "axios";

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

/* ----------------------------------------------------------
   Send OTP (used by otpController.js → sendOtp())
----------------------------------------------------------- */
export const sendOtp = async (mobile, otp) => {
  try {
    const url = `https://control.msg91.com/api/v5/otp`;
    const payload = {
      mobile: `91${mobile}`,
      otp,
      sender_id: MSG91_SENDER_ID,
      template_id: MSG91_TEMPLATE_ID,
    };

    const headers = {
      "Content-Type": "application/json",
      authkey: MSG91_AUTH_KEY,
    };

    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (err) {
    console.error("MSG91 sendOtp Error:", err.response?.data || err.message);
    throw new Error("Failed to send OTP via MSG91");
  }
};

/* ----------------------------------------------------------
   Send OTP (used by demoCallController.js → sendOtpMsg91())
   — This version auto-generates OTP
----------------------------------------------------------- */
export const sendOtpMsg91 = async (mobile) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const url = `https://control.msg91.com/api/v5/otp`;
    const payload = {
      mobile: `91${mobile}`,
      otp,
      sender_id: MSG91_SENDER_ID,
      template_id: MSG91_TEMPLATE_ID,
    };

    const headers = {
      "Content-Type": "application/json",
      authkey: MSG91_AUTH_KEY,
    };

    const response = await axios.post(url, payload, { headers });

    return {
      type: "success",
      otp,
      data: response.data,
    };
  } catch (err) {
    console.error("MSG91 sendOtpMsg91 Error:", err.response?.data || err.message);
    return {
      type: "error",
      error: err.response?.data || err.message,
    };
  }
};

/* ----------------------------------------------------------
   Verify OTP (used in demoCallController.js → verifyOtpMsg91())
----------------------------------------------------------- */
export const verifyOtpMsg91 = async (mobile, otp) => {
  try {
    const url = `https://control.msg91.com/api/v5/otp/verify`;

    const payload = {
      mobile: `91${mobile}`,
      otp,
    };

    const headers = {
      "Content-Type": "application/json",
      authkey: MSG91_AUTH_KEY,
    };

    const response = await axios.post(url, payload, { headers });

    return response.data;
  } catch (err) {
    console.error("MSG91 verifyOtpMsg91 Error:", err.response?.data || err.message);

    return {
      type: "error",
      message: "OTP verification failed",
    };
  }
};

export default {
  sendOtp,
  sendOtpMsg91,
  verifyOtpMsg91,
};
