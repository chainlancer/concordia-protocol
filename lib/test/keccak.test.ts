import { expect } from "chai";
import fs from "fs";
import { encodeKeccak } from "../src/keccak";

describe("Keccak256", () => {
  it("Keccak256", async () => {
    const input = "Hello world";
    const checksum =
      "ed6c11b0b5b808960df26f5bfc471d04c1995b0ffd2055925ad1be28d6baadfd";

    const hash = encodeKeccak(input);
    console.log(hash);
    expect(hash).to.equal(checksum);
  });
});
