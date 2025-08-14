/* eslint-disable */
import React, { useEffect, useState } from "react";
import { http, useAccount, useConnect, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APP_DESCRIPTION, APP_URL } from "~/lib/constants";
import { RainbowKitProvider, getDefaultConfig, lightTheme, } from "@rainbow-me/rainbowkit";
import { celoAlfajores, celo } from 'wagmi/chains';

// Your walletconnect project Id
const projectId = String(process.env.NEXT_PUBLIC_PROJECT_ID);

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
  // Load the defaut config from RainbowKit
  const config = getDefaultConfig({
    appName: 'Educaster',
    projectId,
    appIcon: 'https://learna.vercel.app/favicon-32x32.png',
    appDescription: APP_DESCRIPTION,
    appUrl: APP_URL,
    chains: [ celoAlfajores, celo ],
    ssr: true,
    multiInjectedProviderDiscovery: true,
    pollingInterval: 10_000,
    syncConnectedChain: true,
    transports: {
      [celoAlfajores.id]: http(),
      [celo.id]: http(),
    },
  });

  // Light theme configuration for RainbowKit wallet set up
  const theme = lightTheme(
    {
      ...lightTheme.accentColors.purple,
      accentColorForeground: '#a855f7',
      borderRadius: 'large',
      fontStack: 'system',
      overlayBlur: 'small',
      accentColor: '#fff'
    }
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <RainbowKitProvider 
          coolMode={true}
          modalSize="compact" 
          theme={theme} 
          // initialChain={celo.id} 
          showRecentTransactions={true}
          appInfo={{
            appName: "Educaster",
            learnMoreUrl: 'https://learna.vercel.app'
          }}
        >
          <CoinbaseWalletAutoConnect>
            { children }
          </CoinbaseWalletAutoConnect>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}