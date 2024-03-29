import config from "../../../../config";
import { getDeployedContract } from "../../../src/utils";
import { task } from "hardhat/config";
import { CONCORDIA } from "../../../src/consts";

task("get-concords-by-proposer", "Get concords by proposer")
  .addParam("address", "Proposer address", undefined, undefined, true)
  .setAction(async (args, hre) => {
    const signer = hre.ethers.provider.getSigner();

    const { address } = args;
    const client = address || (await signer.getAddress());
    console.log(client);

    const { concordiaAddress } = config[hre.network.name];

    const contract = await getDeployedContract(
      hre,
      CONCORDIA,
      concordiaAddress
    );
    const contractConnection = contract.connect(signer);

    const concordIds = await contractConnection.proposerConcordIds(client);
    const concords = [];

    for (const id of concordIds) {
      const agreement = await contractConnection.concords(id);
      concords.push(agreement);
    }
    console.log("res:", concords);
  });
