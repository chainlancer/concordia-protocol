import config from "../../../config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { LANCER } from "../../src/consts";

task("lancerFetchEvents", "Fetch historical events")
  .addParam("eventname", "The name of the event to fetch")
  .setAction(async (args, hre) => {
    const { eventname } = args;

    const { chainlinkTokenAddress, chainlinkOperatorAddress, chainlinkJobID } =
      config[hre.network.name];

    const { lancerAddress } = config[hre.network.name];
    const contract = await getDeployedContract(hre, LANCER, lancerAddress);

    const eventFilter = contract.filters[eventname](); // Assuming the event has no indexed arguments

    const events = await contract.queryFilter(eventFilter, 0, "latest");
    console.log("Historical events:", events);
  });