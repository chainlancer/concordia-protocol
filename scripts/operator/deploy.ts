import hre from "hardhat";
import { ethers } from "hardhat";
import config from "../../src/config";

const main = async () => {
  let [owner] = await ethers.getSigners();

  const { chainlinkTokenAddress } = config[hre.network.name];

  const OperatorFactory = await ethers.getContractFactory("Operator");
  const operator = await OperatorFactory.deploy(
    chainlinkTokenAddress,
    owner.address
  );

  await operator.deployed();

  console.log("===============================");
  console.log("Operator Addr: ", operator.address);
  console.log("===============================");
  console.log("owner", await operator.owner());
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export default {};
