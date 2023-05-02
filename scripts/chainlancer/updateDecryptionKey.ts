import hre from "hardhat";
import { ethers } from "hardhat";
import config from "../../src/config";
import { getDeployedContract } from "../../src/utils";

// params
const WORK_AGREEMENT_ID = "3";
const DECRYPTION_KEY = "0x1234";

async function main() {
  const signer = hre.ethers.provider.getSigner();

  const { chainlancerAddress } = config[hre.network.name];

  const contract = await getDeployedContract(
    hre,
    "Chainlancer",
    chainlancerAddress
  );

  const tx = await contract
    .connect(signer)
    .updateDecryptionKey(
      WORK_AGREEMENT_ID,
      ethers.utils.formatBytes32String(DECRYPTION_KEY)
    );
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
