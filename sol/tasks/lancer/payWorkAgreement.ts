import config from "../../../config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { LANCER } from "../../src/consts";

task("lancerPayWorkAgreement", "Fetch historical events")
  .addParam("wid", "Work agreement ID")
  .setAction(async (args, hre) => {
    const { wid } = args;
    const signer = hre.ethers.provider.getSigner();

    const { lancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(hre, LANCER, lancerAddress);

    const tx = await contract.connect(signer).payWorkAgreement(wid);
    console.log("Transaction sent, waiting for it to be mined...");

    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);
  });
