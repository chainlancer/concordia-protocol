import config from "../../src/config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { CHAINLANCER } from "./consts";

task("chainlancerWorkAgreementCount", "Get a work agreement by ID").setAction(
  async (args, hre) => {
    const { chainlancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(
      hre,
      CHAINLANCER,
      chainlancerAddress
    );

    const workAgreementCount = await contract.workAgreementCount();
    console.log("work agreement count: ", workAgreementCount.toNumber());
  }
);
