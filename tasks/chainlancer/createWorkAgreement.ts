import config from "../../src/config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import {
  CHAINLANCER,
  DEFAULT_CHECKSUM,
  DEFAULT_IPFS_CID,
  DEFAULT_VERIFIER,
} from "./consts";
import { ethers } from "ethers";

task("chainlancerCreateWorkAgreement", "Create a work agreement")
  .addParam("price", "The price of the work agreement", "0.0")
  .addParam("verifier", "The address of the verifier", DEFAULT_VERIFIER)
  .addParam("cid", "The IPFS CID for the work agreement", DEFAULT_IPFS_CID)
  .addParam("checksum", "The checksum for the work agreement", DEFAULT_CHECKSUM)
  .setAction(async (args, hre) => {
    const { price, verifier, cid: ipfsCID, checksum } = args;

    const signer = hre.ethers.provider.getSigner();

    const { chainlancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(
      hre,
      CHAINLANCER,
      chainlancerAddress
    );

    const tx = await contract
      .connect(signer)
      .createWorkAgreement(
        ethers.utils.formatBytes32String(checksum),
        ethers.utils.parseEther(price),
        await signer.getAddress(),
        verifier,
        ipfsCID
      );
    console.log("Transaction sent, waiting for it to be mined...");

    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);
  });
