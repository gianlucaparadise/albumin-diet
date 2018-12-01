import { SPOTIFY_ID, SPOTIFY_SECRET } from "../util/secrets";

const SpotifyWebApi = require("spotify-web-api-node");

// credentials are optional
const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_ID,
  clientSecret: SPOTIFY_SECRET,
});

export class SpotifyApiManager {
  private static _instance: SpotifyApiManager;

  private constructor() {

  }

  public static get Instance() {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this());
  }

  private get Api() {
    return spotifyApi;
  }

  public static get Api() {
    return this.Instance.Api;
  }

  public static async GetMySavedAlbums(): Promise<SpotifyApi.UsersSavedAlbumsNodeResponse> {

    try {
      const response: SpotifyApi.UsersSavedAlbumsNodeResponse = await SpotifyApiManager.Api.getMySavedAlbums({
        limit: 1,
        offset: 0
      });

      return Promise.resolve(response);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }
}