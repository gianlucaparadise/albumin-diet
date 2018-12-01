import request from "supertest";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";
import { SetTagOnAlbumRequest } from "../src/models/requests/SetTagOnAlbumRequest";

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

describe("POST setTagOnAlbum", () => {
  it("should return 200", () => {
    const req: SetTagOnAlbumRequest = {
      album: {
        spotifyId: "5cPHT4yMCfETLRYAoBFcOZ"
      },
      tag: {
        name: "french"
      }
    };

    return request(app)
      .post("/api/setTagOnAlbum")
      .send(req)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`)
      .expect(200);
  });
});