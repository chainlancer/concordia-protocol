"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerv2 = exports.handler = exports.gcpservice = exports.createRequest = void 0;
const external_adapter_1 = require("@chainlink/external-adapter");
const sha3_1 = require("sha3");
const customError = (data) => {
    if (data.Response === "Error")
        return true;
    return false;
};
const customParams = {
    ipfs_cid: ["ipfs_cid"],
    decryption_key: ["decryption_key"],
};
const createRequest = (input, callback) => {
    const validator = new external_adapter_1.Validator(callback, input, customParams);
    const jobRunID = validator.validated.id;
    const ipfs_cid = validator.validated.data.ipfs_cid;
    const decryption_key = validator.validated.data.decryption_key;
    console.log("-----------------------");
    console.log(ipfs_cid, decryption_key);
    console.log("-----------------------");
    // todo: some stuff with decryption_key
    const url = `https://ipfs.io/ipfs/${ipfs_cid}`;
    const params = {};
    const config = {
        url,
        params,
    };
    external_adapter_1.Requester.request(config, customError)
        .then((response) => {
        const hash = new sha3_1.SHA3(256);
        const result = hash.update(response.data).digest("hex");
        console.log("result", result);
        const res = {
            data: {
                result,
            },
            status: response.status,
        };
        callback(response.status, external_adapter_1.Requester.success(jobRunID, res));
    })
        .catch((error) => {
        // eslint-disable-next-line node/no-callback-literal
        callback(500, external_adapter_1.Requester.errored(jobRunID, error));
    });
};
exports.createRequest = createRequest;
const gcpservice = (req, res) => {
    (0, exports.createRequest)(req.body, (statusCode, data) => {
        res.status(statusCode).send(data);
    });
};
exports.gcpservice = gcpservice;
const handler = (event, context, callback) => {
    (0, exports.createRequest)(event, (statusCode, data) => {
        callback(null, data);
    });
};
exports.handler = handler;
const handlerv2 = (event, context, callback) => {
    (0, exports.createRequest)(JSON.parse(event.body), (statusCode, data) => {
        callback(null, {
            statusCode: statusCode,
            body: JSON.stringify(data),
            isBase64Encoded: false,
        });
    });
};
exports.handlerv2 = handlerv2;
