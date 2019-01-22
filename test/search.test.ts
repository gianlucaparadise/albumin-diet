import request from "supertest";
import querystring from "querystring";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";
import { SearchRequest } from "../src/models/responses/Search";

describe("Search album", () => {
  it("should return 401", async () => {
    const response = await request(app)
      .get("/api/me/album/search");

    expect(response.status).toBe(401);
  });
  it("should return 200", async () => {
    const reqObj: SearchRequest = { q: "blood sugar sex magik" };
    const req = querystring.stringify(reqObj);

    const response = await request(app)
      .get(`/api/me/album/search?${req}`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response.status).toBe(200);
  });
});

describe("Search artist", () => {
  it("should return 401", async () => {
    const response = await request(app)
      .get("/api/me/artist/search");

    expect(response.status).toBe(401);
  });
  it("should return 200", async () => {
    const reqObj: SearchRequest = { q: "red hot chili peppers" };
    const req = querystring.stringify(reqObj);

    const response = await request(app)
      .get(`/api/me/artist/search?${req}`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response.status).toBe(200);
  });
});