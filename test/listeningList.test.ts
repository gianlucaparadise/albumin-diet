import request from "supertest";
import querystring from "querystring";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";
import { GetMyAlbumsResponse, GetAlbumResponse } from "../src/models/public/GetMyAlbums";
import { BasePaginationRequest } from "../src/models/public/GenericResponses";

const testSpotifyAlbumIds = [
  "0BYFg5LjHvQZomF666Kaa2", // Beets 4 - Birocratic
  "3iHi8rBMFv9CZQp5EWHgTa", // The Rat House - Liance
];

describe("Listening List tests", () => {
  afterAll(async () => {
    for (const testSpotifyAlbumId of testSpotifyAlbumIds) {
      const response0 = await request(app)
        .delete("/api/me/listening-list")
        .send({ album: { spotifyId: testSpotifyAlbumId } })
        .set("Authorization", `Bearer ${ACCESS_TOKEN}`);
    }
  });

  it("should return 401", async () => {
    const response = await request(app)
      .get("/api/me/listening-list");

    expect(response.status).toBe(401);
  });

  it("should add and remove album", async () => {
    //#region 1. I add an album to listening-list
    const responseAdd = await request(app)
      .post("/api/me/listening-list")
      .send({ album: { spotifyId: testSpotifyAlbumIds[0] } })
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseAdd.status).toBe(200);
    //#endregion

    //#region 2. I get the listening list
    const responseGet = await request(app)
      .get("/api/me/listening-list")
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseGet.status).toBe(200);
    const body = <GetMyAlbumsResponse>responseGet.body;
    expect(body.data.length).toBeGreaterThan(0);

    // I expect to find the input album in the response
    const findResult = body.data.findIndex(a => a.album.id === testSpotifyAlbumIds[0]);
    expect(findResult).not.toBe(-1);
    //#endregion

    //#region 3. I remove the initial album from listening list
    const responseDelete = await request(app)
      .delete("/api/me/listening-list")
      .send({ album: { spotifyId: testSpotifyAlbumIds[0] } })
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseDelete.status).toBe(200);
    //#endregion

    //#region 4. I re-get the listening list
    const responseGet2 = await request(app)
      .get("/api/me/listening-list")
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseGet2.status).toBe(200);
    const body2 = <GetMyAlbumsResponse>responseGet2.body;

    // I expect to NOT find the input album in the response
    const findResult2 = body2.data.findIndex(a => a.album.id === testSpotifyAlbumIds[0]);
    expect(findResult2).toBe(-1);
    //#endregion
  });

  it("GET album should have isInListeningList prop", async () => {
    //#region 1. I add an album to listening-list
    const responseAdd = await request(app)
      .post("/api/me/listening-list")
      .send({ album: { spotifyId: testSpotifyAlbumIds[0] } })
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseAdd.status).toBe(200);
    //#endregion

    //#region 2. I get the album
    const responseGet = await request(app)
      .get(`/api/me/album/${testSpotifyAlbumIds[0]}`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseGet.status).toBe(200);
    const body = <GetAlbumResponse>responseGet.body;
    expect(body.data.album).toBeTruthy();
    expect(body.data.isInListeningList).toBe(true);
    //#endregion

    //#region 3. I remove the initial album from listening list
    const responseDelete = await request(app)
      .delete("/api/me/listening-list")
      .send({ album: { spotifyId: testSpotifyAlbumIds[0] } })
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseDelete.status).toBe(200);
    //#endregion

    //#region 4. I re-get the listening list
    const responseGet2 = await request(app)
      .get(`/api/me/album/${testSpotifyAlbumIds[0]}`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseGet2.status).toBe(200);
    const body2 = <GetAlbumResponse>responseGet2.body;
    expect(body2.data.album).toBeTruthy();
    expect(body2.data.isInListeningList).toBe(false);
    //#endregion
  });

  it("GET Listening List should be paginated", async () => {
    //#region 1. I add two albums to my listening list
    for (const testSpotifyAlbumId of testSpotifyAlbumIds) {
      const response0 = await request(app)
        .post("/api/me/listening-list")
        .send({ album: { spotifyId: testSpotifyAlbumId } })
        .set("Authorization", `Bearer ${ACCESS_TOKEN}`);
    }
    //#endregion

    //#region 2. I get all albums in my listening list
    const responseFull = await request(app)
      .get("/api/me/listening-list")
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseFull.status).toBe(200);

    const bodyFull = <GetMyAlbumsResponse>responseFull.body;
    const fullListeningList = bodyFull.data;
    expect(fullListeningList.length).toBeGreaterThanOrEqual(2);
    //#endregion

    //#region 3. I get first album and check that is the first of the prev list
    {
      const reqObj: BasePaginationRequest = { offset: "0", limit: "1" };
      const req = querystring.stringify(reqObj);

      const response = await request(app)
        .get(`/api/me/listening-list?${req}`)
        .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

      expect(response.status).toBe(200);

      const body = <GetMyAlbumsResponse>response.body;
      expect(body.data.length).toBe(1);

      const albumId = body.data[0].album.id;
      expect(albumId).toBe(fullListeningList[0].album.id);
    }
    //#endregion

    //#region 4. I get second album and check that is the second of the prev list
    {
      const reqObj: BasePaginationRequest = { offset: "1", limit: "1" };
      const req = querystring.stringify(reqObj);

      const response = await request(app)
        .get(`/api/me/listening-list?${req}`)
        .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

      expect(response.status).toBe(200);

      const body = <GetMyAlbumsResponse>response.body;
      expect(body.data.length).toBe(1);

      const albumId = body.data[0].album.id;
      expect(albumId).toBe(fullListeningList[1].album.id);
    }
    //#endregion
  });
});