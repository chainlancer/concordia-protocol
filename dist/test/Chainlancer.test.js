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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
const hardhat_2 = require("hardhat");
const config_1 = __importDefault(require("../src/config"));
const utils_1 = require("../src/utils");
describe("Chainlancer", () => {
    let chainlancerContract;
    let owner;
    let client;
    let verifier = "0x0000000000000000000000000000000000000000";
    let workAgreementID;
    const { chainlancerAddress } = config_1.default[hardhat_1.default.network.name];
    // test params
    const ipfsCID = "QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi";
    const agreementChecksum = hardhat_2.ethers.utils.formatBytes32String("0x1234");
    const agreementPrice = hardhat_2.ethers.utils.parseEther("0.0");
    // const agreementDecryptionKey = ethers.utils.formatBytes32String("0x1234");
    const agreementDecryptionKey = "1234567890";
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        [owner, client] = yield hardhat_2.ethers.getSigners();
        chainlancerContract = yield (0, utils_1.getDeployedContract)(hardhat_1.default, "Chainlancer", chainlancerAddress);
    }));
    // it("create work agreement", async () => {
    //   // create work agreement
    //   let tx = await chainlancerContract
    //     .connect(owner)
    //     .createWorkAgreement(
    //       agreementChecksum,
    //       agreementPrice,
    //       await owner.getAddress(),
    //       verifier,
    //       ipfsCID
    //     );
    //   let res = await tx.wait();
    //   console.log(res.events);
    //   // get id of created work agreement
    //   const workAgreementCount = await chainlancerContract.workAgreementCount();
    //   workAgreementID = workAgreementCount.toNumber();
    //   console.log("work agreement id: ", workAgreementID);
    //   const agreement = await chainlancerContract.workAgreements(workAgreementID);
    //   console.log("work agreement: ", agreement);
    //   expect(agreement.checksum).to.equal(agreementChecksum);
    //   expect(agreement.price).to.equal(agreementPrice);
    //   expect(agreement.proprietor).to.equal(await owner.getAddress());
    //   expect(agreement.client).to.equal(await owner.getAddress());
    //   expect(agreement.verifier).to.equal(verifier);
    // });
    // // todo: approve work agreement
    // it("pay for new work agreement", async () => {
    //   // pay work agreement
    //   let tx = await chainlancerContract
    //     .connect(owner)
    //     .payWorkAgreement(workAgreementID, { value: agreementPrice });
    //   let res = await tx.wait();
    //   console.log(res.events);
    //   const agreement = await chainlancerContract.workAgreements(workAgreementID);
    //   expect(agreement.paid).to.equal(true);
    // });
    it("update decryption key for new work agreement", () => __awaiter(void 0, void 0, void 0, function* () {
        const workAgreementCount = yield chainlancerContract.workAgreementCount();
        workAgreementID = workAgreementCount.toNumber();
        let tx = yield chainlancerContract
            .connect(owner)
            .updateDecryptionKey(workAgreementID, agreementDecryptionKey);
        let res = yield tx.wait();
        console.log(res.events);
    }));
});
