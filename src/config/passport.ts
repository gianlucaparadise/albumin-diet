import path from "path";
import passport from "passport";
import request from "request";
import passportLocal from "passport-local";
import _ from "lodash";

// import { User, UserType } from '../models/User';
import { default as User } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { SPOTIFY_ID, SPOTIFY_SECRET } from "../util/secrets";
import { SpotifyApiManager } from "../managers/SpotifyApiManager";

const SpotifyStrategy = require("passport-spotify").Strategy;

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new SpotifyStrategy(
    {
      clientID: SPOTIFY_ID,
      clientSecret: SPOTIFY_SECRET,
      callbackURL: "/auth/spotify/callback"
    },
    async (accessToken: any, refreshToken: any, expires_in: any, profile: any, done: any) => {
      console.log(`accessToken: ${accessToken}\nrefreshToken: ${refreshToken}\nexpires_in: ${expires_in}`);
      console.log(profile);
      try {
        const user = await User.findOrCreateOrUpdateToken(profile, accessToken);

        SpotifyApiManager.Api.setAccessToken(accessToken);
        SpotifyApiManager.Api.setRefreshToken(refreshToken);

        done(undefined, user);
      }
      catch (error) {
        done(error, undefined);
      }
    }
  )
);

export let spotifyAuthenticate = passport.authenticate("spotify", { scope: ["user-library-read"] });
export let spotifyAuthenticateCallback = passport.authenticate("spotify", { failureRedirect: "/login" });

/**
 * Login Required middleware.
 */
export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

/**
 * Authorization Required middleware.
 */
export let isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.path.split("/").slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
