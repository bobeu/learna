import type { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox-viem";
import { config as dotconfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomiclabs/hardhat-web3";
import "@nomicfoundation/hardhat-viem";
import { zeroAddress } from "viem";

dotconfig();
const PRIVATE_KEY = process.env.PRIVATE_KEY_CROSS_0xD7c;
const API_KEY = process.env.ALCHEMY_API_KEY;

const config: HardhatUserConfig = {
  
  networks: {
    crosstestnet: {
      // url: "https://rpc.testnet.ms",  // Not working
      url: `https://crossfi-testnet.g.alchemy.com/v2/${API_KEY}`, // Good
      accounts: [`${PRIVATE_KEY}`],
      chainId: 4157,
    },
    crossfimainnet: {
      // url: "https://rpc.testnet.ms",  // Not working
      url: `https://crossfi-mainnet.g.alchemy.com/v2/${API_KEY}`, // Good
      accounts: [`${PRIVATE_KEY}`],
      chainId: 4158,
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [`${PRIVATE_KEY}`],
      chainId: 44787,
    },
    celo: {
      accounts: [`${PRIVATE_KEY}`],
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
      4157: `privatekey://${PRIVATE_KEY}`,
      4158: `privatekey://${PRIVATE_KEY}`,
      44787: `privatekey://${PRIVATE_KEY}`,
      42220: `privatekey://${PRIVATE_KEY}`,
    },
    feeTo: {
      default: 0,
      4157: `privatekey://${PRIVATE_KEY}`,
      4158: `privatekey://${PRIVATE_KEY}`,
      44787: `privatekey://${PRIVATE_KEY}`,
      42220: `privatekey://${PRIVATE_KEY}`
    },
    // cUSD || xUSD
    baseContributionAsset: {
      default: zeroAddress,
      4157: zeroAddress,
      4158: zeroAddress,
      44787: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
      42220: "0x765de816845861e75a25fca122bb6898b8b1282a"
    },
    linkToken: {
      4157: zeroAddress,
      4158: zeroAddress,
      44787: '0x32E08557B14FaD8908025619797221281D439071',
      42220: '0xd07294e6E917e07dfDcee882dd1e2565085C2ae0',
    },
    oracle: {
      default: zeroAddress,
      4157: '0x859e221ada7cebdf5d4040bf6a2b8959c05a4233',
      4158: '',
      44787: zeroAddress // For testing only, we set to zeroAddress so the contract could switch to using local value.
      // 44787: '0x022F9dCC73C5Fb43F2b4eF2EF9ad3eDD1D853946'  // Chainlink oracle on Celo alfajores
    }
  },

  solidity: {
    version: "0.8.24",
    settings: {          // See the solidity docs for advice about optimization and evmVersion
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'constantinople',
      // viaIR: true
      }
    },
};

export default config;
