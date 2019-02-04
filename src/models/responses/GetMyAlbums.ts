import { IAlbum } from "../Album";
import { ITag } from "../Tag";
import { BaseResponse, BasePaginationRequest } from "./GenericResponses";
import { IUser } from "../User";

export class GetMyAlbumsRequest extends BasePaginationRequest {
  /**
   * This is a stringified JSON array
   */
  tags?: string;
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

class UserAlbum {
  album: SpotifyApi.AlbumObjectFull;
}

class TaggedAlbum extends UserAlbum {
  tags: ITag[];
  /**
   * This is true when this album is one of the current user's saved albums
   */
  isSavedAlbum: boolean;
  /**
   * This is true when this album is in the listening list
   */
  isInListeningList: boolean;
}

export class GetMyAlbumsResponse extends BaseResponse<TaggedAlbum[]> {
  /**
   * This builds the response starting from data retrieved using spotify api and DB.
   * @param spotifyAlbums albums retrieved using spotify apis
   * @param tagsByAlbum user's tags grouped by album spotify id
   * @param onlyTagged set this to true if you only want all the albums that have at least one tag
   * @param areSavedAlbums set this to true if input albums are all saved albums. Set this to false when no one is a saved album.
   */
  static createFromSpotifyAlbums(spotifyAlbums: SpotifyApi.AlbumObjectFull[], tagsByAlbum: TagsByAlbum, onlyTagged: boolean, user: IUser): GetMyAlbumsResponse {

    const taggedAlbumList = spotifyAlbums.reduce((taggedAlbums, x) => {
      const spotifyAlbum = x;
      const grouped = tagsByAlbum[x.id];
      const tags = grouped ? grouped.tags : [];

      if (onlyTagged) {
        // if I want only tagged albums and I don't have any tag, I skip this line
        if (!tags || tags.length <= 0) {
          return taggedAlbums;
        }
      }

      const isInListeningList = user.listeningList.indexOf(spotifyAlbum.id) >= 0;
      const taggedAlbum: TaggedAlbum = { album: spotifyAlbum, tags: tags, isSavedAlbum: true, isInListeningList: isInListeningList, };
      taggedAlbums.push(taggedAlbum);
      return taggedAlbums;

    }, <TaggedAlbum[]>[]);

    return new GetMyAlbumsResponse(taggedAlbumList);
  }
}

export class GetListeningListResponse extends BaseResponse<UserAlbum[]> {
  static createFromSpotifyAlbums(spotifyAlbums: SpotifyApi.AlbumObjectFull[]): GetListeningListResponse {
    const userAlbumList = spotifyAlbums.map(a => <UserAlbum>{ album: a });

    return new GetListeningListResponse(userAlbumList);
  }
}

export class GetAlbumResponse extends BaseResponse<TaggedAlbum> {
  static createFromSpotifyAlbum(spotifyAlbums: SpotifyApi.MultipleAlbumsNodeResponse, tags: ITag[], isSavedAlbum: boolean, user: IUser): GetAlbumResponse {
    const album = spotifyAlbums.body.albums[0];
    const isInListeningList = user.listeningList.indexOf(album.id) >= 0;
    const body: TaggedAlbum = {
      tags: tags,
      album: album,
      isSavedAlbum: isSavedAlbum,
      isInListeningList: isInListeningList,
    };

    const result = new GetAlbumResponse(body);
    return result;
  }
}