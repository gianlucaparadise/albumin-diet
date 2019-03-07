import { BadRequestErrorResponse } from "./GenericResponses";

/**
 * Generic request class that holds an AlbumId
 */
export class AlbumRequest {
  album: {
    spotifyId: string;
  };

  static checkConsistency(bodyAny: any): AlbumRequest {
    const body = <AlbumRequest>bodyAny;
    if (!body) {
      throw new BadRequestErrorResponse("Missing Body");
    }

    if (!body.album) {
      throw new BadRequestErrorResponse("album field is required");
    }

    if (!body.album.spotifyId) {
      throw new BadRequestErrorResponse("album.spotifyId field is required");
    }

    return body;
  }
}