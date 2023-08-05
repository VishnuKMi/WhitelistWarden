require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config({ path: '.env' })

const INFURA_HTTP_URL = process.env.INFURA_HTTP_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.18',
  networks: {
    sepolia: {
      url: INFURA_HTTP_URL,
      accounts: [PRIVATE_KEY]
    }
  }
}
