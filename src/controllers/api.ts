"use strict";

import async from "async";
import request from "request";
import { Response, Request, NextFunction } from "express";
import { SpotifyApiManager } from "../managers/SpotifyApiManager";
import { SetTagOnAlbumRequest } from "../models/requests/SetTagOnAlbumRequest";
import { ErrorResponse, EmptyResponse, BadRequestErrorResponse } from "../models/responses/GenericResponses";
import { Tag } from "../models/Tag";
import { Album } from "../models/Album";
import { AlbumTag } from "../models/AlbumTag";
import { IUser } from "../models/User";
import { TaggedAlbumsResponse } from "../models/responses/TaggedAlbum";

export let getMyAlbums = async (req: Request, res: Response) => {
  // todo: filter by tag
  // todo: pagination
  try {
    const user = <IUser>req.user;

    const tagsByAlbum = await user.getTagsByAlbum();
    const spotifyAlbums = await SpotifyApiManager.GetMySavedAlbums();
    const response = TaggedAlbumsResponse.createFromSpotifyAlbums(spotifyAlbums.body.items, tagsByAlbum);

    return res.json(response);
  }
  catch (error) {
    console.log(error);
    return res.status(error.statusCode).json(error);
  }
};

export const getMyTags = async (req: Request, res: Response) => {
  // todo: retrieve list of tags
};

export let setTagOnAlbum = async (req: Request, res: Response) => {
  try {
    const body = SetTagOnAlbumRequest.checkConsistency(req.body);

    const tag = await Tag.findOrCreate(body.tag.name);
    // todo: check if album really exists on spotify
    const album = await Album.findOrCreate(body.album.spotifyId);
    const albumTag = await AlbumTag.findOrCreate(album, tag);

    const user = <IUser>req.user;
    const savedUser = await user.addAlbumTag(albumTag);

    return res.json(new EmptyResponse(undefined));

  } catch (error) {
    console.log(error);

    if (error instanceof BadRequestErrorResponse) {
      return res.status(400).json(error);
    }

    return res.status(500).json(new ErrorResponse("500", "Internal error"));
  }
};

export const deleteTagFromAlbum = async (req: Request, res: Response) => {
  try {
    const body = SetTagOnAlbumRequest.checkConsistency(req.body);

    const tagUniqueId = Tag.calculateUniqueIdByName(body.tag.name);
    const tag = await Tag.findOne({ "uniqueId": tagUniqueId });
    if (!tag) {
      throw new BadRequestErrorResponse("Input tag does not exist");
    }

    const album = await Album.findOne({ "publicId.spotify": body.album.spotifyId });
    if (!album) {
      throw new BadRequestErrorResponse("Input album has never been tagged");
    }

    const albumTag = await AlbumTag.findOne({ "tag": tag, "album": album });
    if (!albumTag) {
      throw new BadRequestErrorResponse("Input tag has never been added to input album");
    }

    // todo: startTransaction

    const user = <IUser>req.user;
    const removeResult = await user.removeAlbumTag(albumTag);

    // Clearing orphan documents
    const isAlbumTagRemoved = await albumTag.removeIfOrphan();
    const isAlbumRemoved = await album.removeIfOrphan();
    const isTagRemoved = await tag.removeIfOrphan();

    // todo: commitTransaction

    return res.json(new EmptyResponse(undefined));

  } catch (error) {
    console.log(error);

    if (error instanceof BadRequestErrorResponse) {
      return res.status(400).json(error);
    }

    return res.status(500).json(new ErrorResponse("500", "Internal error"));
  }
};