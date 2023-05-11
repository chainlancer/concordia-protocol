import { expect } from "chai";
import fs from "fs";
import { encodeSHA3 } from "../src/sha";
import { arrayify } from "@ethersproject/bytes";

describe("SHA", () => {
  it("SHA3_256", async () => {
    const fileContents = fs.readFileSync("./mock-data/data.txt", "utf-8");
    const checksum =
      "9cc5e0debb5158df6d7bfc3caccaf19d881d6d8fd20f8075716f89e85f742b3e";

    const hash = encodeSHA3(fileContents);
    expect(hash).to.equal(checksum);
  });

  // Qmf1rtki74jvYmGeqaaV51hzeiaa6DyWc98fzDiuPatzyy
  it("SHA3_256", async () => {
    const fileContents = fs.readFileSync("./mock-data/data_short.txt", "utf-8");
    const checksum =
      "d0e47486bbf4c16acac26f8b653592973c1362909f90262877089f9c8a4536af";

    const hash = encodeSHA3(fileContents);

    // const bytes = arrayify("0x" + hash);
    // console.log(bytes);

    expect(hash).to.equal(checksum);
  });
});
