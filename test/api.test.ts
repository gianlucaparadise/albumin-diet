import request from "supertest";
import app from "../src/app";
import { ACCESS_TOKEN } from "./util/testSecrets";
import { TagOnAlbumRequest } from "../src/models/requests/SetTagOnAlbumRequest";

// This fixes missing logs (jest issue #3853)
// console.log = s => {
//   if (s instanceof Object) process.stdout.write(JSON.stringify(s) + "\n");
//   else process.stdout.write(s + "\n");
// };

const testSpotifyAlbumId = "thisisnotanalbumid";
const testTagName = "This is a test tag";

describe("POST TagOnAlbum", () => {
  it("should return 401", async () => {
    const req: TagOnAlbumRequest = {
      album: {
        spotifyId: testSpotifyAlbumId
      },
      tag: {
        name: testTagName
      }
    };

    // I don't send bearer
    const response = await request(app)
      .post("/api/me/tag")
      .send(req);

    expect(response.status).toBe(401);
  });

  it("should return 400 because of missing fields in request", async () => {
    const response1 = await request(app).post("/api/me/tag").set("Authorization", `Bearer ${ACCESS_TOKEN}`)
      .send({});

    expect(response1.status).toBe(400);

    const response2 = await request(app).post("/api/me/tag").set("Authorization", `Bearer ${ACCESS_TOKEN}`)
      .send({ album: {} });

    expect(response2.status).toBe(400);

    const response3 = await request(app).post("/api/me/tag").set("Authorization", `Bearer ${ACCESS_TOKEN}`)
      .send({ album: { spotifyId: "1" } });

    expect(response3.status).toBe(400);

    const response4 = await request(app).post("/api/me/tag").set("Authorization", `Bearer ${ACCESS_TOKEN}`)
      .send({ album: { spotifyId: "1" }, tag: {} });

    expect(response4.status).toBe(400);
  });

  it("should add first time and throw an error on re-add", async () => {
    const req: TagOnAlbumRequest = {
      album: {
        spotifyId: testSpotifyAlbumId
      },
      tag: {
        name: testTagName
      }
    };

    const myRequest = request(app)
      .post("/api/me/tag")
      .send(req)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    const response = await request(app)
      .post("/api/me/tag")
      .send(req)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response.status).toBe(200);

    // I try to re-add
    const response2 = await request(app)
      .post("/api/me/tag")
      .send(req)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response2.status).toBe(400);
  });
});

describe("DELETE TagOnAlbum", () => {
  it("should return 401", async () => {
    const req: TagOnAlbumRequest = {
      album: {
        spotifyId: testSpotifyAlbumId
      },
      tag: {
        name: testTagName
      }
    };

    const response = await request(app)
      .delete("/api/me/tag")
      .send(req);

    expect(response.status).toBe(401);
  });

  it("should return 400 because of missing fields in request", async () => {
    const response1 = await request(app).delete("/api/me/tag").set("Authorization", `Bearer ${ACCESS_TOKEN}`)
      .send({});

    expect(response1.status).toBe(400);

    const response2 = await request(app).delete("/api/me/tag").set("Authorization", `Bearer ${ACCESS_TOKEN}`)
      .send({ album: {} });

    expect(response2.status).toBe(400);

    const response3 = await request(app).delete("/api/me/tag").set("Authorization", `Bearer ${ACCESS_TOKEN}`)
      .send({ album: { spotifyId: "1" } });

    expect(response3.status).toBe(400);

    const response4 = await request(app).delete("/api/me/tag").set("Authorization", `Bearer ${ACCESS_TOKEN}`)
      .send({ album: { spotifyId: "1" }, tag: {} });

    expect(response4.status).toBe(400);
  });

  it("should delete first time and throw an error on re-delete", async () => {
    const req: TagOnAlbumRequest = {
      album: {
        spotifyId: testSpotifyAlbumId
      },
      tag: {
        name: testTagName
      }
    };

    const response = await request(app)
      .delete("/api/me/tag")
      .send(req)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response.status).toBe(200);

    // I try to re-delete
    const response2 = await request(app)
      .delete("/api/me/tag")
      .send(req)
      .set("Authorization", `Bearer ${ACCESS_TOKEN}`);

    expect(response2.status).toBe(400);
  });
});