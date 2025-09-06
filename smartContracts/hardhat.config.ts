import type { HardhatUserConfig } from "hardhat/config";
import { config as dotconfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomiclabs/hardhat-web3";
import "@nomicfoundation/hardhat-viem";

dotconfig();

const config: HardhatUserConfig = {
  
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [`${process.env.PRIVATE_0xD7c}`],
      chainId: 44787,
    },
    sepolia: {
      url: "https://forno.celo-sepolia.celo-testnet.org",
      accounts: [`${process.env.PRIVATE_0xD7c}`],
      chainId: 11_142220,
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [`${process.env.PRIVATE_MAIN_0xa1f}`],
      chainId: 8453,
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [`${process.env.PRIVATE_MAIN_0xa1f}`],
      chainId: 84532,
    },
    celo: {
      accounts: [`${process.env.PRIVATE_MAIN_0xa1f}`],
      // url: 'https://celo.drpc.org',
      url: 'https://forno.celo.org',
      chainId: 42220,
    }
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
        chainId: 11_142220,
        network: 'sepolia',
        urls: {
          apiURL: 'https://forno.celo-sepolia.celo-testnet.org',
          browserURL: 'https://sepolia.celoscan.io',
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
      44787: `privatekey://${process.env.PRIVATE_0xD7c}`,
      11142220: `privatekey://${process.env.PRIVATE_0xD7c}`,
      42220: `privatekey://${process.env.PRIVATE_farc}`,
    },
    recorder: {
      default: 0,
      44787: `privatekey://${process.env.PRIVATE_0xC0F as string}`,
      11142220: `privatekey://${process.env.PRIVATE_0xC0F as string}`,
      42220: `privatekey://${process.env.PRIVATE_0xC0F as string}`
    },
    reserve: {
      default: 7,
      44787: `privatekey://${process.env.PRIVATE_0xD7c}`,
      11142220: `privatekey://${process.env.PRIVATE_0xD7c}`,
      42220: `privatekey://${process.env.PRIVATE_MAIN_0xa1f}`
    },
    identityVerificationHub: {
      default: 8,
      44787: '0x68c931C9a534D37aa78094877F46fE46a49F1A51',
      11142220: '0x68c931C9a534D37aa78094877F46fE46a49F1A51', ///
      42220: '0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF'
    },
    admin: {
      default: 1,
      44787: `privatekey://${process.env.PRIVATE_0xC0F as string}`,
      11142220: `privatekey://${process.env.PRIVATE_0xC0F as string}`,
      42220: `privatekey://${process.env.PRIVATE_0xC0F as string}`
    },
    admin2: {
      default: 2,
      44787: `privatekey://${process.env.PRIVATE_0xD7c as string}`,
      11142220: `privatekey://${process.env.PRIVATE_0xD7c as string}`,
      42220: `privatekey://${process.env.PRIVATE_0xD7c as string}`
    },
    admin3: {
      default: 3,
      44787: `privatekey://${process.env.PRIVATE_farc as string}`,
      11142220: `privatekey://${process.env.PRIVATE_farc as string}`,
      42220: `privatekey://${process.env.PRIVATE_farc as string}`
    },
    admin4: {
      default: 3,
      44787: `privatekey://${process.env.PRIVATE_MAIN_0xa1f as string}`,
      11142220: `privatekey://${process.env.PRIVATE_0xD7c as string}`,
      42220: `privatekey://${process.env.PRIVATE_MAIN_0xa1f as string}`
    },
    dev: {
      default: 3,
      44787: `privatekey://${process.env.PRIVATE_MAIN_0xa1f as string}`,
      11142220: `privatekey://${process.env.PRIVATE_0xD7c as string}`,
      42220: `privatekey://${process.env.PRIVATE_MAIN_0xa1f as string}`
    },
    routeTo: {
      default: 3,
      44787: `privatekey://${process.env.PRIVATE_0x84F as string}`,
      11142220: `privatekey://${process.env.PRIVATE_0x84F as string}`,
      42220: `privatekey://${process.env.PRIVATE_0x84F as string}`
    },
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
