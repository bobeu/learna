import type { HardhatUserConfig } from "hardhat/config";
import { config as dotconfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomiclabs/hardhat-web3";
import "@nomicfoundation/hardhat-viem";

dotconfig();
const PRIVATE_KEY = process.env.PRIVATE_KEY_CROSS_0xD7c;
const PRIVATE_KEY_MAINNET = process.env.PRIVATE_KEY_MAIN_0xa1f;
// const API_KEY = process.env.ALCHEMY_API_KEY;

const config: HardhatUserConfig = {
  
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [`${PRIVATE_KEY}`],
      chainId: 44787,
    },
    celo: {
      accounts: [`${PRIVATE_KEY_MAINNET}`],
      url: 'https://forno.celo.org',
    },
  },
  etherscan: {
    apiKey: {
      alfajores: process.env.CELOSCAN_API_KEY ?? '',
      celo: process.env.CELOSCAN_API_KEY ?? '',
    },
    customChains: [
      {
        chainId: 44_787,
        network: 'alfajores',
        urls: {
          apiURL: 'https://api-alfajores.celoscan.io/api',
          browserURL: 'https://alfajores.celoscan.io',
        },
      },
      {
        chainId: 42_220,
        network: 'celo',
        urls: {
          apiURL: 'https://api.celoscan.io/api',
          browserURL: 'https://celoscan.io/',
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      44787: `privatekey://${PRIVATE_KEY}`,
      42220: `privatekey://${PRIVATE_KEY_MAINNET}`,
    },
    reserve: {
      default: 1,
      44787: `privatekey://${PRIVATE_KEY}`,
      42220: `privatekey://${PRIVATE_KEY_MAINNET}`
    },
    identityVerificationHub: {
      default: 2,
      44787: '0x68c931C9a534D37aa78094877F46fE46a49F1A51',
      42220: '0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF'
    },
    routeTo: {
      default: 3,
      44787: `privatekey://${process.env.PRIVATE_KEY_0xC0F as string}`,
      42220: `privatekey://${process.env.PRIVATE_KEY_ROUTE_0x84F as string}`
    },
    admin: {
      default: 4,
      44787: `privatekey://${process.env.PRIVATE_KEY_0xC0F as string}`,
      42220: `privatekey://${process.env.PRIVATE_KEY_0xC0F as string}`
    },
    admin2: {
      default: 5,
      44787: `privatekey://${process.env.PRIVATE_KEY_CROSS_0xD7c as string}`,
      42220: `privatekey://${process.env.PRIVATE_KEY_CROSS_0xD7c as string}`
    }
  },

  solidity: {
    version: "0.8.28",
    settings: {          // See the solidity docs for advice about optimization and evmVersion
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'constantinople',
      }
    },
};

export default config;
