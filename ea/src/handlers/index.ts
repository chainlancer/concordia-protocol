import { Requester, Validator } from "@chainlink/external-adapter";
import { encodeSHA3 } from "../../../lib/src/sha";
import { ethers } from "ethers";
import { decrypt } from "../../../lib/src/aes";

interface CustomParams {
  decryption_key: string[];
  ipfs_cid: string[];
}

export interface RequestInput {
  id: string;
  data: {
    decryption_key: string;
    ipfs_cid: string;
  };
}

const customError = (data: any): boolean => {
  if (data.Response === "Error") return true;
  return false;
};

const customParams: CustomParams = {
  decryption_key: ["decryption_key"],
  ipfs_cid: ["ipfs_cid"],
};

// called by the chainlink node, fetches the data from ipfs, decrypts it, hashes it, and returns the hash
export const ipfsDecryptAndValidate = (
  input: RequestInput,
  callback: (statusCode: number, data: any) => void
): void => {
  // TODO: validate the input
  // const validator = new Validator(callback, input, customParams);
  // const jobRunID = validator.validated.id;
  // const decryption_key = validator.validated.data.decryption_key;

  const jobRunID = input.id;
  const { ipfs_cid, decryption_key } = input.data;

  // convert decryption_key from base64 to hex
  let decryptionKeyHex = Buffer.from(decryption_key, "base64").toString("hex");

  // TODO: revise this logic:
  // remove leading zeros. this is necessary because the chainlink node will add leading zeros to the decryption key.
  // note that this will break if the decryption key is prefixed with zeros
  let index = 0;
  while (
    index < decryptionKeyHex.length &&
    decryptionKeyHex.charAt(index) === "0"
  ) {
    index++;
  }
  decryptionKeyHex = decryptionKeyHex.substring(index);
  console.log(decryptionKeyHex);
  // decryptionKeyHex = parseInt(decryptionKeyHex, 16).toString(16);
  // console.log(decryptionKeyHex);

  // fetch the data from ipfs
  const url = `https://lancer.mypinata.cloud/ipfs/${ipfs_cid}`;
  const params = {};
  const config = {
    url,
    params,
  };

  Requester.request(config, customError)
    .then((response: any) => {
      const { data } = response;
      console.log("data: \n", data);
      if (!data) {
        // eslint-disable-next-line node/no-callback-literal
        callback(500, Requester.errored(jobRunID, `no data found at ${url}`));
        return;
      }

      // attempt to decrypt with the hex representation of the decryption key. return 500 if it fails
      let decryptedData = null;
      try {
        decryptedData = decrypt(data.trim(), decryptionKeyHex);
        console.log("decrypted: \n", decryptedData);
      } catch (error) {
        console.log("error: \n", error);
        // eslint-disable-next-line node/no-callback-literal
        callback(500, Requester.errored(jobRunID, error));
        return;
      }

      // hash the decrypted data
      const hash = encodeSHA3(decryptedData);

      // convert the hash to bytes
      const hashBytes = ethers.utils.hexZeroPad("0x" + hash, 32);
      console.log("hash as bytes", hashBytes);

      // return the bytes
      const res = {
        data: {
          result: hashBytes,
        },
        status: response.status,
      };
      callback(response.status, Requester.success(jobRunID, res));
    })
    .catch((error: any) => {
      console.log(error);
      // eslint-disable-next-line node/no-callback-literal
      callback(500, Requester.errored(jobRunID, error));
    });
};

export const gcpservice = (req: any, res: any): void => {
  ipfsDecryptAndValidate(req.body, (statusCode, data) => {
    res.status(statusCode).send(data);
  });
};

export const handler = (
  event: any,
  context: any,
  callback: (error: any, data: any) => void
): void => {
  ipfsDecryptAndValidate(event, (statusCode, data) => {
    callback(null, data);
  });
};

export const handlerv2 = (
  event: any,
  context: any,
  callback: (error: any, response: any) => void
): void => {
  ipfsDecryptAndValidate(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false,
    });
  });
};
