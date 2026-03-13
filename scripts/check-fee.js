// scripts/track-fees.js
async function main() {
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const USDC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    const contract = await ethers.getContractAt("CommerceCore", contractAddress);
    const usdc = await ethers.getContractAt("ERC20Mock", USDC_ADDRESS);
    
    const platformOwner = await contract.platformOwner();
    const feeBps = await contract.platformFeeBps();
    
    console.log("\n🏦 PLATFORM FEE TRACKER");
    console.log("════════════════════════");
    console.log(`Admin Wallet: ${platformOwner}`);
    console.log(`Fee: ${feeBps} bps (${Number(feeBps)/100}%)\n`);
    
    // Get all OrderCompleted events
    const filter = contract.filters.OrderCompleted();
    const events = await contract.queryFilter(filter);
    
    console.log(`📊 Total Completed Orders: ${events.length}\n`);
    
    let totalFees = 0;
    let totalVolume = 0;
    
    for (const event of events) {
        const orderId = event.args[0];
        const order = await contract.orders(orderId);
        const amount = Number(ethers.formatUnits(order[3], 9));
        const fee = (amount * Number(feeBps)) / 10000;
        
        totalVolume += amount;
        totalFees += fee;
        
        console.log(`Order #${orderId}:`);
        console.log(`   Amount: ${amount.toFixed(2)} USDC`);
        console.log(`   Fee (${Number(feeBps)/100}%): ${fee.toFixed(4)} USDC`);
        console.log(`   Seller gets: ${(amount - fee).toFixed(4)} USDC\n`);
    }
    
    console.log("════════════════════════");
    console.log(`📈 TOTAL VOLUME: ${totalVolume.toFixed(2)} USDC`);
    console.log(`💰 TOTAL FEES: ${totalFees.toFixed(4)} USDC`);
    console.log(`📊 AVG FEE RATE: ${((totalFees/totalVolume)*100).toFixed(2)}%`);
    
    // Current admin balance
    const adminBalance = await usdc.balanceOf(platformOwner);
    console.log(`\n💼 Current Admin Balance: ${ethers.formatUnits(adminBalance, 9)} USDC`);
}

main()
    .then(() => process.exit(0))
    .catch(console.error);