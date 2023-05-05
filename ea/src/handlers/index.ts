import { Requester, Validator } from "@chainlink/external-adapter";
import { encodeSHA3 } from "../../../lib/cryptography/sha";
import { ethers } from "ethers";

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

export const createRequest = (
  input: RequestInput,
  callback: (statusCode: number, data: any) => void
): void => {
  // const validator = new Validator(callback, input, customParams);
  // const jobRunID = validator.validated.id;

  // const ipfs_cid = validator.validated.data.ipfs_cid;
  // const decryption_key = validator.validated.data.decryption_key;

  const jobRunID = input.id;
  const { ipfs_cid, decryption_key } = input.data;

  // console.log("-----------------------");
  // console.log("ipfs_cid, decryption_key:");
  // console.log(ipfs_cid, decryption_key);
  // console.log("-----------------------");

  // todo: some stuff with decryption_key

  const url = `https://ipfs.io/ipfs/${ipfs_cid}`;
  const params = {};
  const config = {
    url,
    params,
  };

  Requester.request(config, customError)
    .then((response: any) => {
      console.log(response.data);

      const hash = encodeSHA3(response.data);
      console.log("hash", hash);

      const hashBytes = ethers.utils.hexZeroPad("0x" + hash, 32);
      console.log("bytes", hashBytes);

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
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data);
  });
};

export const handler = (
  event: any,
  context: any,
  callback: (error: any, data: any) => void
): void => {
  createRequest(event, (statusCode, data) => {
    callback(null, data);
  });
};

export const handlerv2 = (
  event: any,
  context: any,
  callback: (error: any, response: any) => void
): void => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false,
    });
  });
};
