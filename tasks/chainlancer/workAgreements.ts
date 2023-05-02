import config from "../../src/config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { CHAINLANCER } from "./consts";

task("chainlancerWorkAgreements", "Get a work agreement by ID")
  .addParam("wid", "The ID of the work agreement")
  .setAction(async (args, hre) => {
    const { wid } = args;

    const signer = hre.ethers.provider.getSigner();

    const { chainlancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(
      hre,
      CHAINLANCER,
      chainlancerAddress
    );

    const workAgreement = await contract.connect(signer).workAgreements(wid);
    console.log("work agreement: ", workAgreement);
  });
