import config from "../../../../config";
import { getDeployedContract } from "../../../src/utils";
import { task } from "hardhat/config";
import { CONCORDIA } from "../../../src/consts";

task("get-concord-by-id", "Get concords by id")
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

    const concord = await contract.connect(signer).concords(id);
    console.log("res:", concord);
  });
