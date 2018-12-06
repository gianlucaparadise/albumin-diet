import request from "supertest";
import app from "../src/app";
import { User } from "../src/models/User";

const testProfile = {
  id: "myfaketestuser",
  displayName: "My Fake Test User"
};
const testAccessToken = "1";
const testRefreshToken = "2";

describe("User schema methods test", () => {

  beforeAll(async () => {
    const deletedUser = await User.findOneAndDelete({ "spotify.id": testProfile.id });
  });

  it("should create user and update it", async () => {
    request(app);

    const userNew = await User.upsertSpotifyUser(testProfile, testAccessToken, testRefreshToken);
    expect(userNew).not.toBeNull();
    expect(userNew.spotify.id).toEqual(testProfile.id);
    expect(userNew.spotify.accessToken).toBe(testAccessToken);

    const newAccessToken = testAccessToken + "new";
    const newRefreshToken = testRefreshToken + "new";
    const userUpdate = await User.upsertSpotifyUser(testProfile, newAccessToken, newRefreshToken);
    expect(userUpdate).not.toBeNull();
    expect(userUpdate.spotify.accessToken).toBe(newAccessToken);
    expect(userUpdate.spotify.refreshToken).toBe(newRefreshToken);
  });

  afterAll(async () => {
    const deletedUser = await User.findOneAndDelete({ "spotify.id": testProfile.id });
    if (!deletedUser) {
      throw new Error("Test user not deleted");
    }
  });
});