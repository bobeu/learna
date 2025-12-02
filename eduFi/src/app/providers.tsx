"use client";

import dynamic from "next/dynamic";
import { MiniAppProvider } from "@neynar/react";
import NeynaAppContext from "@/components/StorageContextProvider/AppContext";
import { ThemeProvider } from "next-themes";
import RouteTransitionOverlay from "@/components/RouteTransitionOverlay";
// import web3AuthContextConfig from "@/configs/web3AuthConfig";

const Web3AuthProvider = dynamic(
  () => import("@/components/providers/Web3AuthProvider"),
  { ssr: false }
);

export function Providers({ children } : {children: React.ReactNode}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {/* MiniAppProvider must wrap NeynarContextProvider for proper Farcaster miniapp support */}
      <MiniAppProvider analyticsEnabled={true}>
        {/* NeynarContextProvider handles Farcaster authentication in miniapp mode */}
        <NeynaAppContext>
          {/* Web3AuthProvider handles blockchain wallet connections (Wagmi/RainbowKit) */}
          {/* In miniapp mode: Neynar handles Farcaster auth, wallet is auto-provided */}
          {/* In web mode: Users explicitly connect via RainbowKit */}
          <Web3AuthProvider>
            {children}
            <RouteTransitionOverlay />
          </Web3AuthProvider>
        </NeynaAppContext>
      </MiniAppProvider>
    </ThemeProvider>
  );
}
