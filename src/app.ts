import express, { NextFunction, Response, Request } from 'express';
import cors from 'cors';
import compression from 'compression';  // compresses requests
import session from 'express-session';
import bodyParser from 'body-parser';
import logger from './util/logger';
import lusca from 'lusca';
const mongo = require('connect-mongo');
import path from 'path';
import mongoose from 'mongoose';
import passport from 'passport';
import expressValidator from 'express-validator';
import bluebird from 'bluebird';
import { MONGODB_URI, MONGODB_SESSIONS_URI, SESSION_SECRET } from './util/secrets';

const MongoStore = mongo(session);

// Controllers (route handlers)
import * as homeController from './controllers/home';
import * as apiController from './controllers/api';
import * as userController from './controllers/user';

// API keys and Passport configuration
import * as passportConfig from './config/passport';
import './models/plugins/mongoose-extensions';

// Create Express server
const app = express();

// Connect to MongoDB
(<any>mongoose).Promise = bluebird;

// Sessions DB connection
const connectionSessionsDb = mongoose.createConnection(MONGODB_SESSIONS_URI, { useCreateIndex: true, useNewUrlParser: true });

// Default DB connection
mongoose.connect(MONGODB_URI, { useCreateIndex: true, useNewUrlParser: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
  // process.exit();
});

// todo: set up https

// enable cors
const corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['authorization', 'x-auth-token']
};
app.use(cors(corsOption));
app.enable('trust proxy');

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    mongooseConnection: connectionSessionsDb,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

app.use(
  express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
);

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {

  // body parser error checking
  if (err.status === 400 && err instanceof SyntaxError && 'body' in err) {
      console.error('Error while parsing json');
      console.error(err);
      return res.sendStatus(400); // Bad request
  }

  next();
});

/**
 * Primary app routes.
 */
app.get('/', homeController.index);

//#region API Routes
const apiMeRoute = express.Router();
apiMeRoute.use(passportConfig.authenticate, passportConfig.generateToken, passportConfig.fillCurrentUser);

apiMeRoute.get('/profile', userController.getMe);

apiMeRoute.get('/album', apiController.getMyAlbums);
apiMeRoute.put('/album', apiController.saveAlbum);
apiMeRoute.delete('/album', apiController.removeAlbum);

apiMeRoute.get('/tag', apiController.getMyTags);
apiMeRoute.post('/tag', apiController.setTagOnAlbum);
apiMeRoute.delete('/tag', apiController.deleteTagFromAlbum);

apiMeRoute.get('/listening-list', apiController.getListeningList);
apiMeRoute.post('/listening-list', apiController.addToListeningList);
apiMeRoute.delete('/listening-list', apiController.deleteFromListeningList);

apiMeRoute.get('/album/search', apiController.searchAlbums);
apiMeRoute.get('/artist/search', apiController.searchArtists);
apiMeRoute.get('/album/:albumId', apiController.getAlbumBySpotifyId);

app.use('/api/v1/me', apiMeRoute);
//#endregion

//#region User/Auth routes
app.get('/login', userController.login); // frontend route

app.get('/auth/v1/spotify',
  userController.prepareAuthSpotify,
  passportConfig.spotifyAuthenticate,
  userController.authSpotify);

app.get('/auth/spotify/callback',
  passportConfig.spotifyAuthenticateCallback,
  userController.authSpotifyCallback,
  passportConfig.generateAndSendToken);
//#endregion

export default app;
