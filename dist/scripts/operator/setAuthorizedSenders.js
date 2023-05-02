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
const addresses_1 = __importDefault(require("../../src/addresses"));
const utils_1 = require("../../src/utils");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const signer = hardhat_1.default.ethers.provider.getSigner();
        const network = hardhat_1.default.network.name;
        const { chainlinkOperator: operatorContractAddress, chainlinkNode: chainlinkNodeAddress, } = addresses_1.default[network];
        const contract = yield (0, utils_1.getDeployedContract)(hardhat_1.default, "Operator", operatorContractAddress);
        console.log(chainlinkNodeAddress);
        const tx = yield contract
            .connect(signer)
            .setAuthorizedSenders(chainlinkNodeAddress);
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
