
import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("DataVault");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("DataVault deployed to:", address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
