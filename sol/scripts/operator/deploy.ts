import { ethers } from "hardhat";

async function main() {
  const operatorFactory = await ethers.getContractFactory("Operator");
  const operator = await operatorFactory.deploy();

  await operator.deployed();

  console.log("deployed to:", operator.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
