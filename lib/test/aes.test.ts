import { expect, assert } from "chai";
import { decrypt, encrypt } from "../src/aes";
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
    const encrypted = encrypt(INPUT, key);
    expect(encrypted).to.not.equal(INPUT);

    // decrypt should return the original input
    const decrypted = decrypt(encrypted, key);
    expect(decrypted).to.equal(INPUT);
  });

  it("encrypt and decrypt with different secret keys", async () => {
    const key = generateRandomHexKey(16),
      invalidKey = generateRandomHexKey(16);

    // encrypt should return a different string
    const encrypted = encrypt(INPUT, key);
    console.log("encrypted: \n", encrypted);
    expect(encrypted).to.not.equal(INPUT);

    assert.throws(() => {
      decrypt(encrypted, invalidKey);
    }, ERROR_BAD_DECRYPT);
  });
});
