const hre = require("hardhat");

async function main() {
  const AtlasSupplyChain = await hre.ethers.getContractFactory("AtlasSupplyChain");
  const contract = await AtlasSupplyChain.deploy();
  await contract.waitForDeployment();

  console.log("AtlasSupplyChain deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
