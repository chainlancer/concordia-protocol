import { error } from "console";
import crypto from "crypto";

const CYPHER_KEY = "aes-128-cbc";

const validateKeyLength = (key: string): Error | null => {
  if (key.length !== 32) {
    return new Error(`Invalid key length: ${key.length}`);
  }
  return null;
};

export const encrypt = (text: string, key: string): string => {
  const err = validateKeyLength(key);
  if (err) throw new Error(err.message);

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(CYPHER_KEY, Buffer.from(key, "hex"), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + encrypted;
};

export const decrypt = (encrypted: string, key: string): string => {
  const err = validateKeyLength(key);
  if (err) throw new Error(err.message);

  const iv = Buffer.from(encrypted.slice(0, 32), "hex");
  const data = encrypted.slice(32);
  const decipher = crypto.createDecipheriv(
    CYPHER_KEY,
    Buffer.from(key, "hex"),
    iv
  );

  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
