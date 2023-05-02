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
const chai_1 = require("chai");
const addresses_1 = __importDefault(require("../src/addresses"));
const utils_1 = require("../src/utils");
describe("Chainlancer", () => {
    let chainlancerContract;
    let owner;
    let client;
    let verifier = "0x0000000000000000000000000000000000000000";
    let workAgreementID;
    const { chainlancer } = addresses_1.default[hardhat_1.default.network.name];
    // test params
    const ipfsCID = "QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi";
    const agreementChecksum = hardhat_2.ethers.utils.formatBytes32String("0x1234");
    const agreementPrice = hardhat_2.ethers.utils.parseEther("0.0");
    const agreementDecryptionKey = hardhat_2.ethers.utils.formatBytes32String("0x1234");
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        [owner, client] = yield hardhat_2.ethers.getSigners();
        chainlancerContract = yield (0, utils_1.getDeployedContract)(hardhat_1.default, "Chainlancer", chainlancer);
    }));
    it("create work agreement", () => __awaiter(void 0, void 0, void 0, function* () {
        // create work agreement
        let tx = yield chainlancerContract
            .connect(owner)
            .createWorkAgreement(agreementChecksum, agreementPrice, yield owner.getAddress(), verifier, ipfsCID);
        let res = yield tx.wait();
        console.log(res.events);
        // get id of created work agreement
        const workAgreementCount = yield chainlancerContract.workAgreementCount();
        workAgreementID = workAgreementCount.toNumber() - 1;
        let agreement = yield chainlancerContract.workAgreements(workAgreementID);
        (0, chai_1.expect)(agreement.checksum).to.equal(agreementChecksum);
        (0, chai_1.expect)(agreement.price).to.equal(agreementPrice);
        (0, chai_1.expect)(agreement.proprietor).to.equal(yield owner.getAddress());
        (0, chai_1.expect)(agreement.client).to.equal(yield owner.getAddress());
        (0, chai_1.expect)(agreement.verifier).to.equal(verifier);
    }));
    // todo: approve work agreement
    it("pay for new work agreement", () => __awaiter(void 0, void 0, void 0, function* () {
        let agreement = yield chainlancerContract.workAgreements(workAgreementID);
        (0, chai_1.expect)(agreement.checksum).to.equal(agreementChecksum);
        (0, chai_1.expect)(agreement.price).to.equal(agreementPrice);
        (0, chai_1.expect)(agreement.proprietor).to.equal(yield owner.getAddress());
        (0, chai_1.expect)(agreement.client).to.equal(yield owner.getAddress());
        (0, chai_1.expect)(agreement.verifier).to.equal(verifier);
        // pay work agreement
        let tx = yield chainlancerContract
            .connect(owner)
            .payWorkAgreement(workAgreementID, { value: agreementPrice });
        let res = yield tx.wait();
        console.log(res.events);
        agreement = yield chainlancerContract.workAgreements(workAgreementID);
        (0, chai_1.expect)(agreement.paid).to.equal(true);
    }));
    it("update decryption key for new work agreement", () => __awaiter(void 0, void 0, void 0, function* () {
        let res = yield chainlancerContract
            .connect(owner)
            .updateDecryptionKey(workAgreementID, agreementDecryptionKey);
        console.log(res.events);
    }));
});
