import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../models/responses/GenericResponses";

export let login = (req: Request, res: Response) => {
  res.render("Login");
};

export let authSpotify = (req: Request, res: Response) => {
  // The request will be redirected to spotify for authentication, so this
  // function will not be called.
};

export let authSpotifyCallback = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).send(new ErrorResponse("401", "User Not Authenticated"));
  }

  // prepare token for API
  (<any>req).auth = {
    id: req.user.id
  };

  next();
};

export const getMe = function (req: Request, res: Response) {
  const user = req.user.toObject();

  delete user["__v"];

  res.json(user);
};