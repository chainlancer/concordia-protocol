import { task } from "hardhat/config";
import {
  LANCER,
  DEFAULT_CHECKSUM,
  DEFAULT_IPFS_CID,
  DEFAULT_VERIFIER,
} from "../../src/consts";
import { getDeployedContract } from "../../src/utils";
import config from "../../../config";
import { ethers } from "ethers";

task("lancerCreateWorkAgreement", "Create a work agreement")
  .addParam("price", "The price of the work agreement", "0.0")
  .addParam("verifier", "The address of the verifier", DEFAULT_VERIFIER)
  .addParam("cid", "The IPFS CID for the work agreement", DEFAULT_IPFS_CID)
  .addParam("checksum", "The checksum for the work agreement", DEFAULT_CHECKSUM)
  .setAction(async (args: any, hre: any) => {
    const { price, verifier, cid: ipfsCID, checksum } = args;

    const signer = hre.ethers.provider.getSigner();

    const { lancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(hre, LANCER, lancerAddress);

    const tx = await contract
      .connect(signer)
      .createWorkAgreement(
        ethers.utils.arrayify("0x" + checksum),
        ethers.utils.parseEther(price),
        await signer.getAddress(),
        verifier,
        ipfsCID
      );
    console.log("Transaction sent, waiting for it to be mined...");

    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);

    const workAgreementCount = await contract.workAgreementCount();
    console.log("work agreement id: ", workAgreementCount.toNumber());
  });
