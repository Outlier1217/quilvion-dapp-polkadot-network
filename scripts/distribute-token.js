const hre = require("hardhat");

async function main() {

  console.log("🚀 Distributing USDCMock tokens...\n");

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deployer:", deployer.address);

  const USDC_ADDRESS =
  "0x84b6a3e3a7ffE62D339524d7C678c252aBD2d4b0";

  const usdc = await hre.ethers.getContractAt(
    "ERC20Mock",
    USDC_ADDRESS
  );

  const wallets = [

    "0xAb06a17af1425F499E302B639c69f8ce29a967E0",
    "0x528C4B8aCf320F312c298CBdA60Acb15D198Ba52",
    "0xbB7266164241E249DD7EcaD53ED59474015685eA"

  ];

  const amount = hre.ethers.parseUnits("2000",6);

  for(const wallet of wallets){

    console.log(`Sending 2000 USDC → ${wallet}`);

    const tx = await usdc.transfer(
      wallet,
      amount
    );

    await tx.wait();

    console.log("✅ Sent");

  }

  console.log("\n🎉 Distribution complete");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});