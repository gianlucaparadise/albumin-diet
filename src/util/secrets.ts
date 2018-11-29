import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
  logger.debug("Using .env file to supply config environment variables");
  dotenv.config({ path: ".env" });
} else {
  logger.error("Missing env file.");
  process.exit(1);
}
export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const BASE_PATH = prod ? "http://albumindiet.com/" : "http://localhost:3000/";

export const SESSION_SECRET = process.env["SESSION_SECRET"];
export const MONGODB_URI = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];

if (!SESSION_SECRET) {
  logger.error("No client secret. Set SESSION_SECRET environment variable.");
  process.exit(1);
}

if (!MONGODB_URI) {
  logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
  process.exit(1);
}

export const SPOTIFY_SECRET = prod ? process.env["SPOTIFY_SECRET"] : process.env["SPOTIFY_SECRET_TEST"];
export const SPOTIFY_ID = prod ? process.env["SPOTIFY_ID"] : process.env["SPOTIFY_ID_TEST"];