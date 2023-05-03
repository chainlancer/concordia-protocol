import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("test", "Test tasks").setAction(async (args, hre) => {
  console.log("here");
});
