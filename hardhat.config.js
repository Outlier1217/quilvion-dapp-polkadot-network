require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.20",

  networks: {

    polkadot_hub_testnet: {
      url: "https://services.polkadothub-rpc.com/testnet",
      accounts: [PRIVATE_KEY],
      chainId: 420420417
    }

  }
};