import SHA3 from "sha3";
import EthCrypto from "eth-crypto";

export const encryptWithPublicKey = async (
  publicKey: string,
  data: string
): Promise<string> => {
  const encrypted = await EthCrypto.encryptWithPublicKey(publicKey, data);
  return EthCrypto.cipher.stringify(encrypted);
};

export const decryptWithPrivateKey = async (
  privateKey: string,
  encryptedData: string
): Promise<string> => {
  return await EthCrypto.decryptWithPrivateKey(
    privateKey,
    EthCrypto.cipher.parse(encryptedData)
  );
};
