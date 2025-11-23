// // Metamask Embedded Wallet or formerly Web3Auth

// import { type Web3AuthContextConfig } from '@web3auth/modal/react';
// import { WEB3AUTH_NETWORK, type Web3AuthOptions } from '@web3auth/modal';
// import { celo, celoSepolia } from "wagmi/chains";
// import { stringToHex } from "viem";

// // const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
// const alchemy_celo_api = process.env.NEXT_PUBLIC_ALCHEMY_CELO_MAINNET_API as string;
// const alchemy_celosepolia_api = process.env.NEXT_PUBLIC_ALCHEMY_CELO_SEPOLIA_API as string;

// const web3AuthOptions: Web3AuthOptions = {
//   clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string, // Pass your Web3Auth Client ID, ideally using an environment variable // Get your Client ID from Web3Auth Dashboard
//   web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
//   chains: [
//     {
//       chainId: stringToHex(celoSepolia.id.toString()),
//       chainNamespace: "eip155",
//       blockExplorerUrl: celoSepolia.blockExplorers?.default?.url,
//       logo: "https://sepolia.celoscan.io/images/logo.png",
//       tickerName: "CELO",
//       ticker: "CELO",
//       rpcTarget: alchemy_celosepolia_api,
//       fallbackRpcTargets: ["https://forno.celo-sepolia.celo-testnet.org"],
//       displayName: "Celo Sepolia",
//       isTestnet: true,
//       decimals: 18,
//       wsTarget: celoSepolia.rpcUrls.default.http[0],
//     }, 
//     {
//       chainId: stringToHex(celo.id.toString()),
//       chainNamespace: "eip155",
//       blockExplorerUrl: celo.blockExplorers?.default?.url,
//       logo: "https://celoscan.io/images/logo.png",
//       tickerName: "CELO",
//       ticker: "CELO",
//       rpcTarget: alchemy_celo_api,
//       fallbackRpcTargets: ["https://forno.celo.org"],
//       displayName: "Celo",
//       isTestnet: false,
//       decimals: 18,
//       wsTarget: celo.rpcUrls.default.http[0],
//     }, 
//   ]
// }
// //   web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET, // or WEB3AUTH_NETWORK.SAPPHIRE_DEVNET

// const web3AuthContextConfig: Web3AuthContextConfig = {
//   web3AuthOptions,
// }

// export default web3AuthContextConfig;