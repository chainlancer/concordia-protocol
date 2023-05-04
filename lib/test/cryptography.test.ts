import { expect } from "chai";
import fs from "fs";
import { encodeSHA3 } from "../cryptography/sha";
import { arrayify } from "@ethersproject/bytes";

describe("Cryptography", () => {
  it("SHA3_256", async () => {
    const fileContents = fs.readFileSync("./mock-data/data.txt", "utf-8");
    const checksum =
      "9cc5e0debb5158df6d7bfc3caccaf19d881d6d8fd20f8075716f89e85f742b3e";

    const hash = encodeSHA3(fileContents);
    console.log(hash);
    expect(hash).to.equal(checksum);
  });

  // Qmf1rtki74jvYmGeqaaV51hzeiaa6DyWc98fzDiuPatzyy
  it("SHA3_256", async () => {
    const fileContents = fs.readFileSync("./mock-data/data_short.txt", "utf-8");
    const checksum =
      "d0e47486bbf4c16acac26f8b653592973c1362909f90262877089f9c8a4536af";

    const hash = encodeSHA3(fileContents);
    console.log(hash);

    const bytes = arrayify("0x" + hash);
    console.log(bytes);

    expect(hash).to.equal(checksum);
  });
});

// 208, 228, 116, 134, 187, 244, 193,
// 106, 202, 194, 111, 139, 101,  53,
// 146, 151,  60,  19,  98, 144, 159,
// 144,  38,  40, 119,   8, 159, 156,
// 138,  69,  54, 175

// 208, 228, 116, 134, 187, 244, 193,
// 106, 202, 194, 111, 139, 101,  53,
// 146, 151,  60,  19,  98, 144, 159,
// 144,  38,  40, 119,   8, 159, 156,
// 138,  69,  54, 175
