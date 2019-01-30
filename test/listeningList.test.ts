import request from "supertest";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";
import { GetMyAlbumsResponse, GetAlbumResponse } from "../src/models/responses/GetMyAlbums";

const testSpotifyAlbumId = "0BYFg5LjHvQZomF666Kaa2"; // Beets 4 - Birocratic

describe("Listening List tests", () => {
  afterAll(async () => {
    const response0 = await request(app)
      .delete("/api/me/listening-list")
      .send({ album: { spotifyId: testSpotifyAlbumId } })
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);
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
      .send({ album: { spotifyId: testSpotifyAlbumId } })
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
    const findResult = body.data.findIndex(a => a.album.id === testSpotifyAlbumId);
    expect(findResult).not.toBe(-1);
    //#endregion

    //#region 3. I remove the initial album from listening list
    const responseDelete = await request(app)
      .delete("/api/me/listening-list")
      .send({ album: { spotifyId: testSpotifyAlbumId } })
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
    const findResult2 = body2.data.findIndex(a => a.album.id === testSpotifyAlbumId);
    expect(findResult2).toBe(-1);
    //#endregion
  });

  it("GET album should have isInListeningList prop", async () => {
    //#region 1. I add an album to listening-list
    const responseAdd = await request(app)
      .post("/api/me/listening-list")
      .send({ album: { spotifyId: testSpotifyAlbumId } })
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseAdd.status).toBe(200);
    //#endregion

    //#region 2. I get the album
    const responseGet = await request(app)
      .get(`/api/me/album/${testSpotifyAlbumId}`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseGet.status).toBe(200);
    const body = <GetAlbumResponse>responseGet.body;
    expect(body.data.album).toBeTruthy();
    expect(body.data.isInListeningList).toBe(true);
    //#endregion

    //#region 3. I remove the initial album from listening list
    const responseDelete = await request(app)
      .delete("/api/me/listening-list")
      .send({ album: { spotifyId: testSpotifyAlbumId } })
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseDelete.status).toBe(200);
    //#endregion

    //#region 4. I re-get the listening list
    const responseGet2 = await request(app)
      .get(`/api/me/album/${testSpotifyAlbumId}`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseGet2.status).toBe(200);
    const body2 = <GetAlbumResponse>responseGet2.body;
    expect(body2.data.album).toBeTruthy();
    expect(body2.data.isInListeningList).toBe(false);
    //#endregion
  });
});