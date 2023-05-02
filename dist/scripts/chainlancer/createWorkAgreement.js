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
const config_1 = __importDefault(require("../../src/config"));
const utils_1 = require("../../src/utils");
// params
const price = "0.0";
const verifier = "0x0000000000000000000000000000000000000000";
const ipfsCID = "QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi";
const checksum = "0x1234";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const signer = hardhat_1.default.ethers.provider.getSigner();
        const { chainlancerAddress } = config_1.default[hardhat_1.default.network.name];
        const contract = yield (0, utils_1.getDeployedContract)(hardhat_1.default, "Chainlancer", chainlancerAddress);
        const workAgreement = {
            checksum: hardhat_2.ethers.utils.formatBytes32String(checksum),
            price: hardhat_2.ethers.utils.parseEther(price),
            client: yield signer.getAddress(),
            verifier,
            ipfsCID,
        };
        const tx = yield contract
            .connect(signer)
            .createWorkAgreement(workAgreement.checksum, workAgreement.price, workAgreement.client, workAgreement.verifier, workAgreement.ipfsCID);
        console.log("Transaction sent, waiting for it to be mined...");
        const receipt = yield tx.wait();
        console.log("Transaction mined:", receipt.transactionHash);
    });
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
