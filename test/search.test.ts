import request from "supertest";
import querystring from "querystring";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";
import { SearchRequest, SearchArtistResponse } from "../src/models/public/Search";
import { UserAlbumsResponse } from "../src/models/public/GetMyAlbums";

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
    const body = <UserAlbumsResponse>response.body;
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("Search should be paginated and return only albums", async () => {
    const keywords = "black sabbath";

    //#region 1. I get all the results (max 50)
    const reqFullObj: SearchRequest = { q: keywords, limit: "50", offset: "0" };
    const reqFull = querystring.stringify(reqFullObj);

    const responseAll = await request(app)
      .get(`/api/me/album/search?${reqFull}`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseAll.status).toBe(200);
    const resultsAll = <any[]>responseAll.body.data; // this is a list of AlbumFullObject

    console.log(`all: ${resultsAll.length}`);

    expect(resultsAll.length).toBeGreaterThan(0);
    expect(resultsAll.length).toBeLessThanOrEqual(50);
    //#endregion

    //#region 2. I get the last result
    const reqLastObj: SearchRequest = { q: keywords, limit: "1", offset: `${resultsAll.length - 1}` };
    const reqLast = querystring.stringify(reqLastObj);

    const responseLast = await request(app)
      .get(`/api/me/album/search?${reqLast}`)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(responseLast.status).toBe(200);
    const resultsLast = <any[]>responseLast.body.data; // this is a list of AlbumFullObject
    expect(resultsLast.length).toBe(1);
    //#endregion

    // I expect that the last result from call #1 is the same as call #2
    const lastFromFull = resultsAll[resultsAll.length - 1];
    const last = resultsLast[0];
    expect(lastFromFull.id).toBe(last.id);
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
    const body = <SearchArtistResponse>response.body;
    expect(body.data.artists.items.length).toBeGreaterThan(0);
  });
});