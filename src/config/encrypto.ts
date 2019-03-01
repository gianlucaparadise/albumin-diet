import crypto from "crypto";

import { USER_CRYPT_SECRET, USER_CRYPT_SALT } from "../util/secrets";
import logger from "../util/logger";

const IV_LENGTH = 16; // For AES, this is always 16
const algorithm = "aes-192-cbc";

export function encrypt(text: String) {
  if (text === null || typeof text === "undefined") {
    return text;
  }

  // FIXME: Use the async `crypto.scrypt()` instead.
  const key = (<any>crypto).scryptSync(USER_CRYPT_SECRET, USER_CRYPT_SALT, 24);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text.toString(), "utf8", "hex");
  encrypted += cipher.final("hex");
  const result = iv.toString("hex") + "|" + encrypted;
  return result;
}

export function decrypt(encryptedTextAndIv: String): string {
  if (encryptedTextAndIv === null || typeof encryptedTextAndIv === "undefined") {
    return encryptedTextAndIv.toString();
  }

  // FIXME: Use the async `crypto.scrypt()` instead.
  const key = (<any>crypto).scryptSync(USER_CRYPT_SECRET, USER_CRYPT_SALT, 24);

  const segments = encryptedTextAndIv.split("|");
  const iv = segments.shift();
  const encrypted = segments.join("|");

  const ivBuffer = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}