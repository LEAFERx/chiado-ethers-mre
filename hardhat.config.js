require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    chiado: {
      url: "https://rpc.chiado.gnosis.gateway.fm",
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    },
  },
};
