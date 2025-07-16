/* eslint-disable */
import React, { useEffect, useState } from "react";
import { createConfig, http, useAccount, useConnect, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame as miniAppConnector } from "@farcaster/frame-wagmi-connector";
import { coinbaseWallet, metaMask, walletConnect, injected } from 'wagmi/connectors';
import { APP_DESCRIPTION, APP_ICON_URL, APP_NAME, APP_URL } from "~/lib/constants";
import { RainbowKitProvider, lightTheme, } from "@rainbow-me/rainbowkit";
// import { 
//   // frameWallet, 
//   // braveWallet, 
//   metaMaskWallet, 
//   // rabbyWallet, 
//   rainbowWallet, 
//   trustWallet, 
//   valoraWallet,
//   walletConnectWallet
// } from "@rainbow-me/rainbowkit/wallets";
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

// [celoAlfajores.id]: http(),
export const config = createConfig({
  chains: [celo],
  transports: {
    [celo.id]: http(),
  },
  
  connectors: [
    miniAppConnector(),
    walletConnect({
      projectId,
      name: APP_NAME,
      metadata: {
        description: String(APP_DESCRIPTION),
        icons: [String(APP_ICON_URL)],
        name: APP_NAME,
        url: APP_URL
      }
    }),
    coinbaseWallet({
      appName: APP_NAME,
      appLogoUrl: APP_ICON_URL,
      preference: 'all',
    }),
    metaMask({
      dappMetadata: {
        name: APP_NAME,
        url: APP_URL,
      },
    }),
    injected({target: 'metaMask'})
  ],
  // ssr: true,
  syncConnectedChain: true
});

// Wrapper component that provides Coinbase Wallet auto-connection
function CoinbaseWalletAutoConnect({ children }: { children: React.ReactNode }) {
  useCoinbaseWalletAutoConnect();
  return <>{children}</>;
}

export default function Provider({ children }: { children: React.ReactNode }) {
  // Load the defaut config from RainbowKit
  // const config = getDefaultConfig({
  //   appName: 'Educaster',
  //   projectId,
  //   appIcon: '/favicon-32x32.png',
  //   appDescription: APP_DESCRIPTION,
  //   appUrl: APP_URL,
  //   chains: [ celoAlfajores, celo ],
  //   ssr: true,
  //   multiInjectedProviderDiscovery: true,
  //   pollingInterval: 10_000,
  //   syncConnectedChain: true,
  //   transports: {
  //     [celoAlfajores.id]: http(),
  //     [celo.id]: http(),
  //   },
  // });
  // [
  //   miniAppConnector(),
  //   coinbaseWallet({
  //     appName: APP_NAME,
  //     appLogoUrl: APP_ICON_URL,
  //     preference: 'all',
  //   }),
  //   metaMask({
  //     dappMetadata: {
  //       name: APP_NAME,
  //       url: APP_URL,
  //     },
  //   }),
  // ],

//   const connectors = connectorsForWallets(
//     [
//       {
//         groupName: 'Recommended',
//         wallets: [metaMaskWallet, rainbowWallet]
//       },
//       {
//         groupName: 'Others',
//         wallets: [walletConnectWallet, trustWallet, valoraWallet]
//       }
//     ],
//     {
//       projectId,
//       appName: 'Educaster',
//       appDescription: APP_DESCRIPTION,
//       appIcon: '/favicon-32x32.png',
//       appUrl: APP_URL
//     }
//   );

//   const config = createConfig({
//     chains: [celoAlfajores, celo],
//     transports: {
//       [celoAlfajores.id]: http(),
//       [celo.id]: http(),
//     },
//   connectors,
//   ssr: true,
//   // pollingInterval: 10_000,
//   syncConnectedChain: true
// });
  
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
        <RainbowKitProvider modalSize="compact" theme={theme} initialChain={celo.id} showRecentTransactions={true}>
          <CoinbaseWalletAutoConnect>
            { children }
          </CoinbaseWalletAutoConnect>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}