/* eslint-disable node/no-missing-import */
import * as dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import { HardhatUserConfig } from "hardhat/types";

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

// TODO: is there a less tedious way to import these tasks?
// import "./tasks/concordia/test";
import "./tasks/concordia/create";
import "./tasks/concordia/events";
import "./tasks/concordia/pay";
import "./tasks/concordia/submitKey";
import "./tasks/concordia/byId";
import "./tasks/concordia/count";
import "./tasks/concordia/byBuyer";
import "./tasks/concordia/byProposer";
import "./tasks/operator/setAuthorizedSenders";

// TODO: these tasks are not importable because they reference "ethers" which is
// not available in the tasks/ folder.  This is a limitation of the hardhat tasks
// import "./tasks/concordia/deploy";
// import "./tasks/operator/deploy";

export default config;
