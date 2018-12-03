"use strict";

import async from "async";
import request from "request";
import { Response, Request, NextFunction } from "express";
import { SpotifyApiManager } from "../managers/SpotifyApiManager";
import { SetTagOnAlbumRequest } from "../models/requests/SetTagOnAlbumRequest";
import { ErrorResponse, EmptyResponse } from "../models/responses/GenericResponses";
import { Tag } from "../models/Tag";
import { Album } from "../models/Album";
import { AlbumTag } from "../models/AlbumTag";
import { IUser } from "../models/User";
import { TaggedAlbumsResponse } from "../models/responses/TaggedAlbum";

export let getMyAlbums = async (req: Request, res: Response) => {
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

export let setTagOnAlbum = async (req: Request, res: Response) => {
  const body = req.body as SetTagOnAlbumRequest;

  //#region Request consistency
  if (!body) {
    return res.status(400).json(new ErrorResponse("400", "Missing Body"));
  }

  if (!body.album) {
    return res.status(400).json(new ErrorResponse("400", "album field is required"));
  }

  if (!body.album.spotifyId) {
    return res.status(400).json(new ErrorResponse("400", "album.spotifyId field is required"));
  }

  if (!body.tag) {
    return res.status(400).json(new ErrorResponse("400", "tag field is required"));
  }

  if (!body.tag.name) {
    return res.status(400).json(new ErrorResponse("400", "tag.name field is required"));
  }
  //#endregion

  try {

    const tag = await Tag.findOrCreate(body.tag.name);
    const album = await Album.findOrCreate(body.album.spotifyId);
    const albumTag = await AlbumTag.findOrCreate(album, tag);

    const user = <IUser>req.user;
    const savedUser = await user.addAlbumTag(albumTag);

    return res.json(new EmptyResponse());

  } catch (error) {
    console.log(error);
    return res.status(500).json(new ErrorResponse("500", "Internal error"));
  }
};