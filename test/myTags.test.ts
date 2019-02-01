import request from "supertest";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";
import { GetMyTagsResponse } from "../src/models/responses/GetMyTags";

const testTag = "Random tag";
const testSpotifyAlbumIds = [
  "7owO1ECjA53Isw9LiIcXKZ", // Wait - Arlie
  "4COb7SaOlMP2Qd0c1Qm4nd", // St. Jude Re:Wired - Courteeners
];

describe("GET MyTags", () => {
  afterAll(async () => {
    // I remove my test tag from all test albums
    for (const albumId of testSpotifyAlbumIds) {
      const response0 = await request(app)
        .delete("/api/me/tag")
        .send({ album: { spotifyId: albumId }, tag: { name: testTag } })
        .set("Authorization", `Bearer ${ACCESS_TOKEN}`);
    }
  });

  it("should return 401", async () => {
    const response = await request(app)
      .get("/api/me/tag");

    expect(response.status).toBe(401);
  });

  it("should return 200", async () => {
    const response = await request(app)
      .get("/api/me/tag")
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response.status).toBe(200);
  });

  it("should collapse tags", async () => {
    // First I need to add the same tag to the two albums, than I retrieve all the tags
    //#region settings tags
    for (const albumId of testSpotifyAlbumIds) {
      const response0 = await request(app)
        .post("/api/me/tag")
        .send({ album: { spotifyId: albumId }, tag: { name: testTag } })
        .set("Authorization", `Bearer ${ACCESS_TOKEN}`);
      expect(response0.status).toBe(200);
    }
    //#endregion

    const response = await request(app)
      .get("/api/me/tag")
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response.status).toBe(200);

    const responseBody: GetMyTagsResponse = response.body;

    expect(responseBody.data.length).toBeGreaterThan(0);

    // I check that there is no repeated tag by id
    for (let lastIndex = responseBody.data.length - 1; lastIndex >= 0; lastIndex--) {
      // I do a reverse for-loop just for efficiency
      const tag = responseBody.data[lastIndex];
      const firstIndexInList = responseBody.data.findIndex(findTag => tag.uniqueId === findTag.uniqueId);

      expect(lastIndex).toEqual(firstIndexInList);
    }
  });
});
