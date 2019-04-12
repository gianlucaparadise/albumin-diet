import { IUserDocument } from '../models/User';
import { SpotifyApiManager } from './SpotifyApiManager';
import logger from '../util/logger';
import { AlbumObjectFull, SavedAlbumObject } from 'spotify-web-api-node-typings';
import { TagsByAlbum } from '../models/public/GetMyAlbums';

type GetNextPage = (limit: number, offset: number) => Promise<AlbumObjectFull[]>;

const intersect = function <T>(array1: T[], array2: T[]) {
  array1 = array1 || [];
  array2 = array2 || [];
  return array1.filter(value => array2.indexOf(value) !== -1);
};

const haveCommonElements = function <T>(array1: T[], array2: T[]) {
  const intersection = intersect(array1, array2);
  return intersection && intersection.length > 0;
};

/**
 * This class helps filtering out singles to keep Albums and EPs
 */
export class AlbumManager {

  /**
   * Spotify APIs don't know the difference between Single and EP
   *
   * It is stated everywhere that, on Spotify:
   * - an EP is a release under 30 minutes with 4-6 tracks
   * - a Single is a release under 30 minutes with 3 or fewer tracks.
   *
   * This means that a single is an album with album_type === "single" and 3 or fewer tracks.
   *
   * Sources:
   * - https://support.tunecore.com/hc/en-us/articles/115006689928-What-is-the-difference-between-a-Single-an-EP-and-an-Album-
   * - https://support.cdbaby.com/hc/en-us/articles/360008275672-What-is-the-difference-between-Single-EP-and-Albums-
   * - http://helpdesk.recordunion.com/Publishing-music/why-is-my-ep-listed-as-a-single-on-spotify
   * - https://support.amuse.io/hc/en-us/articles/207973005-What-is-a-Single-An-EP-An-Album-
   * - Unfortunately there is no official documentation about this
   */
  public static IsAlbumOrEP(album: AlbumObjectFull): boolean {
    if (album.album_type === 'album') { return true; } // this is an Album

    return album.album_type === 'single' && album.tracks.total > 3; // this is an EP
  }

  /**
   * Return `true` when the input album matches the filters or there aren't filters in input.
   * @param tagsByAlbum user's tags grouped by album spotify id
   * @param tagFilter When evaluated, only the albums with these tags will be returned
   * @param untagged When `true`, only the albums without tags will be returned
   */
  public static MatchesFilters(album: AlbumObjectFull, tagsByAlbum: TagsByAlbum, tagFilter: string[], untagged: boolean): boolean {
    tagFilter = tagFilter || [];

    const hasTagFilter = tagFilter.length > 0;
    const hasFilters = untagged || hasTagFilter;

    // If no filters in input: I return them all
    // If I have filters in input: I return only the one that matches at least one filter

    if (!hasFilters) {
      return true;
    }

    const grouped = tagsByAlbum[album.id];
    const tags = grouped ? grouped.tags : [];
    const tagNames = tags.map(t => t.uniqueId);

    // If I have filters, I get only the albumTags that match at least one filter
    // The filters are meant to be in OR and not in AND
    let matchesFilter = false;
    matchesFilter = matchesFilter || (untagged && tags.length === 0);
    matchesFilter = matchesFilter || (hasTagFilter && haveCommonElements(tagNames, tagFilter));

    return matchesFilter;
  }

  /**
   * When I filter out singles, I break the standard pagination, because each page is filtered and is not as long
   * as requested. To fix this, I call spotify in blocks of 50 elements and I filter out the singles (using `onNextPage`)
   * until I reach the desired length (`limit + offset`). Now I can extract the requested page and return it.
   *
   * @param limit limit of the needed page
   * @param offset offset of the needed page
   * @param onNextPage This function calls spotify to get a standard page, filters out the singles and returns the result.
   * @returns The requested page
   */
  private static async extractPage(limit: number, offset: number, onNextPage: GetNextPage): Promise<AlbumObjectFull[]> {
    try {
      const maxLimit = 50; // 50 is the max limit allowed by Spotify APIs
      const allAlbumsLength = offset + limit;
      const allAlbums = <AlbumObjectFull[]>[];

      for (let i = 0; allAlbums.length < allAlbumsLength; i += maxLimit) {

        const albums = await onNextPage(maxLimit, i);
        if (!albums || albums.length === 0) {
          // I don't have albums anymore
          break;
        }

        allAlbums.push(...albums);
      }

      const result = allAlbums.slice(offset, offset + limit);
      return result;

    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Filter out singles to keep Albums and EPs
   * @param tagsByAlbum user's tags grouped by album spotify id
   * @param tagFilter When evaluated, only the albums with these tags will be returned
   * @param untagged When `true`, only the albums without tags will be returned
   */
  private static ExtractAlbumsAndEPs(
    savedAlbums: SavedAlbumObject[],
    tagsByAlbum: TagsByAlbum = null,
    tagFilter: string[] = null,
    untagged: boolean = null
  ): AlbumObjectFull[] {
    const result = savedAlbums.reduce((accumulator, savedAlbum) => {
      const album = savedAlbum.album;

      if (!AlbumManager.IsAlbumOrEP(album)) {
        return accumulator;
      }

      if (!AlbumManager.MatchesFilters(album, tagsByAlbum, tagFilter, untagged)) {
        return accumulator;
      }

      accumulator.push(album);
      return accumulator;
    }, <AlbumObjectFull[]>[]);

    return result;
  }

  /**
   * This filters out singles to return only Albums and EPs
   * @param tagsByAlbum user's tags grouped by album spotify id
   * @param tagFilter When evaluated, only the albums with these tags will be returned
   * @param untagged When `true`, only the albums without tags will be returned
   */
  public static async GetMySavedAlbums(
    user: IUserDocument,
    tagsByAlbum: TagsByAlbum,
    tagFilter: string[],
    untagged: boolean,
    limit: number = 20,
    offset: number = 0
  ): Promise<AlbumObjectFull[]> {

    try {
      const onNextPage = async (spotifyLimit: number, spotifyOffset: number) => {
        const response = await SpotifyApiManager.GetMySavedAlbums(user, spotifyLimit, spotifyOffset);
        if (!response || !response.body || !response.body.items || response.body.items.length === 0) {
          // I don't have albums anymore
          return [];
        }

        return AlbumManager.ExtractAlbumsAndEPs(response.body.items, tagsByAlbum, tagFilter, untagged);
      };

      const result = await this.extractPage(limit, offset, onNextPage);

      return result;

    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * This filters out singles to return only Albums and EPs
   */
  public static async SearchAlbums(user: IUserDocument, keywords: string, limit: number, offset: number): Promise<AlbumObjectFull[]> {
    try {
      const onNextPage = async (spotifyLimit: number, spotifyOffset: number) => {
        const response = await SpotifyApiManager.SearchAlbums(user, keywords, spotifyLimit, spotifyOffset);
        if (!response || !response.body || !response.body.albums || !response.body.albums.items ||
          response.body.albums.items.length === 0) {
          // I don't have albums anymore
          return [];
        }

        const albumsIds = response.body.albums.items.map(a => a.id);
        const albums = await AlbumManager.GetAlbums(user, albumsIds); // this extracts albums and EPs
        return albums;
      };

      const result = await this.extractPage(limit, offset, onNextPage);

      return result;

    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * This filters out singles
   * @param ids A list of the Spotify IDs for the albums.
   */
  public static async GetAlbums(user: IUserDocument, ids: string[]): Promise<AlbumObjectFull[]> {

    try {
      const albumsFull = <AlbumObjectFull[]>[];

      // Spotify's GetAlbums allows maximum 20 ids in input: I need to get albums in blocks of 20 items.

      const maxLimit = 20; // this is the max allowed by SpotifyAPIs

      for (let i = 0; i < ids.length; i += maxLimit) {
        const idsBlock = ids.slice(i, i + maxLimit);
        const response = await SpotifyApiManager.GetAlbums(user, idsBlock);
        const filteredAlbums = response.body.albums.filter(a => AlbumManager.IsAlbumOrEP(a));

        albumsFull.push(...filteredAlbums);
      }

      return albumsFull;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
