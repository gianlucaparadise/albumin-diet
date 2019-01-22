import { BaseResponse } from "./GenericResponses";

export class SearchRequest {
  /**
   * This contains the search keywords
   */
  q: string;

  limit?: number;
  offset?: number;
}

export class SearchAlbumResponse extends BaseResponse<SpotifyApi.AlbumSearchResponse> { }

export class SearchArtistResponse extends BaseResponse<SpotifyApi.ArtistSearchResponse> { }