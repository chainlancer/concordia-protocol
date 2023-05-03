import { ethers } from "hardhat";
import config from "../../../config";
import hre from "hardhat";

async function main() {
  const { chainlinkTokenAddress, chainlinkOperatorAddress, chainlinkJobID } =
    config[hre.network.name];

  const LancerFactory = await ethers.getContractFactory("Lancer");
  const lancer = await LancerFactory.deploy(
    chainlinkOperatorAddress,
    chainlinkJobID,
    0,
    chainlinkTokenAddress
  );

  await lancer.deployed();

  console.log("deployed to:", lancer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
