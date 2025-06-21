// "use client";

// import type { Session } from "next-auth"
// import { SessionProvider } from "next-auth/react"
// import { FrameProvider } from "~/components/providers/FrameProvider";
// import WagmiProviderWrapper from "~/components/providers/WagmiProvider";

// // 
// import { MiniAppProvider } from "@neynar/react";

// // import { http, createConfig } from 'wagmi';
// // import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector';
// // import { celoAlfajores, celo} from 'wagmi/chains';

// // const wagmiConfig = createConfig({
// //   chains: [celoAlfajores, celo],
// //   transports: {
// //     [celoAlfajores.id]: http(),
// //     [celo.id]: http(),
// //   },
// //   connectors: [
// //     miniAppConnector()
// //     // add other wallet connectors like metamask or coinbase wallet if desired
// //   ]
// // });


//   // Light theme configuration for RainbowKit wallet set up
//   // const theme = lightTheme(
//   //   {
//   //     ...lightTheme.accentColors.orange,
//   //     accentColorForeground: '#fdba74',
//   //     borderRadius: 'large',
//   //     fontStack: 'system',
//   //     overlayBlur: 'small',
//   //     accentColor: '#2E3231'
//   //   }
//   // );

// // const WagmiProvider = dynamic(
// //   () => import("~/components/providers/WagmiProvider"),
// //   {
// //     ssr: false,
// //   }
// // );

// // // Remove
// // const projectId = String(process.env.NEXT_PUBLIC_PROJECT_ID);
// // if (!projectId) throw new Error('Project ID is undefined');

// // const config = getDefaultConfig({
// //   appName: 'Learna',
// //   projectId,
// //   appIcon: '/favicon.ico',
// //   appDescription: 'Test',
// //   appUrl: 'https://localhost:3000',
// //   chains: [ celoAlfajores, celo ],
// //   ssr: true,
// //   multiInjectedProviderDiscovery: true,
// //   syncConnectedChain: true
// // });

// export function Providers({ session, children }: { session: Session | null, children: React.ReactNode }) {
//   return (
//     <SessionProvider session={session}>
//       <WagmiProviderWrapper>
//         <FrameProvider>
//           {children}
//         </FrameProvider>
//       </WagmiProviderWrapper>
//     </SessionProvider>
//   );
// }


// // {/* Remove */}
// // <QueryClientProvider client={new QueryClient()}>
// //   <RainbowKitProvider modalSize="compact" initialChain={celoAlfajores.id} showRecentTransactions={true}>
// // const solanaEndpoint = process.env.SOLANA_RPC_ENDPOINT || "https://solana-rpc.publicnode.com";

      
//       //   </RainbowKitProvider>
//       // </QueryClientProvider>
//       {/* <SafeFarcasterSolanaProvider endpoint={solanaEndpoint}> */}
//       {/* </SafeFarcasterSolanaProvider> */}


// export function MinAppProvider() {

//   return (
    
//   )
// }


"use client";

import dynamic from "next/dynamic";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { MiniAppProvider } from "@neynar/react";
import NeynaAppContext from "~/components/StorageContextProvider/AppContext";
// import { SafeFarcasterSolanaProvider } from "~/components/providers/SafeFarcasterSolanaProvider";

const WagmiProvider = dynamic(
  () => import("~/components/providers/WagmiProvider"),
  {
    ssr: false,
  }
);

export function Providers({ children } : {children: React.ReactNode}) {
  return (
    <NeynaAppContext>
      <WagmiProvider>
        <MiniAppProvider analyticsEnabled={true}>
          {children}
        </MiniAppProvider>
      </WagmiProvider>
    </NeynaAppContext>
  );
}

    // <SessionProvider session={session}>
    // </SessionProvider>
// const solanaEndpoint = process.env.SOLANA_RPC_ENDPOINT || "https://solana-rpc.publicnode.com";
          // <SafeFarcasterSolanaProvider endpoint={solanaEndpoint}>
          // </SafeFarcasterSolanaProvider>
          // { session, children }: { session: Session | null, children: React.ReactNode }
