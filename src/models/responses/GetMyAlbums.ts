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
  /**
   * This is true when this album is in the listening list
   */
  isInListeningList: boolean;
}

class TaggedAlbum extends UserAlbum {
  tags: ITag[];
  /**
   * This is true when this album is one of the current user's saved albums
   */
  isSavedAlbum: boolean;
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

export class UserAlbumsResponse extends BaseResponse<UserAlbum[]> {
  static createFromSpotifyAlbums(spotifyAlbums: SpotifyApi.AlbumObjectFull[], listeningList: boolean | string[]): UserAlbumsResponse {
    const userAlbumList = spotifyAlbums.map(a => {
      let isInListeningList = false;

      if (typeof listeningList === "boolean") {
        isInListeningList = listeningList;
      }
      else if (listeningList instanceof Array) {
        isInListeningList = listeningList.indexOf(a.id) !== -1;
      }

      const result: UserAlbum = { album: a, isInListeningList: isInListeningList };
      return result;
    });

    return new UserAlbumsResponse(userAlbumList);
  }
}

export class GetAlbumResponse extends BaseResponse<TaggedAlbum> {
  static createFromSpotifyAlbum(album: SpotifyApi.AlbumObjectFull, tags: ITag[], isSavedAlbum: boolean, user: IUser): GetAlbumResponse {
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