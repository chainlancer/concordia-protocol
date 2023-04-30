import hre from "hardhat";
import { ethers } from "hardhat";
import contractAddresses from "../src/contractAddresses";

const main = async () => {
  const chainlinkTokenAddress = contractAddresses[hre.network.name].chainlink;

  const ChainlancerFactory = await ethers.getContractFactory("Chainlancer");
  const chainlancer = await ChainlancerFactory.deploy(
    "c6d0b1b86b6d40d890a31bfa8bd50c7c",
    "c6d0b1b86b6d40d890a31bfa8bd50c7c",
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
