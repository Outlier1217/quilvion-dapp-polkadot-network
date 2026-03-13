// scripts/check-order.js
async function main() {
    const orderId = process.argv[2] || 8; // Default to 6 if not provided
    
    console.log(`\n🔍 Checking Order #${orderId}...\n`);
    
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const USDC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    const contract = await ethers.getContractAt("CommerceCore", contractAddress);
    const usdc = await ethers.getContractAt("ERC20Mock", USDC_ADDRESS);
    
    // Get order
    const order = await contract.orders(orderId);
    
    // Status mapping
    const statusMap = {
        0: "ESCROW_HOLD 🔒",
        1: "REFUND_REQUESTED ❓",
        2: "DISPUTED ⚠️",
        3: "COMPLETED ✅",
        4: "REFUNDED ↩️",
        5: "CANCELLED ❌"
    };
    
    const productTypeMap = {
        0: "DIGITAL 💻",
        1: "PHYSICAL 📦"
    };
    
    console.log("📋 ORDER SUMMARY");
    console.log("══════════════════");
    console.log(`Order ID:     ${order[0]}`);
    console.log(`Buyer:        ${order[1]}`);
    console.log(`Seller:       ${order[2]}`);
    console.log(`Amount:       ${ethers.formatUnits(order[3], 6)} USDC`);
    console.log(`Product Type: ${productTypeMap[order[4]] || "UNKNOWN"}`);
    console.log(`Status:       ${statusMap[order[5]] || "UNKNOWN"} (${order[5]})`);
    console.log(`Created At:   Block #${order[6]}`);
    console.log(`Risk Score:   ${order[7]}/100`);
    
    // Check if money is still in contract
    if (order[5] == 0) { // ESCROW_HOLD
        const contractBalance = await usdc.balanceOf(contractAddress);
        console.log(`\n💰 Contract USDC Balance: ${ethers.formatUnits(contractBalance, 8)} USDC`);
    }
    
    // Check seller balance
    const sellerBalance = await usdc.balanceOf(order[2]);
    console.log(`👤 Seller USDC Balance: ${ethers.formatUnits(sellerBalance, 8)} USDC`);
    
    // Check buyer balance
    const buyerBalance = await usdc.balanceOf(order[1]);
    console.log(`👤 Buyer USDC Balance: ${ethers.formatUnits(buyerBalance, 8)} USDC`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });