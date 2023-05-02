import { ethers } from "hardhat";
import config from "../../src/config";
import { task } from "hardhat/config";
import { CHAINLANCER } from "./consts";

// TODO: this task is not importable because it references "ethers" which is not
// available in the tasks/ folder.  This is a limitation of the hardhat tasks
task("deploy", "Deploy Chainlancer Contract").setAction(async (args, hre) => {
  const { chainlinkTokenAddress, chainlinkOperatorAddress, chainlinkJobID } =
    config[hre.network.name];

  const ChainlancerFactory = await ethers.getContractFactory(CHAINLANCER);

  const chainlancer = await ChainlancerFactory.deploy(
    chainlinkOperatorAddress,
    chainlinkJobID,
    0,
    chainlinkTokenAddress
  );

  await chainlancer.deployed();
  console.log("===============================");
  console.log("Chainlancer Addr: ", chainlancer.address);
  console.log("===============================");
  console.log("owner", await chainlancer.owner());
});
