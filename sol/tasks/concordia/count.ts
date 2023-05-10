import config from "../../../config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { CONCORDIA } from "../../src/consts";

task("concordiaConcordsCount", "Get concords count").setAction(
  async (args, hre) => {
    const { concordiaAddress } = config[hre.network.name];

    const contract = await getDeployedContract(
      hre,
      CONCORDIA,
      concordiaAddress
    );

    const concordCount = await contract.concordCount();
    console.log("res:", concordCount.toNumber());
  }
);
