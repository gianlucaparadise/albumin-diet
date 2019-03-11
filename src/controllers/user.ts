import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../models/public/GenericResponses';
import { SpotifyApiManager } from '../managers/SpotifyApiManager';
import { errorHandler } from '../util/errorHandler';
import { GetProfileResponse } from '../models/public/GetProfile';
import { IUserDocument } from '../models/User';

export let login = (req: Request, res: Response) => {
  res.render('login');
};

export let prepareAuthSpotify = (req: Request, res: Response, next: NextFunction) => {
  req.session.callback = req.query.callback;
  next();
};

export let authSpotify = (req: Request, res: Response) => {
  // The request will be redirected to spotify for authentication, so this
  // function will not be called.
};

export let authSpotifyCallback = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).send(new ErrorResponse('401', 'User Not Authenticated'));
  }

  // prepare token for API
  (<any>req).auth = {
    id: req.user.id
  };

  next();
};

export const getMe = async function (req: Request, res: Response) {
  try {
    const user = <IUserDocument>req.user;

    const profile = await SpotifyApiManager.GetProfile(user);
    const response = new GetProfileResponse(profile.body);

    res.json(response);

  } catch (error) {
    return errorHandler(error, res);
  }
};
