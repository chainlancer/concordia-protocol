import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function getDeployedContract(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  contractAddress: string
) {
  const MyContract = await hre.ethers.getContractFactory(contractName);
  const contract = MyContract.attach(contractAddress);
  return contract;
}
