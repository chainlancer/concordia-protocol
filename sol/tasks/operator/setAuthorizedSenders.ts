import config from "../../../config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { OPERATOR } from "../../src/consts";

task(
  "operatorSetAuthorizedSenders",
  "Set Chainlink Node Address as authorized sender"
)
  // .addParam("address", "Sender address", chainlinkNodeAddress)
  .setAction(async (args, hre) => {
    const signer = hre.ethers.provider.getSigner();

    const { chainlinkOperatorAddress, chainlinkNodeAddress } =
      config[hre.network.name];

    const contract = await getDeployedContract(
      hre,
      OPERATOR,
      chainlinkOperatorAddress
    );
    console.log(chainlinkNodeAddress);

    const tx = await contract
      .connect(signer)
      .setAuthorizedSenders(chainlinkNodeAddress);
    console.log("Transaction sent, waiting for it to be mined...");

    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);
  });
