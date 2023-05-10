import config from "../../../config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { CONCORDIA } from "../../src/consts";

task("concordiaBuyerConcords", "Get concords by buyer")
  .addParam("address", "Buyer address")
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

    const concordIds = await contractConnection.buyerConcords(client);
    const concords = [];

    for (const id of concordIds) {
      const agreement = await contractConnection.concords(id);
      concords.push(agreement);
    }
    console.log("res:", concords);
  });
