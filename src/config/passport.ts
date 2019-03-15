import passport from 'passport';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';

import { User } from '../models/User';
import { Request, Response, NextFunction } from 'express';
import { SPOTIFY_ID, SPOTIFY_SECRET, JWT_SECRET } from '../util/secrets';
import { SpotifyApiManager } from '../managers/SpotifyApiManager';
import { SendTokenResponse } from '../models/public/GetProfile';

const SpotifyStrategy = require('../../passport-spotify-fix').Strategy;

passport.serializeUser<any, any>((user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * refer to: https://codeburst.io/node-js-rest-api-facebook-login-121114ee04d8
 * Full login flow:
 *  front-end logs in spotify and get access-token
 *  front-end makes GET call to /auth/spotify with header `Authorization: Bearer base64_access_token_string`
 *  server authenticates the user and saves it to the db
 *  server generates jwt
 *  server sends jwt
 *
 */

passport.use(
  new SpotifyStrategy(
    {
      clientID: SPOTIFY_ID,
      clientSecret: SPOTIFY_SECRET,
      callbackURL: '/auth/spotify/callback'
    },
    async function (accessToken: any, refreshToken: any, expires_in: any, profile: any, done: any) {
      console.log(`accessToken: ${accessToken}\nrefreshToken: ${refreshToken}\nexpires_in: ${expires_in}`);
      console.log(profile);
      try {
        const user = await User.upsertSpotifyUser(profile, accessToken, refreshToken);

        done(undefined, user);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

export let spotifyAuthenticate = passport.authenticate('spotify', { session: false, scope: ['user-library-read', 'user-library-modify'] });
export let spotifyAuthenticateCallback = passport.authenticate('spotify', { failureRedirect: '/login' });

const createToken = function (auth: any) {
  return jwt.sign(
    {
      id: auth.id
    },
    JWT_SECRET,
    {
      expiresIn: '7 days'
    }
  );
};

/**
 * This is used for all the requests to refresh the token
 */
export const generateToken = function (req: any, res: Response, next: NextFunction) {
  req.token = createToken(req.auth);

  res.setHeader('x-auth-token', req.token);

  next();
};

/**
 * This is used only for the Login
 */
export const generateAndSendToken = function (req: any, res: Response) {
  // todo: this function should be in user controller (user.ts)

  req.token = createToken(req.auth);

  if (req.session.callback) {
    // todo: re-write spotify login flow and avoid token in querystring
    // I know this it's not good to pass a token in querystring, but I just can't make cookies work with CORS
    const callbackUrl = new URL(req.session.callback);
    callbackUrl.searchParams.set('x-auth-token', req.token);

    res.redirect(callbackUrl.toString());
  } else {
    const tokenResponse: SendTokenResponse = { auth: req.auth, token: req.token };
    res.status(200).send(tokenResponse);
  }
};

export const authenticate = expressJwt({
  secret: JWT_SECRET,
  requestProperty: 'auth',
  getToken: function fromHeader(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    return undefined;
  }
});

export const fillCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const authId = (<any>req).auth.id;
  User.findById(authId)
    .then(user => {
      req.user = user;
      SpotifyApiManager.Api.setAccessToken(user.getDecryptedAccessToken());
      SpotifyApiManager.Api.setRefreshToken(user.getDecryptedRefreshToken());
      next();
    })
    .catch(next);
};
