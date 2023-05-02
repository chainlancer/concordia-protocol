import hre from "hardhat";
import { ethers } from "hardhat";
import config from "../../src/config";
import { getDeployedContract } from "../../src/utils";

// params
const WORK_AGREEMENT_ID = "1";

async function main() {
  const signer = hre.ethers.provider.getSigner();

  const { chainlancerAddress } = config[hre.network.name];

  const contract = await getDeployedContract(
    hre,
    "Chainlancer",
    chainlancerAddress
  );

  const workAgreement = await contract
    .connect(signer)
    .workAgreements(WORK_AGREEMENT_ID);
  console.log("work agreement: ", workAgreement);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
