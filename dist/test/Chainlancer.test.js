"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const chai_1 = require("chai");
describe("Chainlancer", () => {
    let chainlancer;
    let owner;
    let client;
    let verifier;
    //   let others: Signer[];
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        [owner, client, verifier] = yield hardhat_1.ethers.getSigners();
        // const LinkTokenFactory = new ChainlinkToken
        // const linkToken = await LinkTokenFactory.deploy(10000000);
        const ownerAddress = yield owner.getAddress();
        const OperatorFactory = yield hardhat_1.ethers.getContractFactory("Operator");
        const operator = yield OperatorFactory.deploy(ownerAddress, ownerAddress);
        const ChainlancerFactory = yield hardhat_1.ethers.getContractFactory("Chainlancer");
        chainlancer = yield ChainlancerFactory.deploy(operator.address, "c6d0b1b86b6d40d890a31bfa8bd50c7c", 0, operator.address // todo: replace with chainlink token address
        );
    }));
    it("should create a work agreement", () => __awaiter(void 0, void 0, void 0, function* () {
        yield chainlancer
            .connect(owner)
            .createWorkAgreement("0x0000000000000000000000000000000000000000000000000000000000000001", 100, yield client.getAddress(), yield verifier.getAddress(), "QmExampleCID");
        const agreement = yield chainlancer.workAgreements(1);
        (0, chai_1.expect)(agreement.checksum).to.equal("0x0000000000000000000000000000000000000000000000000000000000000001");
        (0, chai_1.expect)(agreement.price).to.equal(100);
        (0, chai_1.expect)(agreement.proprietor).to.equal(yield owner.getAddress());
        (0, chai_1.expect)(agreement.client).to.equal(yield client.getAddress());
        (0, chai_1.expect)(agreement.verifier).to.equal(yield verifier.getAddress());
    }));
    it("should allow anyone to pay for a work agreement", () => __awaiter(void 0, void 0, void 0, function* () {
        yield chainlancer
            .connect(owner)
            .createWorkAgreement("0x0000000000000000000000000000000000000000000000000000000000000001", 100, yield client.getAddress(), yield verifier.getAddress(), "QmExampleCID");
        yield chainlancer.connect(client).payWorkAgreement(1, { value: 100 });
        // const agreement = await contract.workAgreements(1);
        // expect(agreement.paid).to.be.true;
    }));
    it("should allow the verifier to approve a work agreement", () => __awaiter(void 0, void 0, void 0, function* () {
        yield chainlancer
            .connect(owner)
            .createWorkAgreement("0x0000000000000000000000000000000000000000000000000000000000000001", 100, yield client.getAddress(), yield verifier.getAddress(), "QmExampleCID");
        yield chainlancer.connect(verifier).approveWorkAgreement(1);
        // const agreement = await contract.workAgreements(1);
        // expect(agreement.verifierApproved).to.be.true;
    }));
    // it("it should allow the proprietor to update the decryption key", async () => {
    //   await chainlancer
    //     .connect(owner)
    //     .createWorkAgreement(
    //       "0x0000000000000000000000000000000000000000000000000000000000000001",
    //       100,
    //       await client.getAddress(),
    //       await verifier.getAddress(),
    //       "QmExampleCID"
    //     );
    //   await chainlancer.connect(verifier).approveWorkAgreement(1);
    //   await chainlancer
    //     .connect(owner)
    //     .updateDecryptionKey(1, ethers.utils.formatBytes32String("0x1234"));
    // });
});
