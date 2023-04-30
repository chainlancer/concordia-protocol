import hre from "hardhat";
import { ethers } from "hardhat";
import addresses from "../src/addresses";

const main = async () => {
  const chainlinkTokenAddress = addresses[hre.network.name].chainlinkToken;
  const oracleContractAddress = addresses[hre.network.name].chainlinkOperator;
  const chainlinkJobID = addresses[hre.network.name].chainlinkJobID;

  const ChainlancerFactory = await ethers.getContractFactory("Chainlancer");
  const chainlancer = await ChainlancerFactory.deploy(
    oracleContractAddress,
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
