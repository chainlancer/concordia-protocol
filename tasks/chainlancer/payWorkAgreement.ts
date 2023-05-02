import { getDeployedContract } from "../../src/utils";
import config from "../../src/config";
import { task } from "hardhat/config";
import { CHAINLANCER } from "./consts";

task("chainlancerPayWorkAgreement", "Fetch historical events")
  .addParam("wid", "Work agreement ID")
  .setAction(async (args, hre) => {
    const { wid } = args;
    const signer = hre.ethers.provider.getSigner();

    const { chainlancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(
      hre,
      CHAINLANCER,
      chainlancerAddress
    );

    const tx = await contract.connect(signer).payWorkAgreement(wid);
    console.log("Transaction sent, waiting for it to be mined...");

    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);
  });
