import logger from './logger';
import fs from 'fs';

if (fs.existsSync('.env')) {
  require('dotenv').config({
    path: '.env',
  });
}

export const ENVIRONMENT = process.env.NOW_ENV; // i'm using env variables from zeit/now
const prod = ENVIRONMENT === 'production'; // Anything else is treated as 'dev'
const stage = ENVIRONMENT === 'stage';

export const SESSION_SECRET = process.env['SESSION_SECRET'];
export const JWT_SECRET = process.env['JWT_SECRET'];

export const MONGODB_URI = process.env['MONGODB_URI'];

if (!SESSION_SECRET) {
  logger.error('No client secret. Set SESSION_SECRET environment variable.');
  process.exit(1);
}

if (!JWT_SECRET) {
  logger.error('No jwt secret. Set JWT_SECRET environment variable.');
  process.exit(1);
}

if (!MONGODB_URI) {
  logger.error('No mongo connection string. Set MONGODB_URI environment variable.');
  process.exit(1);
}

export const USER_CRYPT_SECRET = process.env['USER_CRYPT_SECRET'];
export const USER_CRYPT_SALT = process.env['USER_CRYPT_SALT'];

export const SPOTIFY_SECRET = process.env['SPOTIFY_SECRET'];
export const SPOTIFY_ID = process.env['SPOTIFY_ID'];
