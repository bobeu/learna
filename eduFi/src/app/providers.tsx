"use client";

import dynamic from "next/dynamic";
import { MiniAppProvider } from "@neynar/react";
import NeynaAppContext from "@/components/StorageContextProvider/AppContext";
import { ThemeProvider } from "next-themes";
import RouteTransitionOverlay from "@/components/RouteTransitionOverlay";

const WagmiProvider = dynamic(
  () => import("@/components/providers/WagmiProvider"),
  {
    ssr: false,
  }
);

export function Providers({ children } : {children: React.ReactNode}) {
  return (
    <WagmiProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        <MiniAppProvider analyticsEnabled={true}>
          <NeynaAppContext>
            {children}
            <RouteTransitionOverlay />
          </NeynaAppContext>
        </MiniAppProvider>
      </ThemeProvider>
    </WagmiProvider>
  );
}
