import { ethers } from "ethers";
import config from "../../../config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { LANCER } from "../../src/consts";

task("lancerUpdateDecryptionKey", "Update decryption key for a work agreement")
  .addParam("id", "The ID of the work agreement")
  .addParam("key", "The decryption key")
  .setAction(async (args, hre) => {
    const { id, key } = args;

    const signer = hre.ethers.provider.getSigner();

    const { lancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(hre, LANCER, lancerAddress);

    const tx = await contract
      .connect(signer)
      .updateDecryptionKey(id, ethers.utils.hexZeroPad("0x" + key, 32));
    console.log("Transaction sent, waiting for it to be mined...");

    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);
  });
