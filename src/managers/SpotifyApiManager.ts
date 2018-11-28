/// <reference path="../../node_modules/@types/spotify-api/index.d.ts" />

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

  public static async GetMySavedAlbums(): Promise<SpotifyApi.UsersSavedAlbumsResponse> {

    try {
      const response: SpotifyApi.UsersSavedAlbumsResponse = await SpotifyApiManager.Api.getMySavedAlbums({
        limit: 1,
        offset: 0
      });
      console.log(response);
      // todo: UsersSavedAlbumsResponse is not the correct model
      // should have reponse.body
      return Promise.resolve(response);
    }
    catch (error) {
      return Promise.reject(error);
    }

    // .then(function (data:  ) {
    //   // Output items
    //   console.log(data.body.items);
    // }, function (err) {
    //   console.log("Something went wrong!", err);
    // });
  }
}