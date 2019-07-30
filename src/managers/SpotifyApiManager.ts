import { SPOTIFY_ID, SPOTIFY_SECRET } from '../util/secrets';
import { IUserDocument } from '../models/User';
import logger from '../util/logger';

import SpotifyWebApi from 'spotify-web-api-node';
import {
  UserObjectPrivateNodeResponse, UsersSavedAlbumsNodeResponse,
  PagingRequestObject, MultipleAlbumsNodeResponse,
  AlbumObjectFull, AlbumSearchNodeResponse,
  ArtistSearchNodeResponse
} from 'spotify-web-api-node-typings';

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

  private static async RefreshToken(user: IUserDocument): Promise<boolean> {
    logger.debug('Refreshing spotify token');

    try {
      const data = await SpotifyApiManager.Api.refreshAccessToken();

      const accessToken: string = data.body['access_token'];

      const newUser = await user.updateSpotifyAccessToken(accessToken);

      SpotifyApiManager.Api.setAccessToken(accessToken);
      return Promise.resolve(true);

    } catch (error) {
      logger.error('Error while refreshing token: ');
      logger.error(error);

      return Promise.reject(error);
    }
  }

  /**
   * This is something like a middleware for all the requests that needs
   * the token to be refreshed when needed
   *
   * @param user Current user
   * @param buildRequest Function that returns the request to perform.
   */
  private static async request<T>(user: IUserDocument, buildRequest: () => Promise<T>): Promise<T> {
    try {
      // I need a request builder instead of the final request because if I don't re-build it,
      // the request will use the old spotifyApi instance with the old accessToken
      const req = buildRequest();
      return await req;
    } catch (error) {
      if (error.statusCode === 401) {
        const hasRefreshed = await SpotifyApiManager.RefreshToken(user);
        if (hasRefreshed) {
          // now that is refreshed, I re-try one last time the initial request
          try {
            const req = buildRequest();
            return await req;
          } catch (error2) {
            // If I get again an error, I don't want to try another time to avoid a long loop
            return Promise.reject(error2);
          }
        }
      }
      return Promise.reject(error);
    }
  }

  public static async GetProfile(user: IUserDocument): Promise<UserObjectPrivateNodeResponse> {
    try {
      const response = await this.request(user, () => SpotifyApiManager.Api.getMe());
      return response;

    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * This returns user's saved albums from spotify (you may find singles in it)
   */
  public static async GetMySavedAlbums(user: IUserDocument, limit: number = 20, offset: number = 0): Promise<UsersSavedAlbumsNodeResponse> {

    try {
      const params: PagingRequestObject = {
        limit: limit,
        offset: offset
      };
      const response = await this.request(user, () => SpotifyApiManager.Api.getMySavedAlbums(params));

      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * This returns input albums (may return singles)
   * @param ids A list of the Spotify IDs for the albums. Maximum: 20 IDs.
   */
  public static async GetAlbums(user: IUserDocument, ids: string[]): Promise<MultipleAlbumsNodeResponse> {

    try {
      const response = await this.request(user, () => SpotifyApiManager.Api.getAlbums(ids));

      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * This API checks if all the tracks of the input album are saved. If so, the album is fully saved.
   *
   * @param user Current user
   * @param album Album to check
   */
  public static async IsMySavedAlbum(user: IUserDocument, album: AlbumObjectFull): Promise<boolean> {

    try {
      const checkAlbumsResponse = await this.request(user, () => SpotifyApiManager.Api.containsMySavedAlbums([album.id]));
      const isSavedAlbum = checkAlbumsResponse.body.indexOf(false) === -1;

      if (!isSavedAlbum) {
        // this is not saved for sure
        return Promise.resolve(false);
      }

      /**
       * When a subset of the album's songs is saved, spotify considers this album "saved"
       * With the new Spotify update, an album is saved when `containsMySavedAlbums` returns `true`
       * and one of the following conditions are satisfied:
       * - all songs are saved
       * - none of the songs is saved
       */

      const trackIds = album.tracks.items.map(t => t.id);

      // FIXME: This API supports max 50 tracks. If input album has more than 50 tracks, I need to check tracks in blocks of 50 tracks
      const checkTracksResponse = await this.request(user, () => SpotifyApiManager.Api.containsMySavedTracks(trackIds));
      const areAllSaved = checkTracksResponse.body.indexOf(false) === -1;
      const noneIsSaved = checkTracksResponse.body.indexOf(true) === -1;

      const isAlbumSaved = areAllSaved || noneIsSaved;

      return Promise.resolve(isAlbumSaved);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Adds input album in current user's library
   * @param user Current user
   * @param albumId Album to save
   */
  public static async AddToMyAlbum(user: IUserDocument, albumId: string): Promise<void> {
    try {
      const response = await this.request(user, () => SpotifyApiManager.Api.addToMySavedAlbums([albumId]));
      return Promise.resolve();

    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Removes input album from current user's library
   * @param user Current user
   * @param albumId Album to remove
   */
  public static async RemoveFromMyAlbum(user: IUserDocument, albumId: string): Promise<void> {
    try {
      const response = await this.request(user, () => SpotifyApiManager.Api.removeFromMySavedAlbums([albumId]));
      return Promise.resolve();

    } catch (error) {
      return Promise.reject(error);
    }
  }

  public static async SearchAlbums(user: IUserDocument, keywords: string, limit: number, offset: number): Promise<AlbumSearchNodeResponse> {

    try {
      const options = {
        limit: limit,
        offset: offset
      };
      const response = await this.request(user, () => SpotifyApiManager.Api.searchAlbums(keywords, options));

      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public static async SearchArtists(user: IUserDocument, keywords: string,
    limit: number, offset: number): Promise<ArtistSearchNodeResponse> {

    try {
      const options = {
        limit: limit,
        offset: offset
      };
      const response = await this.request(user, () => SpotifyApiManager.Api.searchArtists(keywords, options));

      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
