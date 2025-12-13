import request from "supertest";
import app from "./testServer.mjs";

describe("USER API", () => {
  it("should create a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        fullName: "New User",
        email: "u1@example.com",
        password: "Abcd@1234",
        role: "user",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("u1@example.com");
  });

  it("should list users", async () => {
    await request(app).post("/api/users").send({
      fullName: "List User",
      email: "list@example.com",
      password: "Abcd@1234",
      role: "user",
    });

    const res = await request(app).get("/api/users");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
  });
});
