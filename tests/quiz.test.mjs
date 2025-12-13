import request from "supertest";
import app from "./testServer.mjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

let adminToken;

beforeAll(async () => {
  const adminPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await User.create({
    fullName: "Admin",
    email: "admin@example.com",
    password: adminPassword,
    role: "admin",
  });

  adminToken = jwt.sign(
    { id: admin._id.toString(), role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
});

describe("QUIZ API", () => {
  it("should create a quiz (admin only)", async () => {
    const res = await request(app)
      .post("/api/quiz")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test Quiz",
        category: "Entrance Test",
        questions: [
          {
            question: "2+2=?",
            type: "mcq",
            options: ["3", "4"],
            answer: "4",
          },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.quiz.title).toBe("Test Quiz");
  });

  it("should get quizzes list", async () => {
    const res = await request(app)
      .get("/api/quiz?page=1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("quizzes");
  });
});
