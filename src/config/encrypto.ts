import crypto from 'crypto';

import { USER_CRYPT_SECRET, USER_CRYPT_SALT } from '../util/secrets';
import logger from '../util/logger';

const IV_LENGTH = 16; // For AES, this is always 16
const algorithm = 'aes-256-cbc';

const keyBufferFull = Buffer.from(USER_CRYPT_SECRET + USER_CRYPT_SALT); // With this line I may have a buffer longer than 32 bytes
const keyBuffer = Buffer.alloc(32, keyBufferFull); // I need a 32 bytes buffer as key

export function encrypt(text: String) {
  if (text === null || typeof text === 'undefined') {
    return text;
  }

  const key = Buffer.from(keyBuffer);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const result = iv.toString('hex') + '|' + encrypted;
  return result;
}

export function decrypt(encryptedTextAndIv: String): string {
  if (encryptedTextAndIv === null || typeof encryptedTextAndIv === 'undefined') {
    return encryptedTextAndIv.toString();
  }

  const key = Buffer.from(keyBuffer);

  const segments = encryptedTextAndIv.split('|');
  const iv = segments.shift();
  const encrypted = segments.join('|');

  const ivBuffer = Buffer.from(iv, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
