import express from "express";
import bodyParser from "body-parser";
import { createRequest } from "./src/request";

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

app.listen(port, () => console.log(`Listening on port ${port}!`));
