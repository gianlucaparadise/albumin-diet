"use strict";

import { Response, Request, NextFunction } from "express";
import { SpotifyApiManager } from "../managers/SpotifyApiManager";
import { TagOnAlbumRequest, AlbumInListeningListRequest } from "../models/requests/SetTagOnAlbumRequest";
import { EmptyResponse, BadRequestErrorResponse } from "../models/responses/GenericResponses";
import { Tag, ListeningListTagName } from "../models/Tag";
import { Album } from "../models/Album";
import { AlbumTag } from "../models/AlbumTag";
import { IUser } from "../models/User";
import { GetMyAlbumsResponse, GetMyAlbumsRequest, GetAlbumResponse } from "../models/responses/GetMyAlbums";
import { GetMyTagsResponse } from "../models/responses/GetMyTags";
import { SearchRequest, SearchAlbumResponse, SearchArtistResponse } from "../models/responses/Search";
import { errorHandler } from "../util/errorHandler";
import logger from "../util/logger";

export let getMyAlbums = async (req: Request, res: Response) => {
  try {
    const request = <GetMyAlbumsRequest>req.query;

    const tags: string[] = JSON.parse(request.tags || "[]");
    const normalizedTags = tags.map(t => Tag.calculateUniqueIdByName(t));

    const limit = request.limit || 20;
    const offset = request.offset || 0;

    const user = <IUser>req.user;

    // todo: check how to parallelize spotify request and db query
    const tagsByAlbum = await user.getTagsGroupedByAlbum(normalizedTags);
    const spotifyAlbums = await SpotifyApiManager.GetMySavedAlbums(user, limit, offset);
    const useTagFilter = normalizedTags && normalizedTags.length > 0;
    const albumsFull = spotifyAlbums.body.items.map(a => a.album);
    const response = GetMyAlbumsResponse.createFromSpotifyAlbums(albumsFull, tagsByAlbum, useTagFilter, true);

    return res.json(response);
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

export let getAlbumBySpotifyId = async (req: Request, res: Response) => {
  try {
    const spotifyAlbumId = req.params["albumId"];
    const user = <IUser>req.user;

    const tags = await user.getTagsByAlbum(spotifyAlbumId);

    const spotifyAlbums = await SpotifyApiManager.GetAlbums(user, [spotifyAlbumId]);

    const album = spotifyAlbums.body.albums[0];

    const isSavedAlbumResponse = await SpotifyApiManager.IsMySavedAlbum(user, album);

    const response = GetAlbumResponse.createFromSpotifyAlbum(spotifyAlbums, tags, isSavedAlbumResponse);

    return res.json(response);
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

export const getMyTags = async (req: Request, res: Response) => {
  try {
    const user = <IUser>req.user;

    const tags = await user.getTags();
    const response = new GetMyTagsResponse(tags);

    return res.json(response);
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

export let setTagOnAlbum = async (req: Request, res: Response) => {
  try {
    const body = TagOnAlbumRequest.checkConsistency(req.body);

    // todo: formal check on tag

    const user = <IUser>req.user;
    const tagName = body.tag.name;
    const albumSpotifyId = body.album.spotifyId;
    const result = await setTagOnAlbumInternal(user, tagName, albumSpotifyId);

    return res.json(new EmptyResponse());
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

// TODO: find a better place for this function
const setTagOnAlbumInternal = async (user: IUser, tagName: string, albumSpotifyId: string): Promise<boolean> => {
  const tag = await Tag.findOrCreate(tagName);
  if (!tag) {
    throw new BadRequestErrorResponse("Input tag does not exist");
  }

  // todo: check if album really exists on spotify
  const album = await Album.findOrCreate(albumSpotifyId);
  if (!album) {
    throw new BadRequestErrorResponse("Input album has never been tagged");
  }

  const albumTag = await AlbumTag.findOrCreate(album, tag);
  if (!albumTag) {
    throw new BadRequestErrorResponse("Input tag has never been added to input album");
  }

  const savedUser = await user.addAlbumTag(albumTag);

  return true;
};

export const deleteTagFromAlbum = async (req: Request, res: Response) => {
  try {
    const body = TagOnAlbumRequest.checkConsistency(req.body);

    const user = <IUser>req.user;
    const tagName = body.tag.name;
    const albumSpotifyId = body.album.spotifyId;

    const result = await deleteTagFromAlbumInternal(user, tagName, albumSpotifyId);

    return res.json(new EmptyResponse());
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

const deleteTagFromAlbumInternal = async (user: IUser, tagName: string, albumSpotifyId: string): Promise<boolean> => {
  const tagUniqueId = Tag.calculateUniqueIdByName(tagName);
  const tag = await Tag.findOne({ "uniqueId": tagUniqueId });
  if (!tag) {
    throw new BadRequestErrorResponse("Input tag does not exist");
  }

  const album = await Album.findOne({ "publicId.spotify": albumSpotifyId });
  if (!album) {
    throw new BadRequestErrorResponse("Input album has never been tagged");
  }

  const albumTag = await AlbumTag.findOne({ "tag": tag, "album": album });
  if (!albumTag) {
    throw new BadRequestErrorResponse("Input tag has never been added to input album");
  }

  // todo: startTransaction (see: https://thecodebarbarian.com/a-node-js-perspective-on-mongodb-4-transactions.html)

  const removeResult = await user.removeAlbumTag(albumTag);

  // Clearing orphan documents
  const isAlbumTagRemoved = await albumTag.removeIfOrphan();
  if (isAlbumTagRemoved) {
    // If AlbumTag was orphan, I check if album and tag are now also orphan
    const isAlbumRemoved = await album.removeIfOrphan();
    const isTagRemoved = await tag.removeIfOrphan();
  }

  // todo: commitTransaction

  return true;
};

export const getListeningList = async (req: Request, res: Response) => {
  try {
    // TODO: pagination
    const user = <IUser>req.user;
    const normalizedTag = Tag.calculateUniqueIdByName(ListeningListTagName);

    const tagsByAlbum = await user.getTagsGroupedByAlbum([normalizedTag]);

    const spotifyIds = Object.keys(tagsByAlbum);
    const spotifyAlbums = await SpotifyApiManager.GetAlbums(user, spotifyIds);

    const response = GetMyAlbumsResponse.createFromSpotifyAlbums(spotifyAlbums.body.albums, tagsByAlbum, true, false);

    return res.json(response);
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

export const addToListeningList = async (req: Request, res: Response) => {
  try {
    const body = AlbumInListeningListRequest.checkConsistency(req.body);

    const user = <IUser>req.user;
    const tagName = ListeningListTagName;
    const albumSpotifyId = body.album.spotifyId;
    const result = await setTagOnAlbumInternal(user, tagName, albumSpotifyId);

    return res.json(new EmptyResponse());
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

export const deleteFromListeningList = async (req: Request, res: Response) => {
  try {
    const body = AlbumInListeningListRequest.checkConsistency(req.body);

    const user = <IUser>req.user;
    const tagName = ListeningListTagName;
    const albumSpotifyId = body.album.spotifyId;
    const result = await deleteTagFromAlbumInternal(user, tagName, albumSpotifyId);

    return res.json(new EmptyResponse());
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

export const searchAlbums = async (req: Request, res: Response) => {
  try {
    const requestBody = <SearchRequest>req.query;
    const keywords = requestBody.q;

    const limit = requestBody.limit || 20;
    const offset = requestBody.offset || 0;

    const user = <IUser>req.user;

    const searchResponse = await SpotifyApiManager.SearchAlbums(user, keywords, limit, offset);
    // console.log(searchResponse);

    const response = new SearchAlbumResponse(searchResponse.body);

    return res.json(response);
  }
  catch (error) {
    return errorHandler(error, res);
  }
};

export const searchArtists = async (req: Request, res: Response) => {
  try {
    const requestBody = <SearchRequest>req.query;
    const keywords = requestBody.q;

    const limit = requestBody.limit || 20;
    const offset = requestBody.offset || 0;

    const user = <IUser>req.user;

    const searchResponse = await SpotifyApiManager.SearchArtists(user, keywords, limit, offset);
    // console.log(searchResponse);

    const response = new SearchArtistResponse(searchResponse.body);

    return res.json(response);
  }
  catch (error) {
    return errorHandler(error, res);
  }
};