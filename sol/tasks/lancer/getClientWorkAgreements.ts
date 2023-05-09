import config from "../../../config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { LANCER } from "../../src/consts";

task("lancerClientGetWorkAgreements", "Get Work Agreements by Client")
  .addParam("address", "The address of the client")
  .setAction(async (args, hre) => {
    const signer = hre.ethers.provider.getSigner();

    const { address } = args;
    const client = address || (await signer.getAddress());
    console.log(client);

    const { lancerAddress } = config[hre.network.name];

    const contract = await getDeployedContract(hre, LANCER, lancerAddress);
    const contractConnection = contract.connect(signer);

    const workAgreementIds = await contractConnection.getClientWorkAgreements(
      client
    );
    const workAgreements = [];

    for (const id of workAgreementIds) {
      const agreement = await contractConnection.workAgreements(id);
      workAgreements.push(agreement);
    }
    console.log("work agreements: ", workAgreements);
  });
