import request from "supertest";
import app from "./testServer.mjs";

describe("AUTH API", () => {
  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Manthan",
        fatherName: "Sharma",   // ✅ FIXED: Must pass validation
        email: "auth@example.com",
        mobile: "9999999999",
        password: "Abcd@1234",
        address1: "Surat",
        city: "Surat",
        state: "Gujarat",
        pincode: "395006"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Registered Successfully");
  });
});
