import hre from "hardhat";
import { ethers } from "hardhat";
import config from "../../src/config";
import { getDeployedContract } from "../../src/utils";
import { WorkAgreementCreate } from "../../src/models";

// params
const PRICE = "0.0";
const VERIFIER = "0x0000000000000000000000000000000000000000";
const IPFSCID = "QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi";
const CHECKSUM = "0x1234";

async function main() {
  const signer = hre.ethers.provider.getSigner();

  const { chainlancerAddress } = config[hre.network.name];

  const contract = await getDeployedContract(
    hre,
    "Chainlancer",
    chainlancerAddress
  );

  const workAgreement: WorkAgreementCreate = {
    checksum: ethers.utils.formatBytes32String(CHECKSUM),
    price: ethers.utils.parseEther(PRICE),
    client: await signer.getAddress(),
    verifier: VERIFIER,
    ipfsCID: IPFSCID,
  };

  const tx = await contract
    .connect(signer)
    .createWorkAgreement(
      workAgreement.checksum,
      workAgreement.price,
      workAgreement.client,
      workAgreement.verifier,
      workAgreement.ipfsCID
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
