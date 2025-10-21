'use client';

/* eslint-disable */
import React, { useEffect, useState } from "react";
import { http, WagmiProvider, useConnect, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APP_DESCRIPTION, APP_URL } from "@/lib/constants";
import { RainbowKitProvider, getDefaultConfig, lightTheme, } from "@rainbow-me/rainbowkit";
import { celo, celoSepolia } from "wagmi/chains";
import DataProvider from "./DataProvider";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const alchemy_celo_api = process.env.NEXT_PUBLIC_ALCHEMY_CELO_MAINNET_API as string;
const alchemy_celosepolia_api = process.env.NEXT_PUBLIC_ALCHEMY_CELO_SEPOLIA_API as string;

if (!projectId) throw new Error('Project ID is undefined');

// Custom hook for Coinbase Wallet detection and auto-connection
function useCoinbaseWalletAutoConnect() {
  const [isCoinbaseWallet, setIsCoinbaseWallet] = useState(false);
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    // Check if we're running in Coinbase Wallet
    const checkCoinbaseWallet = () => {
      const isInCoinbaseWallet = window.ethereum?.isCoinbaseWallet || 
        window.ethereum?.isCoinbaseWalletExtension ||
        window.ethereum?.isCoinbaseWalletBrowser;
      setIsCoinbaseWallet(!!isInCoinbaseWallet);
    };
    
    checkCoinbaseWallet();
    window.addEventListener('ethereum#initialized', checkCoinbaseWallet);
    
    return () => {
      window.removeEventListener('ethereum#initialized', checkCoinbaseWallet);
    };
  }, []);

  useEffect(() => {
    // Auto-connect if in Coinbase Wallet and not already connected
    if (isCoinbaseWallet && !isConnected) {
      connect({ connector: connectors[1] }); // Coinbase Wallet connector
    }
  }, [isCoinbaseWallet, isConnected, connect, connectors]);

  return isCoinbaseWallet;
}

// Wrapper component that provides Coinbase Wallet auto-connection
function CoinbaseWalletAutoConnect({ children }: { children: React.ReactNode }) {
  useCoinbaseWalletAutoConnect();
  return <>{children}</>;
}

export default function Provider({ children }: { children: React.ReactNode }) {
  // Load the default config from RainbowKit
  const config = getDefaultConfig({
    appName: 'Learna',
    projectId,
    appIcon: 'https://learna.vercel.app/logo.png',
    appDescription: APP_DESCRIPTION,
    appUrl: APP_URL,
    chains: [celoSepolia, celo],
    // ssr: true,
    // multiInjectedProviderDiscovery: true,
    pollingInterval: 10_000,
    syncConnectedChain: true,
    transports: {
      [celoSepolia.id]: http(alchemy_celosepolia_api),
      [celo.id]: http(alchemy_celo_api),
    },
  });

  // Light theme configuration for RainbowKit wallet set up
  const theme = lightTheme(
    {
      ...lightTheme.accentColors.purple,
      accentColorForeground: '#0f1113',
      borderRadius: 'large',
      fontStack: 'system',
      overlayBlur: 'small',
      accentColor: '#fff'
    }
  );
  
  return (
    <WagmiProvider config={config as unknown as any} >
      <QueryClientProvider client={new QueryClient()}>
        <RainbowKitProvider 
          coolMode={true}
          modalSize="compact" 
          theme={theme} 
          initialChain={celo.id} 
          showRecentTransactions={true}
          appInfo={{
            appName: "Learna",
            learnMoreUrl: 'https://learna.vercel.app'
          }}
        >
          <CoinbaseWalletAutoConnect>
            <DataProvider>
              { children }
            </DataProvider>
          </CoinbaseWalletAutoConnect>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
