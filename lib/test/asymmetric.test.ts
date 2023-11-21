import { expect, assert } from "chai";
import EthCrypto from "eth-crypto";

const INPUT = "Hello World!";
// const ERROR_BAD_DECRYPT = "Bad MAC";

describe("Asymmetric", () => {
  it("encrypt and decrypt asymmetric key pair", async () => {
    const identity = EthCrypto.createIdentity();
    console.log(identity);

    const encrypted = await EthCrypto.encryptWithPublicKey(
      identity.publicKey,
      INPUT
    );
    const encryptedString = EthCrypto.cipher.stringify(encrypted);
    expect(encrypted).to.not.equal(encryptedString);

    const decrypted = await EthCrypto.decryptWithPrivateKey(
      identity.privateKey,
      EthCrypto.cipher.parse(encryptedString)
    );
    expect(decrypted).to.equal(INPUT);
  });

  it("encrypt and decrypt with mismatched key pair", async () => {
    const identity = EthCrypto.createIdentity();
    const identity2 = EthCrypto.createIdentity();
    // console.log(identity);

    const encrypted = await EthCrypto.encryptWithPublicKey(
      identity.publicKey,
      INPUT
    );
    expect(encrypted).to.not.equal(INPUT);

    // TODO
    // assert.throws(async () => {
    //   await EthCrypto.decryptWithPrivateKey(identity2.privateKey, encrypted);
    // }, ERROR_BAD_DECRYPT);
  });
});
