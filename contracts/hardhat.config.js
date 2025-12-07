require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { ALFAJORES_RPC_URL, CELO_RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.24",
  networks: {
    alfajores: {
      url: ALFAJORES_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 44787,
    },
    celo: {
      url: CELO_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 42220,
    },
  },
};
