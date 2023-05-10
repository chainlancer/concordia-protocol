import { ethers } from "hardhat";
import config from "../../../config";
import hre from "hardhat";

async function main() {
  const {
    chainlinkTokenAddress,
    chainlinkOperatorAddress,
    chainlinkJobID,
    concordiaPublicKey,
  } = config[hre.network.name];

  const ConcordiaFactory = await ethers.getContractFactory("Concordia");
  const concordia = await ConcordiaFactory.deploy(
    chainlinkOperatorAddress,
    chainlinkJobID,
    0,
    chainlinkTokenAddress,
    ethers.utils.hexZeroPad("0x" + concordiaPublicKey, 64)
  );

  await concordia.deployed();

  console.log("deployed to:", concordia.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
