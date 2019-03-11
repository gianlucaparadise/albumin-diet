import { BaseResponse, BasePaginationRequest } from './GenericResponses';
import { ArtistSearchResponse } from 'spotify-web-api-node-typings';

export class SearchRequest extends BasePaginationRequest {
  /**
   * This contains the search keywords
   */
  q: string;
}

export class SearchArtistResponse extends BaseResponse<ArtistSearchResponse> { }
