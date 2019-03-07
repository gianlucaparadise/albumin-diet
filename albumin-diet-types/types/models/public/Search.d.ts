import { BaseResponse, BasePaginationRequest } from "./GenericResponses";
import { ArtistSearchResponse } from "spotify-web-api-node-typings";
export declare class SearchRequest extends BasePaginationRequest {
    q: string;
}
export declare class SearchArtistResponse extends BaseResponse<ArtistSearchResponse> {
}
