"use client";

// import dynamic from "next/dynamic";
import type { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import { FrameProvider } from "~/components/providers/FrameProvider";
// import { SafeFarcasterSolanaProvider } from "~/components/providers/SafeFarcasterSolanaProvider";
import { WagmiProvider } from "wagmi";

// Remove
import { getDefaultConfig, RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { celoAlfajores, celo} from 'wagmi/chains';

  // Light theme configuration for RainbowKit wallet set up
  const theme = lightTheme(
    {
      ...lightTheme.accentColors.orange,
      accentColorForeground: '#fdba74',
      borderRadius: 'large',
      fontStack: 'system',
      overlayBlur: 'small',
      accentColor: '#2E3231'
    }
  );

// const WagmiProvider = dynamic(
//   () => import("~/components/providers/WagmiProvider"),
//   {
//     ssr: false,
//   }
// );

// Remove
const projectId = String(process.env.NEXT_PUBLIC_PROJECT_ID);
if (!projectId) throw new Error('Project ID is undefined');

const config = getDefaultConfig({
  appName: 'Learna',
  projectId,
  appIcon: '/favicon.ico',
  appDescription: 'Test',
  appUrl: 'https://localhost:3000',
  chains: [ celoAlfajores, celo ],
  ssr: true,
  multiInjectedProviderDiscovery: true,
  syncConnectedChain: true
});

export function Providers({ session, children }: { session: Session | null, children: React.ReactNode }) {
  // const solanaEndpoint = process.env.SOLANA_RPC_ENDPOINT || "https://solana-rpc.publicnode.com";
  return (
    <SessionProvider session={session}>
      <WagmiProvider config={config}>

      {/* Remove */}
      <QueryClientProvider client={new QueryClient()}>
        <RainbowKitProvider modalSize="compact" initialChain={celoAlfajores.id} showRecentTransactions={true}>

          {/* Retain */}
          <FrameProvider>
            {/* <SafeFarcasterSolanaProvider endpoint={solanaEndpoint}> */}
              {children}
            {/* </SafeFarcasterSolanaProvider> */}
          </FrameProvider>

        </RainbowKitProvider>
      </QueryClientProvider>


      </WagmiProvider>
    </SessionProvider>
  );
}


