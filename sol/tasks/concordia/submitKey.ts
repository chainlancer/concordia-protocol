import { ethers } from "ethers";
import config from "../../../config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { CONCORDIA } from "../../src/consts";

task("concordiaSubmitKey", "Submit a decryption key")
  .addParam("id", "ID of the concord")
  .addParam("key", "The public key encrypted decryption key")
  .setAction(async (args, hre) => {
    const { id, key } = args;

    const signer = hre.ethers.provider.getSigner();

    const { concordiaAddress } = config[hre.network.name];

    const contract = await getDeployedContract(
      hre,
      CONCORDIA,
      concordiaAddress
    );

    const tx = await contract
      .connect(signer)
      .submitKey(id, ethers.utils.hexZeroPad("0x" + key, 128));
    // .submitKey(id, ethers.utils.hexZeroPad("0x" + key, 32));
    console.log("Transaction sent, waiting for it to be mined...");

    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);
  });
