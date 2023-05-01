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
    const chainlinkTokenAddress = addresses_1.default[hardhat_1.default.network.name].chainlinkToken;
    const oracleContractAddress = addresses_1.default[hardhat_1.default.network.name].chainlinkOperator;
    const chainlinkJobID = addresses_1.default[hardhat_1.default.network.name].chainlinkJobID;
    const ChainlancerFactory = yield hardhat_2.ethers.getContractFactory("Chainlancer");
    const chainlancer = yield ChainlancerFactory.deploy(oracleContractAddress, chainlinkJobID, 0, chainlinkTokenAddress);
    yield chainlancer.deployed();
    console.log("===============================");
    console.log("Chainlancer Addr: ", chainlancer.address);
    console.log("===============================");
    console.log("owner", yield chainlancer.owner());
});
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
exports.default = {};
