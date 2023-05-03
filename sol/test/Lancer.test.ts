import hre from "hardhat";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import config from "../../config";
import { getDeployedContract } from "../src/utils";

describe("Lancer", () => {
  let lancerContract: Contract;
  let owner: Signer;
  let client: Signer;
  let verifier = "0x0000000000000000000000000000000000000000";
  let workAgreementID: any;

  const { lancerAddress } = config[hre.network.name];

  // test params
  const ipfsCID = "QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi";
  const agreementChecksum = ethers.utils.formatBytes32String("0x1234");
  const agreementPrice = ethers.utils.parseEther("0.0");
  // const agreementDecryptionKey = ethers.utils.formatBytes32String("0x1234");
  const agreementDecryptionKey = "1234567890";

  beforeEach(async () => {
    [owner, client] = await ethers.getSigners();

    lancerContract = await getDeployedContract(hre, "Lancer", lancerAddress);
  });

  it("create work agreement", async () => {
    // create work agreement
    let tx = await lancerContract
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
    const workAgreementCount = await lancerContract.workAgreementCount();
    workAgreementID = workAgreementCount.toNumber();
    console.log("work agreement id: ", workAgreementID);

    const agreement = await lancerContract.workAgreements(workAgreementID);
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
    let tx = await lancerContract
      .connect(owner)
      .payWorkAgreement(workAgreementID, { value: agreementPrice });
    let res = await tx.wait();
    console.log(res.events);

    const agreement = await lancerContract.workAgreements(workAgreementID);
    expect(agreement.paid).to.equal(true);
  });

  it("update decryption key for new work agreement", async () => {
    const workAgreementCount = await lancerContract.workAgreementCount();
    workAgreementID = workAgreementCount.toNumber();

    let tx = await lancerContract
      .connect(owner)
      .updateDecryptionKey(workAgreementID, agreementDecryptionKey);

    let res = await tx.wait();
    console.log(res.events);
  });
});
