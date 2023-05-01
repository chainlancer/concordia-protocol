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
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    let [owner] = yield hardhat_2.ethers.getSigners();
    const network = hardhat_1.default.network.name;
    const chainlinkTokenAddress = addresses_1.default[network].chainlinkToken;
    if (!chainlinkTokenAddress)
        throw new Error(`no chainlink token address for network ${network}`);
    const OperatorFactory = yield hardhat_2.ethers.getContractFactory("Operator");
    const operator = yield OperatorFactory.deploy(chainlinkTokenAddress, owner.address);
    yield operator.deployed();
    console.log("===============================");
    console.log("Operator Addr: ", operator.address);
    console.log("===============================");
    console.log("owner", yield operator.owner());
});
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
exports.default = {};
