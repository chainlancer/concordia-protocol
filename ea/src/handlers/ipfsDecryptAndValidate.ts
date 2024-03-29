import { Requester, Validator } from "@chainlink/external-adapter";
import { encodeKeccak } from "../../../lib/src/keccak";
import { ethers } from "ethers";
import { aesDecrypt } from "../../../lib/src/aes";
import { decryptWithPrivateKey } from "../../../lib/src/asymmetric";
import fs from "fs";

// interface CustomParams {
//   decryption_key: string[];
//   ipfs_cid: string[];
// }

export interface RequestInput {
  id: string;
  data: {
    deliverable_ipfs_cid: string;
    secret_key: string;
  };
}

const customError = (data: any): boolean => {
  if (data.Response === "Error") return true;
  return false;
};

// const customParams: CustomParams = {
//   decryption_key: ["decryption_key"],
//   ipfs_cid: ["ipfs_cid"],
// };

// called by the chainlink node, fetches the data from ipfs, decrypts it, hashes it, and returns the hash
export const ipfsDecryptAndValidate = async (
  input: RequestInput,
  callback: (statusCode: number, data: any) => void
) => {
  // TODO: validate the input
  // const validator = new Validator(callback, input, customParams);
  // const jobRunID = validator.validated.id;
  // const decryption_key = validator.validated.data.decryption_key;

  // TODO:
  // const { concordiaPrivateKey } = config[eaConfig.NETWORK];
  const concordiaPrivateKey =
    "0x2abeb8d87ce8cd0325068de54b448d4b492524028fd398445d0cf66cbfa3f5f6";

  const jobRunID = input.id;
  const { deliverable_ipfs_cid, secret_key } = input.data;

  // convert decryption_key from base64 to hex
  const secretKeyHex = Buffer.from(secret_key, "base64").toString("hex");

  // TODO: revise this logic:
  // remove leading zeros. this is necessary because the chainlink node will add leading zeros to the decryption key.
  // note that this will break if the decryption key is prefixed with zeros
  //////////////////////////////////////////////////////////////
  // let index = 0;
  // while (index < secretKeyHex.length && secretKeyHex.charAt(index) === "0") {
  //   index++;
  // }
  // secretKeyHex = "0" + secretKeyHex.substring(index);
  //////////////////////////////////////////////////////////////

  // decrypt the key
  const key = await decryptWithPrivateKey(concordiaPrivateKey, secretKeyHex);

  // fetch the data from ipfs
  const url = `https://concordia.mypinata.cloud/ipfs/${deliverable_ipfs_cid}`;
  const params = {};
  const requestConfig = {
    url,
    params,
  };

  Requester.request(requestConfig, customError)
    .then(async (response: any) => {
      const ipfsResponse: any = response?.data?.toString();
      console.log(typeof response);
      if (!ipfsResponse) {
        // eslint-disable-next-line node/no-callback-literal
        callback(500, Requester.errored(jobRunID, `no data found at ${url}`));
        return;
      }

      // Try to convert to a string
      let encryptedDeliverable;
      // try {
      //   encryptedDeliverable = Buffer.from(ipfsResponse).toString("utf-8");
      //   // do something with the string data...
      // } catch (err) {
      //   // handle error, if any
      //   console.error(err);
      //   callback(
      //     500,
      //     Requester.errored(jobRunID, `error converting to string, ${err}`)
      //   );
      //   return;
      // }
      console.log("encrypted deliverable", encryptedDeliverable);

      // attempt to decrypt with the hex representation of the decryption key. return 500 if it fails
      let decryptedDeliverable: any;
      try {
        decryptedDeliverable = aesDecrypt(ipfsResponse, key);
        console.log("-----------------------------");
        console.log(JSON.stringify(decryptedDeliverable, null, 4));
        console.log("-----------------------------");
        // console.log("decrypted deliverable: \n", decryptedDeliverable);
      } catch (error) {
        console.log("error: \n", error);
        // eslint-disable-next-line node/no-callback-literal
        callback(500, Requester.errored(jobRunID, error));
        return;
      }

      // hash the decrypted data
      const hash = encodeKeccak(decryptedDeliverable);

      // convert the hash to bytes
      const hashBytes = ethers.utils.hexZeroPad("0x" + hash, 32);
      console.log("hash as bytes: \n", hashBytes);

      const keyBytes = ethers.utils.hexZeroPad("0x" + key, 32);
      console.log("key as bytes:\n", keyBytes);

      // return the bytes
      const toReturn = {
        data: {
          result: {
            deliverableHash: hashBytes,
            key: keyBytes, // TODO
          },
        },
        status: response.status,
      };
      callback(response.status, Requester.success(jobRunID, toReturn));
    })
    .catch((error: any) => {
      console.log(error);
      // eslint-disable-next-line node/no-callback-literal
      callback(500, Requester.errored(jobRunID, error));
    });
};

// export const gcpservice = (req: any, res: any): void => {
//   ipfsDecryptAndValidate(req.body, (statusCode, data) => {
//     res.status(statusCode).send(data);
//   });
// };

// export const handler = (
//   event: any,
//   context: any,
//   callback: (error: any, data: any) => void
// ): void => {
//   ipfsDecryptAndValidate(event, (statusCode, data) => {
//     callback(null, data);
//   });
// };

// export const handlerv2 = (
//   event: any,
//   context: any,
//   callback: (error: any, response: any) => void
// ): void => {
//   ipfsDecryptAndValidate(JSON.parse(event.body), (statusCode, data) => {
//     callback(null, {
//       statusCode: statusCode,
//       body: JSON.stringify(data),
//       isBase64Encoded: false,
//     });
//   });
// };
