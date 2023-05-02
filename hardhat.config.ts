/* eslint-disable node/no-missing-import */
import * as dotenv from "dotenv";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
// import { HardhatUserConfig } from "hardhat/config";
import "solidity-coverage";
import {
  HardhatUserConfig,
  HardhatNetworkUserConfig,
  HttpNetworkUserConfig,
  NetworksUserConfig,
} from "hardhat/types";

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

const config: HardhatUserConfig = {
  mocha: {
    timeout: 1000000,
  },
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
      accounts:
        process.env.SEPOLIA_PRIVATE_KEY !== undefined
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

export default config;
