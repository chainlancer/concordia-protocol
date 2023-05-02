import hre from "hardhat";
import { ethers } from "hardhat";
import config from "../../src/config";

const main = async () => {
  const { chainlinkTokenAddress, chainlinkOperatorAddress, chainlinkJobID } =
    config[hre.network.name];

  const ChainlancerFactory = await ethers.getContractFactory("Chainlancer");
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
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export default {};
