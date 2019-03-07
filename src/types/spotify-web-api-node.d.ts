import { UserObjectPrivateNodeResponse, PagingRequestObject, UsersSavedAlbumsNodeResponse, MultipleAlbumsNodeResponse, VoidResponse, CheckUserSavedAlbumsNodeResponse, CheckUserSavedTracksNodeResponse, AlbumSearchNodeResponse, ArtistSearchNodeResponse } from "spotify-web-api-node-typings";

declare module "spotify-web-api-node" {
  export default class SpotifyWebApi {
    // lib docs: https://github.com/thelinmichael/spotify-web-api-node
    // api docs: https://developer.spotify.com/documentation/web-api/reference/
    // models docs: https://developer.spotify.com/documentation/web-api/reference/object-model/

    constructor(params: {
      clientId: string,
      clientSecret: string,
    });

    setAccessToken(accessToken: String): void;

    setRefreshToken(refreshToken: String): void;

    getAccessToken(): String;

    getRefreshToken(): String;

    refreshAccessToken(): Promise<any>;

    getMe(): Promise<UserObjectPrivateNodeResponse>;

    getMySavedAlbums(options: PagingRequestObject): Promise<UsersSavedAlbumsNodeResponse>;

    /**
     * Get Spotify catalog information for multiple albums identified by their Spotify IDs.
     * @param ids A list of the Spotify IDs for the albums. Maximum: 20 IDs.
     */
    getAlbums(ids: string[]): Promise<MultipleAlbumsNodeResponse>;

    /**
     * Save one or more albums to the current user’s ‘Your Music’ library.
     * @param ids A list of the Spotify IDs. Maximum: 50 IDs.
     */
    addToMySavedAlbums(ids: string[]): Promise<VoidResponse>;

    /**
     * Remove one or more albums from the current user’s ‘Your Music’ library.
     * @param ids A list of the Spotify IDs. Maximum: 50 IDs.
     */
    removeFromMySavedAlbums(ids: string[]): Promise<VoidResponse>;

    /**
     * Check if one or more albums is already saved in the current Spotify user’s ‘Your Music’ library.
     */
    containsMySavedAlbums(ids: string[]): Promise<CheckUserSavedAlbumsNodeResponse>;

    /**
     * Check if one or more tracks is already saved in the current Spotify user’s ‘Your Music’ library.
     */
    containsMySavedTracks(ids: string[]): Promise<CheckUserSavedTracksNodeResponse>;

    searchAlbums(keywords: string, options: PagingRequestObject): Promise<AlbumSearchNodeResponse>;

    searchArtists(keywords: string, options: PagingRequestObject): Promise<ArtistSearchNodeResponse>;
  }
}