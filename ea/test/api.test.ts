import { expect } from "chai";
import config from "../../config";
import { fetchDataFromIPFS } from "../src/clients/ipfs";
import * as CryptoJS from "crypto-js";

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

    const ciphertext = CryptoJS.enc.Base64.parse(data);

    const nonce = CryptoJS.lib.WordArray.create(ciphertext.words.slice(0, 3));
    const encryptedData = CryptoJS.lib.WordArray.create(
      ciphertext.words.slice(3)
    );

    const decipherKey = CryptoJS.enc.Hex.parse(key);

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: encryptedData,
      key: decipherKey,
      iv: nonce,
    });

    const decryptedData = CryptoJS.AES.decrypt(cipherParams, decipherKey, {
      mode: CryptoJS.mode.CTR,
      padding: CryptoJS.pad.NoPadding,
    });

    console.log("here");

    const plaintext = CryptoJS.enc.Utf8.stringify(decryptedData);
    console.log(plaintext);
  });
});
