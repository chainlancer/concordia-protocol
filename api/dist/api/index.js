"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const request_1 = require("./src/request");
const app = (0, express_1.default)();
const port = process.env.EA_PORT || 8080;
app.use(body_parser_1.default.json());
app.post("/", (req, res) => {
    console.log("POST Data: ", req.body);
    (0, request_1.createRequest)(req.body, (status, result) => {
        res.status(status).json(result);
    });
});
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is healthy" });
});
// TODO: testing only
// const d: RequestInput = {
//   data: {
//     decryption_key: "MHgxMjM0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
//     ipfs_cid: "QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi",
//   },
//   id: "0x6fde68e1ca754a41b195e3ea02a892aa",
// };
// app.post("/test", (req, res) => {
//   console.log("POST Data: ", req.body);
//   createRequest(d, (status: any, result: any) => {
//     res.status(status).json(result);
//   });
// });
app.listen(port, () => console.log(`Listening on port ${port}!`));
//# sourceMappingURL=index.js.map