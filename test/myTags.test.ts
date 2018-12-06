import request from "supertest";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";

describe("GET MyTags", () => {
  it("should return 401", async () => {
    const response = await request(app)
      .get("/api/myTags");

    expect(response.status).toBe(401);
  });
  it("should return 200", async () => {
    const response = await request(app)
      .get("/api/myTags")
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response.status).toBe(200);
  });
});
