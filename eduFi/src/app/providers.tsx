"use client";

import dynamic from "next/dynamic";
import { MiniAppProvider } from "@neynar/react";
import NeynaAppContext from "@/components/StorageContextProvider/AppContext";

const WagmiProvider = dynamic(
  () => import("@/components/providers/WagmiProvider"),
  {
    ssr: false,
  }
);

export function Providers({ children } : {children: React.ReactNode}) {
  return (
    <WagmiProvider>
      <MiniAppProvider analyticsEnabled={true}>
        <NeynaAppContext>
          {children}
        </NeynaAppContext>
      </MiniAppProvider>
    </WagmiProvider>
  );
}
