import hre from "hardhat";
import { ethers } from "hardhat";
import addresses from "../src/addresses";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getDeployedContract } from "./utils";

async function main() {
  const signer = hre.ethers.provider.getSigner();

  const network = hre.network.name;
  const {
    chainlinkOperator: operatorContractAddress,
    chainlinkNode: chainlinkNodeAddress,
  } = addresses[network];

  const contract = await getDeployedContract(
    hre,
    "Operator",
    operatorContractAddress
  );
  console.log(chainlinkNodeAddress);

  const tx = await contract
    .connect(signer)
    .setAuthorizedSenders(chainlinkNodeAddress);
  console.log("Transaction sent, waiting for it to be mined...");

  const receipt = await tx.wait();
  console.log("Transaction mined:", receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
