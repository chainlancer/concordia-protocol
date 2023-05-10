import { task } from "hardhat/config";
import {
  CONCORDIA,
  DEFAULT_CHECKSUM,
  DEFAULT_DELIVERABLE_IPFS_CID,
  DEFAULT_ARBITER,
  DEFAULT_METADATA_IPFS_CID,
} from "../../src/consts";
import { getDeployedContract } from "../../src/utils";
import config from "../../../config";
import { ethers } from "ethers";

task("concordiaCreate", "Create a concord")
  .addParam("buyer", "Buyer address", undefined, undefined, true)
  .addParam("arbiter", "Arbiter address", DEFAULT_ARBITER)
  .addParam("price", undefined, "0.0")
  .addParam("checksum", "Deliverable checksum", DEFAULT_CHECKSUM)
  .addParam("cid", "Deliverable IPFS CID", DEFAULT_DELIVERABLE_IPFS_CID)
  .addParam(
    "metadataCID",
    "Metadata IPFS CID",
    DEFAULT_METADATA_IPFS_CID,
    undefined,
    true
  )
  .setAction(async (args: any, hre: any) => {
    const signer = hre.ethers.provider.getSigner();

    const { price, arbiter, cid, checksum, metadataCID } = args;
    const buyer = args.buyer ?? (await signer.getAddress()); // default to signer address

    const { concordiaAddress } = config[hre.network.name];

    const contract = await getDeployedContract(
      hre,
      CONCORDIA,
      concordiaAddress
    );

    // address payable _buyer,
    // address payable _arbiter,
    // uint96 _price,
    // bytes32 _checksum,
    // string memory _ipfsWorkCID,
    // string memory _ipfsMetadataCID
    const checksumData = ethers.utils.arrayify("0x" + checksum);
    const tx = await contract
      .connect(signer)
      .create(
        buyer,
        arbiter,
        ethers.utils.parseEther(price),
        checksumData,
        cid,
        metadataCID
      );
    console.log("Transaction sent, waiting for it to be mined...");

    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);

    const concordCount = await contract.concordCount();
    console.log("res:", concordCount.toNumber());
  });
