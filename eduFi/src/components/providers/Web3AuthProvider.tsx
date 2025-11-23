'use client';

/* eslint-disable */
import React, { useEffect, useState } from "react";
import { http, WagmiProvider, useConnect, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APP_DESCRIPTION, APP_URL } from "@/lib/constants";
import { RainbowKitProvider, getDefaultConfig, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { celo, celoSepolia } from "wagmi/chains";
import DataProvider from "./DataProvider";
import { useTheme } from "next-themes";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const alchemy_celo_api = process.env.NEXT_PUBLIC_ALCHEMY_CELO_MAINNET_API as string;
const alchemy_celosepolia_api = process.env.NEXT_PUBLIC_ALCHEMY_CELO_SEPOLIA_API as string;

if (!projectId) throw new Error('Project ID is undefined');

// Create QueryClient instance outside component to prevent recreation and disconnections
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
//       refetchOnWindowFocus: false, // Prevent refetch on window focus
//       refetchOnReconnect: true,
//       retry: 1, // Reduce retry attempts
//     },
//     mutations: {
//       retry: 1,
//     },
//   },
// });

// Create config outside component to prevent recreation
const config = getDefaultConfig({
  appName: 'Learna',
  projectId,
  appIcon: 'https://learna.vercel.app/logo.png',
  appDescription: APP_DESCRIPTION,
  appUrl: APP_URL,
  chains: [celoSepolia, celo],
  ssr: true, // Enable SSR for better stability
  multiInjectedProviderDiscovery: true,
  pollingInterval: 10_000, // Increase from 10s to 30s to reduce frequency
  // syncConnectedChain: true,
  transports: {
    [celoSepolia.id]: http(alchemy_celosepolia_api),
    [celo.id]: http(alchemy_celo_api),
  },
});

// Custom hook for Coinbase Wallet detection and auto-connection
// function useCoinbaseWalletAutoConnect() {
//   const [isCoinbaseWallet, setIsCoinbaseWallet] = useState(false);
//   const { connect, connectors } = useConnect();
//   const { isConnected } = useAccount();

//   useEffect(() => {
//     // Check if we're running in Coinbase Wallet
//     const checkCoinbaseWallet = () => {
//       if (typeof window === 'undefined') return;
//       const isInCoinbaseWallet = window.ethereum?.isCoinbaseWallet || 
//         window.ethereum?.isCoinbaseWalletExtension ||
//         window.ethereum?.isCoinbaseWalletBrowser;
//       setIsCoinbaseWallet(!!isInCoinbaseWallet);
//     };
    
//     checkCoinbaseWallet();
//     window.addEventListener('ethereum#initialized', checkCoinbaseWallet);
    
//     return () => {
//       window.removeEventListener('ethereum#initialized', checkCoinbaseWallet);
//     };
//   }, []);

//   useEffect(() => {
//     // Auto-connect if in Coinbase Wallet and not already connected
//     if (isCoinbaseWallet && !isConnected && connectors.length > 1) {
//       // Only auto-connect if explicitly in Coinbase Wallet browser
//       const coinbaseConnector = connectors.find(c => 
//         c.name.toLowerCase().includes('coinbase')
//       );
//       if (coinbaseConnector) {
//         connect({ connector: coinbaseConnector });
//       }
//     }
//   }, [isCoinbaseWallet, isConnected, connect, connectors]);

//   return isCoinbaseWallet;
// }

// Wrapper component that provides Coinbase Wallet auto-connection
// function CoinbaseWalletAutoConnect({ children }: { children: React.ReactNode }) {
//   useCoinbaseWalletAutoConnect();
//   return <>{children}</>;
// }

// Themed RainbowKit Provider that adapts to light/dark mode
function ThemedRainbowKitProvider({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme to handle system theme preference
  const isDark = resolvedTheme === 'dark' || theme === 'dark';

  // Create theme based on current mode using project's primary color (#a7ff1f)
  const rainbowKitTheme = isDark
    ? darkTheme({
        accentColor: '#a7ff1f', // primary-500 - neon lime green
        accentColorForeground: '#0a0a0a', // blackish
        borderRadius: 'large',
        fontStack: 'system',
        overlayBlur: 'small',
      })
    : lightTheme({
        accentColor: '#a7ff1f', // primary-500 - neon lime green
        accentColorForeground: '#0a0a0a', // blackish
        borderRadius: 'large',
        fontStack: 'system',
        overlayBlur: 'small',
      });

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <RainbowKitProvider 
        coolMode={true}
        modalSize="compact" 
        theme={lightTheme({
          accentColor: '#a7ff1f',
          accentColorForeground: '#0a0a0a',
          borderRadius: 'large',
          fontStack: 'system',
          overlayBlur: 'small',
        })} 
        initialChain={celo.id} 
        showRecentTransactions={true}
        appInfo={{
          appName: "Learna",
          learnMoreUrl: 'https://learna.vercel.app'
        }}
      >
        {children}
      </RainbowKitProvider>
    );
  }

  return (
    <RainbowKitProvider 
      coolMode={true}
      modalSize="compact" 
      theme={rainbowKitTheme} 
      initialChain={celo.id} 
      showRecentTransactions={true}
      appInfo={{
        appName: "Learna",
        learnMoreUrl: 'https://learna.vercel.app'
      }}
    >
      {children}
    </RainbowKitProvider>
  );
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config as unknown as any}>
      <QueryClientProvider client={queryClient}>
        <ThemedRainbowKitProvider>
          {/* <CoinbaseWalletAutoConnect> */}
            <DataProvider>
              { children }
            </DataProvider>
          {/* </CoinbaseWalletAutoConnect> */}
        </ThemedRainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}



// import { Web3AuthProvider as MetamaskEmbeddedWalletProvider } from '@web3auth/modal/react';
// import web3AuthContextConfig from "../../configs/web3AuthConfig";

// export default function Web3AuthProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <MetamaskEmbeddedWalletProvider config={web3AuthContextConfig}>
//       { children }
//     </MetamaskEmbeddedWalletProvider>
//   )
// }