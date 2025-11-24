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
      <Web3AuthProvider>
        <MiniAppProvider analyticsEnabled={true}>
          <NeynaAppContext>
            {children}
            <RouteTransitionOverlay />
          </NeynaAppContext>
        </MiniAppProvider>
      </Web3AuthProvider>
    </ThemeProvider>
  );
}
