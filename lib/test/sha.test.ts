import { expect } from "chai";
import fs from "fs";
import { encodeSHA3 } from "../cryptography/sha";

describe("SHA3_256", () => {
  const fileContents = fs.readFileSync("./assets/data.txt", "utf-8");
  const checksum =
    "9cc5e0debb5158df6d7bfc3caccaf19d881d6d8fd20f8075716f89e85f742b3e";

  it("should be able to generate a unique hash with SHA3_256", async () => {
    const hash = encodeSHA3(fileContents);
    expect(hash).to.equal(checksum);
  });
});
