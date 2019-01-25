import express from "express";
import cors from "cors";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import logger from "./util/logger";
import lusca from "lusca";
import dotenv from "dotenv";
import mongo from "connect-mongo"; // todo: check if this module is really needed
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import expressValidator from "express-validator";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env" });

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as apiController from "./controllers/api";
import * as userController from "./controllers/user";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";
import "./models/plugins/mongoose-extensions";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, { useNewUrlParser: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

// todo: set up https

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
    req.path == "/account") {
    req.session.returnTo = req.path;
  }
  next();
});

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

// enable cors
const corsOption = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["authorization"]
};
app.use(cors(corsOption));

/**
 * Primary app routes.
 */
app.get("/", homeController.index);

//#region API Routes
const apiMeRoute = express.Router();
apiMeRoute.use(passportConfig.authenticate, passportConfig.fillCurrentUser);

apiMeRoute.get("/profile", userController.getMe);

apiMeRoute.get("/album", apiController.getMyAlbums);
apiMeRoute.get("/tag", apiController.getMyTags);
apiMeRoute.post("/tag-on-album", apiController.setTagOnAlbum);
apiMeRoute.delete("/tag-on-album", apiController.deleteTagFromAlbum);

apiMeRoute.get("/album/search", apiController.searchAlbums); // todo: make this accessible also for non-logged users
apiMeRoute.get("/artist/search", apiController.searchArtists); // todo: make this accessible also for non-logged users
apiMeRoute.get("/album/:albumId", apiController.getAlbumBySpotifyId); // todo: make this accessible also for non-logged users

app.use("/api/me", apiMeRoute);
//#endregion

//#region User/Auth routes
app.get("/login", userController.login);
app.get("/auth/spotify", userController.prepareAuthSpotify, passportConfig.spotifyAuthenticate, userController.authSpotify);
app.get("/auth/spotify/callback", passportConfig.spotifyAuthenticateCallback, userController.authSpotifyCallback, passportConfig.generateToken, passportConfig.sendToken);
//#endregion

export default app;