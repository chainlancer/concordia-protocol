import hre from "hardhat";
import { ethers } from "hardhat";
import config from "../../src/config";
import { getDeployedContract } from "../../src/utils";

const EVENT_NAME = "WorkAgreementDecryptionKeyUpdateFailed";

const main = async () => {
  const { chainlinkTokenAddress, chainlinkOperatorAddress, chainlinkJobID } =
    config[hre.network.name];

  const { chainlancerAddress } = config[hre.network.name];
  const contract = await getDeployedContract(
    hre,
    "Chainlancer",
    chainlancerAddress
  );

  const eventFilter = contract.filters[EVENT_NAME](); // Assuming the event has no indexed arguments

  const events = await contract.queryFilter(eventFilter, 0, "latest");
  console.log("Historical events:", events);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export default {};
