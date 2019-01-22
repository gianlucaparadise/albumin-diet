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

  // private static async RefreshToken(): Promise<boolean> {
  //   try {
  //     const data = await SpotifyApiManager.Api.refreshAccessToken();
  //     // todo: I should save the token and send it back to the user
  //     console.log(`Refreshed accessToken: \n ${data.body["access_token"]}`);
  //     console.log(`I should save to user`);
  //     SpotifyApiManager.Api.setAccessToken(data.body["access_token"]);
  //     Promise.resolve(true);
  //   } catch (error) {
  //     return Promise.reject(error);
  //   }
  // }

  public static async GetMySavedAlbums(limit: number = 20, offset: number = 0): Promise<SpotifyApi.UsersSavedAlbumsNodeResponse> {

    try {
      const response: SpotifyApi.UsersSavedAlbumsNodeResponse = await SpotifyApiManager.Api.getMySavedAlbums({
        limit: limit,
        offset: offset
      });

      // todo: filter out singles, but not EPs (see: https://support.tunecore.com/hc/en-ca/articles/115006689928-What-is-the-difference-between-a-Single-an-EP-and-an-Album-)

      return Promise.resolve(response);
    }
    catch (error) {
      // // todo: If I get 401 I should refresh access token and re-send the request
      // if (error.statusCode == 401) {
      //   const hasRefreshed = await SpotifyApiManager.RefreshToken();
      //   if (hasRefreshed) {
      //     return SpotifyApiManager.GetMySavedAlbums();
      //   }
      // }
      return Promise.reject(error);
    }
  }

  public static async GetAlbum(id: string): Promise<SpotifyApi.MultipleAlbumsNodeResponse> {

    try {
      const response: SpotifyApi.MultipleAlbumsNodeResponse = await SpotifyApiManager.Api.getAlbums([id]);

      // todo: filter out singles, but not EPs (see: https://support.tunecore.com/hc/en-ca/articles/115006689928-What-is-the-difference-between-a-Single-an-EP-and-an-Album-)

      return Promise.resolve(response);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  public static async SearchAlbums(keywords: string, limit: number, offset: number): Promise<SpotifyApi.AlbumSearchNodeResponse> {

    try {
      const options = {
        limit: limit,
        offset: offset
      };
      const response: SpotifyApi.AlbumSearchNodeResponse = await SpotifyApiManager.Api.searchAlbums(keywords, options);

      // todo: filter out singles, but not EPs (see: https://support.tunecore.com/hc/en-ca/articles/115006689928-What-is-the-difference-between-a-Single-an-EP-and-an-Album-)

      return Promise.resolve(response);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  public static async SearchArtists(keywords: string, limit: number, offset: number): Promise<SpotifyApi.ArtistSearchNodeResponse> {

    try {
      const options = {
        limit: limit,
        offset: offset
      };
      const response: SpotifyApi.ArtistSearchNodeResponse = await SpotifyApiManager.Api.searchArtists(keywords, options);

      return Promise.resolve(response);
    }
    catch (error) {
      return Promise.reject(error);
    }
  }
}