import request from "supertest";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";

describe("GET MyAlbums", () => {
  it("should return 401", () => {
    return request(app).get("/api/myAlbums")
      .expect(401);
  });
  it("should return 200", () => {
    return request(app)
      .get("/api/myAlbums")
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`)
      .expect(200);
  });
});