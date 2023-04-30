import hre from "hardhat";
import { ethers } from "hardhat";
import addresses from "../src/addresses";

const main = async () => {
  let [owner] = await ethers.getSigners();

  const network = hre.network.name;
  const chainlinkTokenAddress = addresses[network].chainlinkToken;
  if (!chainlinkTokenAddress)
    throw new Error(`no chainlink token address for network ${network}`);

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
