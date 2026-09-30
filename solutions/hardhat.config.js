require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
    },
  },
  networks: {
    trustkeys: {
      url: "https://l1testnet.trustkeys.network",
      chainId: 11968,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};