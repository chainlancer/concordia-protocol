import hre from "hardhat";

const main = async () => {
  //   const signers = hre.ethers.getSigners();
  const Chainlancer = await hre.ethers.getContractFactory("Chainlancer");
  const chainlancer = await Chainlancer.deploy(1000);
  await chainlancer.deployed();

  console.log("===============================");
  console.log("Chainlancer Addr: ", chainlancer.address);
  console.log("===============================");
  console.log("owner", await chainlancer.owner());
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export default {};
