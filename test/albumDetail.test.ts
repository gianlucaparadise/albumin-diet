import request from "supertest";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";
import { GetAlbumResponse } from "../src/models/public/GetMyAlbums";

const testSpotifyAlbumId = "0B0Zwfcy4pAY2JAoxIEkR5"; // Band of Gypsys - Jimi Hendrix

describe("GetAlbum by Spotify Id", () => {
  it("should return album with logged user's tags", async () => {
    const response = await request(app)
      .get(`/api/me/album/${testSpotifyAlbumId}`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response.status).toBe(200);
    const body = <GetAlbumResponse>response.body;
    expect(body.data.album.id).toEqual(testSpotifyAlbumId);
    // todo: write better tests
  });
});