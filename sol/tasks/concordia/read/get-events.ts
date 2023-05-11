import config from "../../../../config";
import { getDeployedContract } from "../../../src/utils";
import { task } from "hardhat/config";
import { CONCORDIA } from "../../../src/consts";

task("get-events", "Fetch historical events")
  .addParam("event", "The name of the event to fetch")
  .setAction(async (args, hre) => {
    const { event } = args;

    const { chainlinkTokenAddress, chainlinkOperatorAddress, chainlinkJobID } =
      config[hre.network.name];

    const { concordiaAddress } = config[hre.network.name];
    const contract = await getDeployedContract(
      hre,
      CONCORDIA,
      concordiaAddress
    );

    const eventFilter = contract.filters[event](); // Assuming the event has no indexed arguments

    const events = await contract.queryFilter(eventFilter, 0, "latest");
    console.log("res:", events);
  });
