import { expect, assert } from "chai";
import { aesDecrypt, aesEncrypt } from "../src/aes";
import { randomBytes } from "crypto";

const generateRandomHexKey = (length: number): string => {
  return randomBytes(length).toString("hex");
};

const ERROR_BAD_DECRYPT = "error:1C800064:Provider routines::bad decrypt";
const INPUT = "Hello World!";

describe("AES", () => {
  it("encrypt and decrypt with secret key", async () => {
    const key = generateRandomHexKey(16);
    console.log("key", key);

    // encrypt should return a different string
    const encrypted = aesEncrypt(INPUT, key);
    expect(encrypted).to.not.equal(INPUT);

    // decrypt should return the original input
    const decrypted = aesDecrypt(encrypted, key);
    expect(decrypted).to.equal(INPUT);
  });

  it("encrypt and decrypt with different secret keys", async () => {
    const key = generateRandomHexKey(16),
      invalidKey = generateRandomHexKey(16);

    // encrypt should return a different string
    const encrypted = aesEncrypt(INPUT, key);
    console.log("encrypted: \n", encrypted);
    expect(encrypted).to.not.equal(INPUT);

    assert.throws(() => {
      aesDecrypt(encrypted, invalidKey);
    }, ERROR_BAD_DECRYPT);
  });
});
