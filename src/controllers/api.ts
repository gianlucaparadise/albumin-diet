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

export let getMyAlbums = async (req: Request, res: Response) => {
  if (!req.user) {
    console.log("req.user not found");
  }

  try {
    const response = await SpotifyApiManager.GetMySavedAlbums();
    res.json(response);
  }
  catch (error) {
    console.log(error);
    res.status(error.statusCode).json(error);
  }
};

export let setTagOnAlbum = async (req: Request, res: Response) => {
  const body = req.body as SetTagOnAlbumRequest;

  //#region Request consistency
  if (!body) {
    res.status(400).json(new ErrorResponse("400", "Missing Body"));
    return;
  }

  if (!body.album) {
    res.status(400).json(new ErrorResponse("400", "album field is required"));
    return;
  }

  if (!body.album.spotifyId) {
    res.status(400).json(new ErrorResponse("400", "album.spotifyId field is required"));
    return;
  }

  if (!body.tag) {
    res.status(400).json(new ErrorResponse("400", "tag field is required"));
    return;
  }

  if (!body.tag.name) {
    res.status(400).json(new ErrorResponse("400", "tag.name field is required"));
    return;
  }
  //#endregion

  try {

    const tag = await Tag.findOrCreate(body.tag.name);
    const album = await Album.findOrCreate(body.album.spotifyId);
    const albumTag = await AlbumTag.findOrCreate(album, tag);

    const user = <IUser>req.user;
    const savedUser = await user.addAlbumTag(albumTag);

    res.json(new EmptyResponse());

  } catch (error) {
    console.log(error);
    res.status(500).json(new ErrorResponse("500", "Internal error"));
  }
};