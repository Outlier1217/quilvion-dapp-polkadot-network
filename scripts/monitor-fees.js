// scripts/monitor-fees.js
async function main() {
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const USDC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    const contract = await ethers.getContractAt("CommerceCore", contractAddress);
    const usdc = await ethers.getContractAt("ERC20Mock", USDC_ADDRESS);
    
    const admin = await contract.platformOwner();
    const feeBps = await contract.platformFeeBps();
    
    console.log("\n📊 FEE MONITORING (Press Ctrl+C to stop)\n");
    
    // Listen for OrderCompleted events
    contract.on("OrderCompleted", async (orderId, event) => {
        const order = await contract.orders(orderId);
        const amount = ethers.formatUnits(order[3], 6);
        const fee = (amount * Number(feeBps)) / 10000;
        
        console.log(`\n🎯 Order #${orderId} Completed!`);
        console.log(`   Amount: ${amount} USDC`);
        console.log(`   Fee (${Number(feeBps)/100}%): ${fee.toFixed(4)} USDC`);
        console.log(`   Seller gets: ${(amount - fee).toFixed(4)} USDC`);
        
        // Show updated balances
        const adminBalance = await usdc.balanceOf(admin);
        console.log(`   💼 Admin Total: ${ethers.formatUnits(adminBalance, 6)} USDC`);
    });
    
    // Keep running
    await new Promise(() => {});
}

main();