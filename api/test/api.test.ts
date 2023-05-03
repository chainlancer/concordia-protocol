import { expect } from "chai";
import config from "../../config";

describe("Decrypt encrypted work on IPFS with secret key", () => {
  const IPFS_CID = "QmYMuDSmCwg5vyfCfmcxRiVu4sRGKQoKn9FDL9y9cLLBdo";
  const checksum =
    "9cc5e0debb5158df6d7bfc3caccaf19d881d6d8fd20f8075716f89e85f742b3e";
  const key = "0011223344556677";

  beforeEach(async () => {});

  it("checksum should equal decrypted content from IPFS", async () => {
    // let tx = await lancerContract
    //   .connect(owner)
    //   .payWorkAgreement(workAgreementID, { value: agreementPrice });
    // let res = await tx.wait();
    // console.log(res.events);
    // const agreement = await lancerContract.workAgreements(workAgreementID);
    // expect(agreement.paid).to.equal(true);
  });
});
