import { Requester, Validator } from "@chainlink/external-adapter";
import { SHA3 } from "sha3";

interface CustomParams {
  cid: string[];
}

interface RequestInput {
  id: string;
  data: {
    cid: string;
  };
}

const customError = (data: any): boolean => {
  if (data.Response === "Error") return true;
  return false;
};

const customParams: CustomParams = {
  cid: ["cid"],
};

const createRequest = (
  input: RequestInput,
  callback: (statusCode: number, data: any) => void
): void => {
  const validator = new Validator(callback, input, customParams);
  const jobRunID = validator.validated.id;

  const cid = validator.validated.data.cid;

  const url = `https://ipfs.io/ipfs/${cid}`;
  const params = {};

  const config = {
    url,
    params,
  };

  Requester.request(config, customError)
    .then((response) => {
      const hash = new SHA3(256);
      const result = hash.update(response.data).digest("hex");
      console.log("result", result);

      const res = {
        data: {
          result,
        },
        status: response.status,
      };
      callback(response.status, Requester.success(jobRunID, res));
    })
    .catch((error) => {
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

export { createRequest };
