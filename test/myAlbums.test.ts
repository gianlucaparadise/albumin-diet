import request from "supertest";
import querystring from "querystring";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";
import { GetMyAlbumsResponse, GetMyAlbumsRequest, GetAlbumResponse } from "../src/models/responses/GetMyAlbums";
import { AlbumRequest } from "../src/models/requests/AlbumRequest";

const testTags = ["This is a test tag", "This is another test tag"];
const testSpotifyAlbumId = "5cPHT4yMCfETLRYAoBFcOZ"; // Ma Fleur - Cinematic Orchestra
const newSpotifyAlbumId = "0OTvxFZwmfmKoDGyFKWWNe"; // ep seeds - eevee

describe("GET/PUT/DELETE MyAlbums", () => {
  afterAll(async () => {
    for (const tag of testTags) {
      const response0 = await request(app)
        .delete("/api/me/tag")
        .send({ album: { spotifyId: testSpotifyAlbumId }, tag: { name: tag } })
        .set("Authorization", `Bearer ${ACCESS_TOKEN}`);
    }

    const requestBody: AlbumRequest = { album: { spotifyId: newSpotifyAlbumId } };
    const responseDelete = await request(app)
      .delete(`/api/me/album`)
      .send(requestBody)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);
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
        .post("/api/me/tag")
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

  it("should save and delete album", async () => {
    //#region 1: I save an album
    const requestBody: AlbumRequest = { album: { spotifyId: newSpotifyAlbumId } };

    const responseSave = await request(app)
      .put(`/api/me/album`)
      .send(requestBody)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseSave.status).toBe(200);
    //#endregion

    //#region 2: I get my albums list to check if the album is returned
    const responseGet = await request(app)
      .get(`/api/me/album`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseGet.status).toBe(200);
    const responseGetBody: GetMyAlbumsResponse = responseGet.body;

    expect(responseGetBody.data).not.toBeNull();
    expect(responseGetBody.data.length).toBeGreaterThan(0);

    const index = responseGetBody.data.findIndex(x => x.album.id === newSpotifyAlbumId);
    expect(index).not.toEqual(-1);
    //#endregion

    //#region 3: I delete the previous album
    const responseDelete = await request(app)
      .delete(`/api/me/album`)
      .send(requestBody)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseDelete.status).toBe(200);
    //#endregion

    //#region 4: I get my albums list to check if the album is returned
    const responseGet2 = await request(app)
      .get(`/api/me/album`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseGet2.status).toBe(200);
    const responseGet2Body: GetMyAlbumsResponse = responseGet2.body;

    expect(responseGet2Body.data).not.toBeNull();
    expect(responseGet2Body.data.length).toBeGreaterThan(0);

    const index2 = responseGet2Body.data.findIndex(x => x.album.id === newSpotifyAlbumId);
    expect(index2).toEqual(-1);
    //#endregion
  });
});