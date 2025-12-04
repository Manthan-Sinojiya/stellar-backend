// // services/msg91Service.js
// import fetch from "node-fetch";
// import dotenv from "dotenv";
// dotenv.config();

// export const sendOtp = async (mobile, otp) => {
//   const url = "https://api.msg91.com/api/v5/otp";

//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       accept: "application/json",
//       authkey: process.env.MSG91_AUTH_KEY,
//       "content-type": "application/json",
//     },
//     body: JSON.stringify({
//       mobile: `91${mobile}`,
//       otp,
//       template_id: process.env.MSG91_OTP_TEMPLATE_ID,
//     }),
//   });

//   const data = await response.json();
//   console.log("MSG91 Response:", data);

//   if (!response.ok) throw new Error(data.message || "Failed to send OTP");

//   return true;
// };


// services/msg91Service.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

export const sendOtp = async (mobile, otp) => {
  const url = "https://api.msg91.com/api/v5/otp";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      authkey: process.env.MSG91_AUTH_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      mobile: `91${mobile}`,
      otp,
      template_id: process.env.MSG91_OTP_TEMPLATE_ID,
    }),
  });

  const data = await response.json();
  console.log("MSG91 Send OTP:", data);

  if (!response.ok) {
    throw new Error(data.message || "Failed to send OTP");
  }

  return true;
};
