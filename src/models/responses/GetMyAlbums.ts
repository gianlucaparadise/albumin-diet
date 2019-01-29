import { IAlbum } from "../Album";
import { ITag, Tag, ListeningListTagName } from "../Tag";
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

export class TaggedAlbum {
  album: SpotifyApi.AlbumObjectFull;
  tags: ITag[];

  /**
   * This is true when this album is one of the current user's saved albums
   */
  isSavedAlbum: boolean;
  /**
   * This is true when this album is in the listening list
   */
  isInListeningList: boolean;

  /**
   * This returns true when the input list of tags contain the ListeningList tag
   *
   * @param tags List of album's tags
   */
  static containsListeningList(tags: ITag[]): boolean {
    const listeningListId = Tag.calculateUniqueIdByName(ListeningListTagName);

    const isInListeningList = tags.findIndex(t => t.uniqueId === listeningListId) !== -1;
    return isInListeningList;
  }
}

export class GetMyAlbumsResponse extends BaseResponse<TaggedAlbum[]> {
  /**
   * This builds the response starting from data retrieved using spotify api and DB.
   * @param spotifyAlbums albums retrieved using spotify apis
   * @param tagsByAlbum user's tags grouped by album spotify id
   * @param onlyTagged set this to true if you only want all the albums that have at least one tag
   * @param areSavedAlbums set this to true if input albums are all saved albums. Set this to false when no one is a saved album.
   */
  static createFromSpotifyAlbums(spotifyAlbums: SpotifyApi.AlbumObjectFull[], tagsByAlbum: TagsByAlbum, onlyTagged: boolean, areSavedAlbums: boolean): GetMyAlbumsResponse {

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

      const isInListeningList = TaggedAlbum.containsListeningList(tags);
      const taggedAlbum: TaggedAlbum = { album: spotifyAlbum, tags: tags, isSavedAlbum: areSavedAlbums, isInListeningList: isInListeningList };
      taggedAlbums.push(taggedAlbum);
      return taggedAlbums;

    }, <TaggedAlbum[]>[]);

    return new GetMyAlbumsResponse(taggedAlbumList);
  }
}

export class GetAlbumResponse extends BaseResponse<TaggedAlbum> {
  static createFromSpotifyAlbum(spotifyAlbums: SpotifyApi.MultipleAlbumsNodeResponse, tags: ITag[], isSavedAlbum: boolean): GetAlbumResponse {

    const isInListeningList = TaggedAlbum.containsListeningList(tags);

    const body: TaggedAlbum = {
      tags: tags,
      album: spotifyAlbums.body.albums[0],
      isSavedAlbum: isSavedAlbum,
      isInListeningList: isInListeningList
    };

    const result = new GetAlbumResponse(body);
    return result;
  }
}