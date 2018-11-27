import { Request, Response } from "express";

export let login = (req: Request, res: Response) => {
  res.render("Login");
};

export let authSpotify = (req: Request, res: Response) => {
  // The request will be redirected to spotify for authentication, so this
  // function will not be called.
};

export let authSpotifyCallback = (req: Request, res: Response) => {
  res.redirect("/");
};