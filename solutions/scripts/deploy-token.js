const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying ClassToken with account:", deployer.address);

  const Token = await hre.ethers.getContractFactory("ClassToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("ClassToken deployed to:", tokenAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});