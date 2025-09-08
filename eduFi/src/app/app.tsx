"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { JetBrains_Mono, Inter } from "next/font/google";

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// note: dynamic import is required for components that use the Frame SDK
const NewLandingPage = dynamic(() => import("@/components/landingPage/NewLandingPage"), {
  ssr: false,
  loading: () => (
      <div className="h-screen relative w-full flex items-center justify-center text-sm font-mono">
        <h3 className="py-12 p-5 text-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white animate-bounce-gentle">
          <p className="animate-ping">Loading...</p>
        </h3>
      </div>
    ),
});

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className={`${mono.variable} ${inter.variable} font-sans`}>
        <NewLandingPage />
      </div>
    </ThemeProvider>
  );
}