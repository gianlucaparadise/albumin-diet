import { IAlbum } from "../interfaces/IAlbum";
import { ITag } from "../interfaces/ITag";
import { BaseResponse, BasePaginationRequest } from "./GenericResponses";
import { IUser } from "../interfaces/IUser";

export class GetMyAlbumsRequest extends BasePaginationRequest {
  /**
   * This is a stringified JSON array
   */
  tags?: string;
  /**
   * Send this to `true` to get albums without tags. Default is `false`.
   * This is a string because all querystring params are always strings.
   */
  untagged?: string;
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

export class UserAlbum {
class UserAlbum {
  album: SpotifyApi.AlbumObjectFull;
  /**
   * This is true when this album is in the listening list
   */
  isInListeningList: boolean;
}

export class TaggedAlbum extends UserAlbum {
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
   * @param tagFilter When evaluated, only the albums with these tags will be returned
   * @param untagged When `true`, only the albums without tags will be returned
   */
  static createFromSpotifyAlbums(spotifyAlbums: SpotifyApi.AlbumObjectFull[], tagsByAlbum: TagsByAlbum, tagFilter: string[], untagged: boolean, user: IUser): GetMyAlbumsResponse {

    // Grouping albums by spotifyId
    tagFilter = tagFilter || [];

    const hasTagFilter = tagFilter.length > 0;
    const hasFilters = untagged || hasTagFilter;

    const taggedAlbumList = spotifyAlbums.reduce((taggedAlbums, x) => {
      const spotifyAlbum = x;
      const grouped = tagsByAlbum[x.id];
      const tags = grouped ? grouped.tags : [];
      const tagNames = tags.map(t => t.uniqueId);

      // If no filters in input: I return them all
      // If I have filters in input: I return only the one that matches at least one filter

      if (hasFilters) {
        // If I have filters, I get only the albumTags that match at least one filter
        // The filters are meant to be in OR and not in AND
        let matchesFilter = false;
        matchesFilter = matchesFilter || (untagged && tags.length == 0);
        matchesFilter = matchesFilter || (hasTagFilter && haveCommonElements(tagNames, tagFilter));

        if (!matchesFilter) {
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

const intersect = function <T>(array1: T[], array2: T[]) {
  array1 = array1 || [];
  array2 = array2 || [];
  return array1.filter(value => array2.indexOf(value) !== -1);
};

const haveCommonElements = function <T>(array1: T[], array2: T[]) {
  const intersection = intersect(array1, array2);
  return intersection && intersection.length > 0;
};