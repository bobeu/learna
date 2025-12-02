'use client';

/* eslint-disable */
import React, { useEffect, useState } from "react";
import { http, useAccount, useConnect, WagmiProvider } from "wagmi";
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

// Helper function to detect Farcaster context
function isFarcasterContext(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  
  return (
    userAgent.includes('farcaster') ||
    urlParams.has('farcaster') ||
    urlParams.get('mode') === 'farcaster' ||
    (window as any).farcaster !== undefined ||
    (window as any).parent?.farcaster !== undefined
  );
}

// Custom hook for Coinbase Wallet and Farcaster detection and auto-connection
function useCoinbaseWalletAutoConnect() {
  const [isCoinbaseWallet, setIsCoinbaseWallet] = useState(false);
  const [isFarcaster, setIsFarcaster] = useState(false);
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
    
    // Check if we're in Farcaster context
    const checkFarcaster = () => {
      setIsFarcaster(isFarcasterContext());
    };
    
    checkCoinbaseWallet();
    checkFarcaster();
    
    window.addEventListener('ethereum#initialized', checkCoinbaseWallet);
    
    // Re-check Farcaster context periodically in case it loads asynchronously
    // Limit to 10 checks (5 seconds total) to avoid running indefinitely
    let farcasterCheckCount = 0;
    const maxFarcasterChecks = 10;
    const farcasterCheckInterval = setInterval(() => {
      farcasterCheckCount++;
      checkFarcaster();
      if (farcasterCheckCount >= maxFarcasterChecks) {
        clearInterval(farcasterCheckInterval);
      }
    }, 500);
    
    return () => {
      window.removeEventListener('ethereum#initialized', checkCoinbaseWallet);
      clearInterval(farcasterCheckInterval);
    };
  }, []);

  useEffect(() => {
    // Auto-connect if in Coinbase Wallet or Farcaster context and not already connected
    if (!isConnected && connectors.length > 0) {
      if (isCoinbaseWallet) {
        // Auto-connect to Coinbase Wallet connector (typically index 1)
        const coinbaseConnector = connectors.find(
          (connector) => connector.id === 'coinbaseWallet' || connector.id === 'coinbaseWalletSDK'
        ) || connectors[1];
        if (coinbaseConnector) {
          connect({ connector: coinbaseConnector });
        }
      } else if (isFarcaster) {
        // Auto-connect to the first available connector in Farcaster context
        // Typically this would be injected provider or Coinbase Wallet
        const farcasterConnector = connectors.find(
          (connector) => connector.id === 'coinbaseWallet' || connector.id === 'coinbaseWalletSDK'
        ) || connectors[0];
        if (farcasterConnector) {
          connect({ connector: farcasterConnector });
        }
      }
    }
  }, [isCoinbaseWallet, isFarcaster, isConnected, connect, connectors]);

  return { isCoinbaseWallet, isFarcaster };
}

// Wrapper component that provides Coinbase Wallet auto-connection
function CoinbaseWalletAutoConnect({ children }: { children: React.ReactNode }) {
  useCoinbaseWalletAutoConnect();
  return <>{children}</>;
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config as unknown as any}>
      <QueryClientProvider client={queryClient}>
        <ThemedRainbowKitProvider>
          <CoinbaseWalletAutoConnect>
            <DataProvider>
              { children }
            </DataProvider>
          </CoinbaseWalletAutoConnect>
        </ThemedRainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
