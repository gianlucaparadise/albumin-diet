import { BadRequestErrorResponse } from "../responses/GenericResponses";

export class AlbumInListeningListRequest {
  album: {
    spotifyId: string;
  };

  static checkConsistency(bodyAny: any): AlbumInListeningListRequest {
    const body = <TagOnAlbumRequest>bodyAny;
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
export class TagOnAlbumRequest extends AlbumInListeningListRequest {
  tag: {
    name: string;
  };

  /**
   * Checks if the input body is type of SetTagOnAlbumRequest and
   * throws errors if something is wrong
   * @param body POST request payload
   */
  static checkConsistency(bodyAny: any): TagOnAlbumRequest {
    const body = <TagOnAlbumRequest>bodyAny;
    if (!body) {
      throw new BadRequestErrorResponse("Missing Body");
    }

    AlbumInListeningListRequest.checkConsistency(bodyAny); // this will throw an exception when fails

    if (!body.tag) {
      throw new BadRequestErrorResponse("tag field is required");
    }

    if (!body.tag.name) {
      throw new BadRequestErrorResponse("tag.name field is required");
    }

    return body;
  }
}