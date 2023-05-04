import express from "express";
import bodyParser from "body-parser";
import { RequestInput, createRequest } from "./src/handlers";

const app = express();
const port = process.env.EA_PORT || 8080;

app.use(bodyParser.json());

app.post("/", (req, res) => {
  console.log("POST Data: ", req.body);
  createRequest(req.body, (status: any, result: any) => {
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
