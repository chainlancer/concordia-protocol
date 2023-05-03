"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultSigner = void 0;
const config_1 = __importDefault(require("../../config"));
const ethers_1 = require("ethers");
// todo
function getDefaultSigner() {
    const provider = new ethers_1.ethers.providers.JsonRpcProvider(config_1.default["sepolia"].providerURL);
    return new ethers_1.ethers.Wallet(config_1.default["sepolia"].privateKey, provider);
}
exports.getDefaultSigner = getDefaultSigner;
//# sourceMappingURL=signer.js.map