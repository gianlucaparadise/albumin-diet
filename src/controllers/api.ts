"use strict";

import async from "async";
import request from "request";
import { Response, Request, NextFunction } from "express";
import { SpotifyApiManager } from "../managers/SpotifyApiManager";

/**
 * GET /api
 * List of API examples.
 */
export let getApi = (req: Request, res: Response) => {
  res.render("api/index", {
    title: "API Examples"
  });
};

export let getMyAlbums = async (req: Request, res: Response) => {
  console.log("req.user");
  console.log(req.user);
  if (!req.user) {
    res.status(403).json({ error: "not authenticated" });
    return;
  }

  try {
    const response = await SpotifyApiManager.GetMySavedAlbums();
    res.json(response);
  }
  catch (error) {
    res.json(error);
  }
};