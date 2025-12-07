const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const stable = process.env.STABLE_TOKEN_ADDRESS;
  if (!stable) throw new Error("Missing STABLE_TOKEN_ADDRESS in .env");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", await deployer.getAddress());

  const Payroll = await hre.ethers.getContractFactory("Payroll");
  const payroll = await Payroll.deploy(stable);
  await payroll.waitForDeployment();
  const addr = await payroll.getAddress();
  console.log("Payroll deployed to:", addr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
