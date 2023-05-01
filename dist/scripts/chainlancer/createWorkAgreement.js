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
const addresses_1 = __importDefault(require("../../src/addresses"));
const utils_1 = require("../utils");
// function createWorkAgreement
// bytes32 _checksum,
// uint256 _price,
// address payable _client,
// address payable _verifier,
// string memory _ipfsCID
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const signer = hardhat_1.default.ethers.provider.getSigner();
        const network = hardhat_1.default.network.name;
        const { chainlancer: chainlancerContractAddress, chainlinkNode: chainlinkNodeAddress, } = addresses_1.default[network];
        const contract = yield (0, utils_1.getDeployedContract)(hardhat_1.default, "Chainlancer", chainlancerContractAddress);
        const checksum = hardhat_2.ethers.utils.formatBytes32String("0x1234");
        const price = hardhat_2.ethers.utils.parseEther("0.0");
        const client = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const verifier = "0x0000000000000000000000000000000000000000";
        const cid = "QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi";
        const tx = yield contract
            .connect(signer)
            .createWorkAgreement(checksum, price, client, verifier, cid);
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
