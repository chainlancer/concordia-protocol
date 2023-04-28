import express from "express";
import bodyParser from "body-parser";
import { createRequest } from ".";

const app = express();
const port = process.env.EA_PORT || 8080;

app.use(bodyParser.json());

app.post("/", (req, res) => {
  console.log("POST Data: ", req.body);
  createRequest(req.body, (status, result) => {
    res.status(status).json(result);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
