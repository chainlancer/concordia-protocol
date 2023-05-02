import { ethers } from "hardhat";
import config from "../../src/config";
import { task } from "hardhat/config";
import { OPERATOR } from "./consts";

// TODO: this task is not importable because it references "ethers" which is not
// available in the tasks/ folder.  This is a limitation of the hardhat tasks
task("deploy", "Deploy Operator Contract").setAction(async (args, hre) => {
  let [owner] = await ethers.getSigners();

  const { chainlinkTokenAddress } = config[hre.network.name];

  const OperatorFactory = await ethers.getContractFactory(OPERATOR);
  const operator = await OperatorFactory.deploy(
    chainlinkTokenAddress,
    owner.address
  );

  await operator.deployed();

  console.log("===============================");
  console.log("Operator Addr: ", operator.address);
  console.log("===============================");
  console.log("owner", await operator.owner());
});
