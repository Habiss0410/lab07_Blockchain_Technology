const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying ClassBadge with account:", deployer.address);

  const Badge = await hre.ethers.getContractFactory("ClassBadge");
  const badge = await Badge.deploy(deployer.address);
  await badge.waitForDeployment();

  const badgeAddress = await badge.getAddress();
  console.log("ClassBadge deployed to:", badgeAddress);

  // Mint luôn Badge #0 cho chính bạn
  const tx = await badge.mint(deployer.address, "Phạm Thu Hà");
  await tx.wait();
  console.log("Minted Badge #0 for Phạm Thu Hà successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});