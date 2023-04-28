import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";

describe("Chainlancer", () => {
  let chainlancer: Contract;
  let owner: Signer;
  let client: Signer;
  let verifier: Signer;
  //   let others: Signer[];

  beforeEach(async () => {
    [owner, client, verifier] = await ethers.getSigners();

    // const LinkTokenFactory = new ChainlinkToken
    // const linkToken = await LinkTokenFactory.deploy(10000000);

    const ownerAddress = await owner.getAddress();

    const OperatorFactory = await ethers.getContractFactory("Operator");
    const operator = await OperatorFactory.deploy(ownerAddress, ownerAddress);

    const ChainlancerFactory = await ethers.getContractFactory("Chainlancer");
    chainlancer = await ChainlancerFactory.deploy(
      operator.address,
      "c6d0b1b86b6d40d890a31bfa8bd50c7c",
      0,
      operator.address // todo: replace with chainlink token address
    );
  });

  it("should create a work agreement", async () => {
    await chainlancer
      .connect(owner)
      .createWorkAgreement(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        100,
        await client.getAddress(),
        await verifier.getAddress(),
        "QmExampleCID"
      );

    const agreement = await chainlancer.workAgreements(1);
    expect(agreement.checksum).to.equal(
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    );
    expect(agreement.price).to.equal(100);
    expect(agreement.proprietor).to.equal(await owner.getAddress());
    expect(agreement.client).to.equal(await client.getAddress());
    expect(agreement.verifier).to.equal(await verifier.getAddress());
  });

  it("should allow anyone to pay for a work agreement", async () => {
    await chainlancer
      .connect(owner)
      .createWorkAgreement(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        100,
        await client.getAddress(),
        await verifier.getAddress(),
        "QmExampleCID"
      );

    await chainlancer.connect(client).payWorkAgreement(1, { value: 100 });

    // const agreement = await contract.workAgreements(1);
    // expect(agreement.paid).to.be.true;
  });

  it("should allow the verifier to approve a work agreement", async () => {
    await chainlancer
      .connect(owner)
      .createWorkAgreement(
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        100,
        await client.getAddress(),
        await verifier.getAddress(),
        "QmExampleCID"
      );

    await chainlancer.connect(verifier).approveWorkAgreement(1);

    // const agreement = await contract.workAgreements(1);
    // expect(agreement.verifierApproved).to.be.true;
  });
});
