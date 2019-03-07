import { BadRequestErrorResponse } from "./GenericResponses";
import { AlbumRequest } from "./AlbumRequest";

export class TagOnAlbumRequest extends AlbumRequest {
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

    AlbumRequest.checkConsistency(bodyAny); // this will throw an exception when fails

    if (!body.tag) {
      throw new BadRequestErrorResponse("tag field is required");
    }

    if (!body.tag.name) {
      throw new BadRequestErrorResponse("tag.name field is required");
    }

    return body;
  }
}