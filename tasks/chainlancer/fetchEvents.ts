import config from "../../src/config";
import { getDeployedContract } from "../../src/utils";
import { task } from "hardhat/config";
import { CHAINLANCER } from "./consts";

task("chainlancerFetchEvents", "Fetch historical events")
  .addParam("eventname", "The name of the event to fetch")
  .setAction(async (args, hre) => {
    const { eventname } = args;

    const { chainlinkTokenAddress, chainlinkOperatorAddress, chainlinkJobID } =
      config[hre.network.name];

    const { chainlancerAddress } = config[hre.network.name];
    const contract = await getDeployedContract(
      hre,
      CHAINLANCER,
      chainlancerAddress
    );

    const eventFilter = contract.filters[eventname](); // Assuming the event has no indexed arguments

    const events = await contract.queryFilter(eventFilter, 0, "latest");
    console.log("Historical events:", events);
  });
