import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function getDeployedContract(
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  contractAddress: string
) {
  const contractFactory = await hre.ethers.getContractFactory(contractName);
  const contract = contractFactory.attach(contractAddress);
  return contract;
}
