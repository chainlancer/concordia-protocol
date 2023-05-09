import config from "../../../config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { LANCER } from "../../src/consts";

task("lancerWorkAgreements", "Get a work agreement by ID")
  .addParam("id", "The ID of the work agreement")
  .setAction(async (args, hre) => {
    const { id } = args;

    const signer = hre.ethers.provider.getSigner();

    const { lancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(hre, LANCER, lancerAddress);

    const workAgreement = await contract.connect(signer).workAgreements(id);
    console.log("work agreement: ", workAgreement);
  });
