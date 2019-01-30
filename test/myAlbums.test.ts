import request from "supertest";
import querystring from "querystring";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";
import { GetMyAlbumsResponse, GetMyAlbumsRequest, GetAlbumResponse } from "../src/models/responses/GetMyAlbums";

const testTags = ["This is a test tag", "This is another test tag"];
const testSpotifyAlbumId = "5cPHT4yMCfETLRYAoBFcOZ"; // Ma Fleur - Cinematic Orchestra

describe("GET MyAlbums", () => {
  afterAll(async () => {
    for (const tag of testTags) {
      const response0 = await request(app)
        .delete("/api/me/tag-on-album")
        .send({ album: { spotifyId: testSpotifyAlbumId }, tag: { name: tag } })
        .set("Authorization", `Bearer ${ACCESS_TOKEN}`);
    }
  });

  it("should return 401", async () => {
    const response = await request(app)
      .get("/api/me/album");

    expect(response.status).toBe(401);
  });

  it("should return 200", async () => {
    const response = await request(app)
      .get("/api/me/album")
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response.status).toBe(200);
    const body = <GetMyAlbumsResponse>response.body;
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("should return multiple albums", async () => {
    // First I need to add two tags to the same album, than I retrieve it
    //#region settings tags
    for (const tag of testTags) {
      const response0 = await request(app)
        .post("/api/me/tag-on-album")
        .send({ album: { spotifyId: testSpotifyAlbumId }, tag: { name: tag } })
        .set("Authorization", `Bearer ${ACCESS_TOKEN}`);
      expect(response0.status).toBe(200);
    }
    //#endregion

    const reqObj: GetMyAlbumsRequest = { tags: JSON.stringify(testTags) };
    const req = querystring.stringify(reqObj);

    const response = await request(app)
      .get(`/api/me/album?${req}`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response.status).toBe(200);
    const responseBody: GetMyAlbumsResponse = response.body;

    expect(responseBody.data).not.toBeNull();
    expect(responseBody.data.length).toBeGreaterThan(0);
    expect(responseBody.data[0].tags.length).toBeGreaterThanOrEqual(testTags.length);
  });
});
