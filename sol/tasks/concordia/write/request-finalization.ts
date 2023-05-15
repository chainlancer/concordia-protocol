import config from "../../../../config";
import { getDeployedContract } from "../../../src/utils";
import { task } from "hardhat/config";
import { CONCORDIA } from "../../../src/consts";

task("request-finalization", "Request finalization of a concord")
  .addParam("id", "ID of the concord")
  .setAction(async (args, hre) => {
    const { id } = args;

    const signer = hre.ethers.provider.getSigner();

    const { concordiaAddress } = config[hre.network.name];

    const contract = await getDeployedContract(
      hre,
      CONCORDIA,
      concordiaAddress
    );

    const tx = await contract.connect(signer).requestFinalization(id);
    console.log("Transaction sent, waiting for it to be mined...");

    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);
  });
