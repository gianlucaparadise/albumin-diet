import { IAlbum } from "../Album";
import { ITag } from "../Tag";
import { BaseResponse } from "./GenericResponses";

export class GetMyAlbumsRequest {
  /**
   * This is a stringified JSON array
   */
  tags?: string;

  limit?: number;
  offset?: number;
}

/**
 * Tags indexed by spotify Album id
 * Used for calculation, not returned to the user.
 */
export class TagsByAlbum {
  [spotifyAlbumId: string]: {
    album: IAlbum;
    tags: ITag[];
  }
}

class TaggedAlbum {
  album: SpotifyApi.SavedAlbumObject;
  tags: ITag[];
}

export class GetMyAlbumsResponse extends BaseResponse<TaggedAlbum[]> {
  /**
   * This builds the response starting from data retrieved using spotify api and DB.
   * @param spotifyAlbums albums retrieved using spotify apis
   * @param tagsByAlbum user's tags grouped by album spotify id
   * @param onlyTagged set this to true if you only want all the albums that have at least one tag
   */
  static createFromSpotifyAlbums(spotifyAlbums: SpotifyApi.SavedAlbumObject[], tagsByAlbum: TagsByAlbum, onlyTagged: boolean): GetMyAlbumsResponse {

    const taggedAlbumList = spotifyAlbums.reduce((taggedAlbums, x) => {
      const spotifyAlbum = x;
      const grouped = tagsByAlbum[x.album.id];
      const tags = grouped ? grouped.tags : [];

      if (onlyTagged) {
        // if I want only tagged albums and I don't have any tag, I skip this line
        if (!tags || tags.length <= 0) {
          return taggedAlbums;
        }
      }

      const taggedAlbum: TaggedAlbum = { album: spotifyAlbum, tags: tags };
      taggedAlbums.push(taggedAlbum);
      return taggedAlbums;

    }, <TaggedAlbum[]>[]);

    return new GetMyAlbumsResponse(taggedAlbumList);
  }
}