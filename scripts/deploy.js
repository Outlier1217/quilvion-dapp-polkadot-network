const { ethers } = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log("=================================");
  console.log("Deploying contracts with account:");
  console.log(deployer.address);
  console.log("=================================");

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account Balance:", ethers.formatEther(balance));

  // Deploy Mock USDC
  console.log("\nDeploying Mock USDC...");

  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");

  const usdc = await ERC20Mock.deploy(
    "Mock USDC",
    "USDC",
    deployer.address,
    ethers.parseUnits("1000000", 6)
  );

  await usdc.waitForDeployment();

  console.log("USDC deployed to:", usdc.target);

  // Deploy CommerceCore
  console.log("\nDeploying CommerceCore...");

  const CommerceCore = await ethers.getContractFactory("CommerceCore");

  const commerce = await CommerceCore.deploy(
    usdc.target,
    ethers.ZeroAddress
  );

  await commerce.waitForDeployment();

  console.log("CommerceCore deployed to:", commerce.target);

  console.log("\n=================================");
  console.log("Deployment Completed Successfully");
  console.log("=================================");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});