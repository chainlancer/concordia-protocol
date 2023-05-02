import { ethers } from "ethers";
import config from "../../src/config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { CHAINLANCER } from "./consts";

task(
  "chainlancerUpdateDecryptionKey",
  "Update decryption key for a work agreement"
)
  .addParam("wid", "The ID of the work agreement")
  .addParam("key", "The decryption key")
  .setAction(async (args, hre) => {
    const { wid, key } = args;

    const signer = hre.ethers.provider.getSigner();

    const { chainlancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(
      hre,
      CHAINLANCER,
      chainlancerAddress
    );

    const tx = await contract
      .connect(signer)
      .updateDecryptionKey(wid, ethers.utils.formatBytes32String(key));
    console.log("Transaction sent, waiting for it to be mined...");

    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);
  });
