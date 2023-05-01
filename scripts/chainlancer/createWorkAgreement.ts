import hre from "hardhat";
import { ethers } from "hardhat";
import addresses from "../../src/addresses";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getDeployedContract } from "../../src/utils";

// function createWorkAgreement
// bytes32 _checksum,
// uint256 _price,
// address payable _client,
// address payable _verifier,
// string memory _ipfsCID
async function main() {
  const signer = hre.ethers.provider.getSigner();

  const network = hre.network.name;
  const {
    chainlancer: chainlancerContractAddress,
    chainlinkNode: chainlinkNodeAddress,
  } = addresses[network];

  const contract = await getDeployedContract(
    hre,
    "Chainlancer",
    chainlancerContractAddress
  );

  const checksum = ethers.utils.formatBytes32String("0x1234");
  const price = ethers.utils.parseEther("0.0");
  const client = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const verifier = "0x0000000000000000000000000000000000000000";
  const cid = "QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi";
  const tx = await contract
    .connect(signer)
    .createWorkAgreement(checksum, price, client, verifier, cid);
  console.log("Transaction sent, waiting for it to be mined...");

  const receipt = await tx.wait();
  console.log("Transaction mined:", receipt.transactionHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
