import request from "supertest";
import app from "../src/app";
import { User } from "../src/models/User";

const testProfile = {
  id: "myfaketestuser",
  displayName: "My Fake Test User"
};
const testAccessToken = "1jnjn3i54jn3i45jn3i4j5n3ij45n3i4j5";
const testRefreshToken = "2ni353ni45n3i4jn53ij45n3i45n3i4u5";

describe("User schema methods test", () => {

  beforeAll(async () => {
    const deletedUser = await User.findOneAndDelete({ "spotify.id": testProfile.id });
  });

  it("should create user and update it", async () => {
    request(app);

    const userNew = await User.upsertSpotifyUser(testProfile, testAccessToken, testRefreshToken);
    expect(userNew).not.toBeNull();
    expect(userNew.spotify.id).toEqual(testProfile.id);
    expect(userNew.getDecryptedAccessToken()).toBe(testAccessToken);

    const newAccessToken = testAccessToken + "new";
    const newRefreshToken = testRefreshToken + "new";
    const userUpdate = await User.upsertSpotifyUser(testProfile, newAccessToken, newRefreshToken);
    expect(userUpdate).not.toBeNull();
    expect(userUpdate.getDecryptedAccessToken()).toBe(newAccessToken);
    expect(userUpdate.getDecryptedRefreshToken()).toBe(newRefreshToken);

    const newAccessToken2 = testAccessToken + "supernew";
    const userUpdate2 = await userUpdate.updateSpotifyAccessToken(newAccessToken2);
    expect(userUpdate2).not.toBeNull();
    expect(userUpdate2.getDecryptedAccessToken()).toBe(newAccessToken2);
  });

  afterAll(async () => {
    const deletedUser = await User.findOneAndDelete({ "spotify.id": testProfile.id });
    if (!deletedUser) {
      throw new Error("Test user not deleted");
    }
  });
});