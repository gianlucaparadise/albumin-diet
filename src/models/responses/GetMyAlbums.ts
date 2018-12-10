import { IAlbum } from "../Album";
import { ITag } from "../Tag";
import { BaseResponse } from "./GenericResponses";

export class GetMyAlbumsRequest {
  /**
   * This is a stringified JSON array
   */
  tags: string;
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
   */
  static createFromSpotifyAlbums(spotifyAlbums: SpotifyApi.SavedAlbumObject[], tagsByAlbum: TagsByAlbum): GetMyAlbumsResponse {

    const taggedAlbumList = spotifyAlbums.map(x => {
      const spotifyAlbum = x;
      const grouped = tagsByAlbum[x.album.id];
      const tags = grouped ? grouped.tags : [];

      return <TaggedAlbum>{ album: spotifyAlbum, tags: tags };
    });

    return new GetMyAlbumsResponse(taggedAlbumList);
  }
}