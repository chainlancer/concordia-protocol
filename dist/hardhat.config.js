"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable node/no-missing-import */
const dotenv = __importStar(require("dotenv"));
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@typechain/hardhat");
require("hardhat-gas-reporter");
// import { HardhatUserConfig } from "hardhat/config";
require("solidity-coverage");
dotenv.config();
// // Extend the Hardhat config so that we can add the chainlinkTokenAddress
// type ExtendedHardhatNetworkUserConfig = HardhatNetworkUserConfig & {
//   chainlinkTokenAddress?: string;
// };
// type ExtendedHttpNetworkUserConfig = HttpNetworkUserConfig & {
//   chainlinkTokenAddress?: string;
// };
// type ExtendedNetworkUserConfig =
//   | ExtendedHardhatNetworkUserConfig
//   | ExtendedHttpNetworkUserConfig;
// interface ExtendedNetworksUserConfig extends NetworksUserConfig {
//   hardhat?: ExtendedHardhatNetworkUserConfig;
//   [networkName: string]: ExtendedNetworkUserConfig | undefined;
// }
// interface ExtendedHardhatUserConfig extends HardhatUserConfig {
//   networks: ExtendedNetworksUserConfig;
// }
const config = {
    solidity: {
        compilers: [
            {
                version: "0.8.7",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.7.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        localhost: {
            url: "http://localhost:8545",
            chainId: 31337,
            accounts: [],
        },
        sepolia: {
            url: process.env.SEPOLIA_URL || "",
            chainId: 11155111,
            accounts: process.env.SEPOLIA_PRIVATE_KEY !== undefined
                ? [process.env.SEPOLIA_PRIVATE_KEY]
                : [],
        },
    },
    gasReporter: {
        currency: "USD",
        enabled: true,
        gasPrice: 21,
        coinmarketcap: process.env.COINMARKETCAP_KEY,
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
};
exports.default = config;
