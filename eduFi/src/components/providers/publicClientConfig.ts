/* eslint-disable */
// import { privateKeyToAccount } from 'viem/accounts';
import { celo, celoSepolia } from 'viem/chains';
import { Client, createPublicClient, http } from 'viem';

const alchemy_celo_api = process.env.NEXT_PUBLIC_ALCHEMY_CELO_MAINNET_API as string;
const alchemy_celosepolia_api = process.env.NEXT_PUBLIC_ALCHEMY_CELO_SEPOLIA_API as string;

// Create public client for Celo Sepolia (default/testnet)
export const publicClientCeloSepolia : Client = createPublicClient({
  chain: celoSepolia,
  transport: http(alchemy_celosepolia_api || celoSepolia.rpcUrls.default.http[0])
});

// Create public client for Celo Mainnet
export const publicClientCelo : Client = createPublicClient({
  chain: celo,
  transport: http(alchemy_celo_api || celo.rpcUrls.default.http[0]),
});

// Helper function to get the appropriate public client based on chain ID
export function getPublicClient(chainId?: number) : Client {
  if (chainId === celo.id) {
    return publicClientCelo;
  }
  // Default to celoSepolia
  return publicClientCeloSepolia;
}

