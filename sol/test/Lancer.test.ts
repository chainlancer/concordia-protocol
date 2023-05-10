import hre from "hardhat";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import config from "../../config";
import { getDeployedContract } from "../src/utils";

describe("Concordia", () => {
  let concordiaContract: Contract;
  let owner: Signer;
  let client: Signer;
  let verifier = "0x0000000000000000000000000000000000000000";
  let concordID: any;

  const { concordiaAddress } = config[hre.network.name];

  // test params
  const ipfsCID = "QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi";
  const agreementChecksum = ethers.utils.formatBytes32String("0x1234");
  const agreementPrice = ethers.utils.parseEther("0.0");
  // const agreementDecryptionKey = ethers.utils.formatBytes32String("0x1234");
  const agreementDecryptionKey = "1234567890";

  beforeEach(async () => {
    [owner, client] = await ethers.getSigners();

    concordiaContract = await getDeployedContract(
      hre,
      "Concordia",
      concordiaAddress
    );
  });

  it("create work agreement", async () => {
    // create work agreement
    let tx = await concordiaContract
      .connect(owner)
      .createWorkAgreement(
        agreementChecksum,
        agreementPrice,
        await owner.getAddress(),
        verifier,
        ipfsCID
      );

    let res = await tx.wait();
    console.log(res.events);

    // get id of created work agreement
    const concordCount = await concordiaContract.concordCount();
    concordID = concordCount.toNumber();
    console.log("work agreement id: ", concordID);

    const agreement = await concordiaContract.concords(concordID);
    console.log("work agreement: ", agreement);

    expect(agreement.checksum).to.equal(agreementChecksum);
    expect(agreement.price).to.equal(agreementPrice);
    expect(agreement.proprietor).to.equal(await owner.getAddress());
    expect(agreement.client).to.equal(await owner.getAddress());
    expect(agreement.verifier).to.equal(verifier);
  });

  // todo: approve work agreement

  it("pay for new work agreement", async () => {
    // pay work agreement
    let tx = await concordiaContract
      .connect(owner)
      .payWorkAgreement(concordID, { value: agreementPrice });
    let res = await tx.wait();
    console.log(res.events);

    const agreement = await concordiaContract.concords(concordID);
    expect(agreement.paid).to.equal(true);
  });

  it("update decryption key for new work agreement", async () => {
    const concordCount = await concordiaContract.concordCount();
    concordID = concordCount.toNumber();

    let tx = await concordiaContract
      .connect(owner)
      .updateDecryptionKey(concordID, agreementDecryptionKey);

    let res = await tx.wait();
    console.log(res.events);
  });
});
