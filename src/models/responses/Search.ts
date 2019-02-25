import { BaseResponse, BasePaginationRequest } from "./GenericResponses";

export class SearchRequest extends BasePaginationRequest {
  /**
   * This contains the search keywords
   */
  q: string;
}

export class SearchArtistResponse extends BaseResponse<SpotifyApi.ArtistSearchResponse> { }