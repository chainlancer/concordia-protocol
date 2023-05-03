import config from "../../../config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { LANCER } from "../../src/consts";

task("lancerWorkAgreementCount", "Get a work agreement by ID").setAction(
  async (args, hre) => {
    const { lancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(hre, LANCER, lancerAddress);

    const workAgreementCount = await contract.workAgreementCount();
    console.log("work agreement count: ", workAgreementCount.toNumber());
  }
);
