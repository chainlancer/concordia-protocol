/* eslint-disable node/no-missing-import */
import * as dotenv from "dotenv";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import { HardhatUserConfig, task } from "hardhat/config";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  paths: {
    sources: "./clr-ea/contracts",
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
      // gasPrice: 470000000000
      accounts: [
        // "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // deployer
        // "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // user1
        // "5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // user2
        // "7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", // user3
        // "47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a", // user4
        // "de9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0", // admin
        // "df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e", // user6
        // "4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356", // user7
        // "dbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97", // user8
        // "2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6", // user9
        // "f214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897", // user10
        // "701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82", // user11
        // "a267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1", // user12
        // "47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd", // user13
        // "c526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa", // user14
        // "8166f546bab6da521a8369cab06c5d2b9e46670292d85c875ee9ec20e84ffb61", // user15
      ],
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      chainId: 3,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/7wWUF2gIYOCCSYjdWTCHZCSYE6MtpXVe",
      chainId: 4,
      accounts: [
        // deployer
        // user1
        // user2
        // user3
        // user4
      ],
      gas: 2100000,
      gasPrice: 8000000000,
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      accounts: [],
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
