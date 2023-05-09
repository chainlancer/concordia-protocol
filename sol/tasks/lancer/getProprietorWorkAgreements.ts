import config from "../../../config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { LANCER } from "../../src/consts";

task("lancerWorkAgreementsByProprietor", "Get Work Agreements by Proprietor")
  .addParam("address", "The address of the proprietor")
  .setAction(async (args, hre) => {
    const signer = hre.ethers.provider.getSigner();

    const { address } = args;
    const proprietor = address || signer.getAddress();

    const { lancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(hre, LANCER, lancerAddress);
    const contractConnection = contract.connect(signer);

    const workAgreementIds = await contractConnection.proprietorWorkAgreements(
      proprietor
    );
    console.log(workAgreementIds);

    const workAgreements = [];
    for (const id of workAgreementIds) {
      const agreement = await contractConnection.workAgreements(id);
      workAgreements.push(agreement);
    }

    console.log("work agreements: ", workAgreements);
  });
