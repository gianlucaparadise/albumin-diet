// Type definitions for The Spotify Node Wrapper
// Project: https://developer.spotify.com/web-api/
// Npm Module: https://github.com/thelinmichael/spotify-web-api-node
// Definitions by: Gianluca Paradiso <https://github.com/gianlucaparadise>

import { UserObjectPublic, UserObjectPrivate, UsersSavedAlbumsResponse, MultipleAlbumsResponse, CheckUserSavedAlbumsResponse, CheckUsersSavedTracksResponse, AlbumSearchResponse, ArtistSearchResponse } from "./spotify-web-api-typings";

/**
 * All the responses in "spotify-web-api-node" are wrapped in this class
 */
export interface SpotifyNodeResponse<T> {
  body: T;
  headers: any;
  statusCode: number;
}

/**
 * Base request for all the paged responses
 *
 * @param market Optional. An ISO 3166-1 alpha-2 country code or the string from_token
 * @param limit Optional. The maximum number of results to return. Default: 20. Minimum: 1. Maximum: 50.
 * @param offset Optional. The index of the first result to return. Default: 0 (i.e., the first result). Maximum offset: 100.000. Use with limit to get the next page of search results.
 */
export interface PagingRequestObject {
  market?: string;
  limit?: number;
  offset?: number;
}

//#region NodeResponses
export interface UserProfileAuthenticationNodeResponse {
  provider: "spotify";
  id: string;
  username: string;
  displayName: string;
  profileUrl: string;
  photos: string[];
  country: string;
  followers: number;
  product: string;
  _raw: string;
  _json: UserObjectPublic;
}

export interface UserObjectPrivateNodeResponse extends SpotifyNodeResponse<UserObjectPrivate> { }
export interface UsersSavedAlbumsNodeResponse extends SpotifyNodeResponse<UsersSavedAlbumsResponse> { }
export interface MultipleAlbumsNodeResponse extends SpotifyNodeResponse<MultipleAlbumsResponse> { }
export interface CheckUserSavedAlbumsNodeResponse extends SpotifyNodeResponse<CheckUserSavedAlbumsResponse> { }
export interface CheckUserSavedTracksNodeResponse extends SpotifyNodeResponse<CheckUsersSavedTracksResponse> { }
export interface AlbumSearchNodeResponse extends SpotifyNodeResponse<AlbumSearchResponse> { }
export interface ArtistSearchNodeResponse extends SpotifyNodeResponse<ArtistSearchResponse> { }
//#endregion