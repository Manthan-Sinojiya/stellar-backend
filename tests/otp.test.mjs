import request from "supertest";
import app from "./testServer.mjs";

jest.mock("../services/msg91Service.js", () => ({
  sendOtp: jest.fn().mockResolvedValue({}),
  verifyOtpMsg91: jest.fn().mockResolvedValue({ type: "success" }),
}));

describe("OTP API", () => {
  it("should send OTP", async () => {
    const res = await request(app)
      .post("/api/otp/register")
      .send({
        mobile: "7862892575",
        email: "otp@example.com",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("OTP sent successfully");
  });
});
