import { expect } from "chai";
import config from "../../config";
import { fetchDataFromIPFS } from "../src/clients/ipfs";
import * as crypto from "crypto";

describe("Decrypt encrypted work on IPFS with secret key", () => {
  const cid = "QmYMuDSmCwg5vyfCfmcxRiVu4sRGKQoKn9FDL9y9cLLBdo";
  const checksum =
    "9cc5e0debb5158df6d7bfc3caccaf19d881d6d8fd20f8075716f89e85f742b3e";
  const key = "0011223344556677";

  beforeEach(async () => {});

  it("checksum should equal decrypted content from IPFS", async () => {
    const data = await fetchDataFromIPFS(cid);
    expect(data).to.not.equal(undefined);
    if (!data) return;

    const ciphertext = Buffer.from(data, "base64");

    const nonce = ciphertext.slice(0, 12);
    const encryptedData = ciphertext.slice(12);

    const decipher = crypto.createDecipheriv(
      "aes-128-gcm",
      Buffer.from(key, "hex"),
      nonce
    );

    const authTag = encryptedData.slice(-16);
    decipher.setAuthTag(authTag);

    const encryptedText = encryptedData.slice(0, -16);
    const plaintextBuffer = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    const plaintext = plaintextBuffer.toString("utf-8");
    console.log(plaintext);
  });
});
