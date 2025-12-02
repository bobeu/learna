/* eslint-disable */
"use client";

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme } from 'next-themes';

{/* Navigation */}
export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === 'dark';

    return(
      <nav className="w-full sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-black/90 backdrop-blur-sm px-4 md:px-7">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16 md:h-20">
          {/* <div className="flex justify-between items-center w-14 h-14 border border-primary-500 rounded-full"> */}
            <img 
              src="/logo.png" 
              alt="Learna Logo" 
              className="object-contain w-14 h-14 md:w-16 md:h-16"
            />
          {/* </div> */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 md:p-2.5"
            >
              {isDark? <Sun className="w-4 h-4 md:w-5 md:h-5 text-primary-500" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
            </Button>
            {/* Desktop: Show full ConnectButton */}
            <div className="hidden md:block">
              <ConnectButton />
            </div>
            {/* Mobile: Show compact version with chain icon only */}
            <div className="md:hidden">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  // openChainModal,
                  openConnectModal,
                  mounted,
                }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;

                  if(!ready) {
                    return (
                      <Button variant="outline" size="sm" className="p-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                        {'Mounting...'}
                      </Button>
                    );
                  }

                  if(!connected) {
                    return (
                      <Button variant="outline" size="sm" className="p-2 border-primary-500 hover:bg-primary-200 dark:border-primary-500 dark:text-primary-500 dark:hover:bg-primary-500 dark:hover:text-black" onClick={openConnectModal}>
                        <span className="text-sm font-medium text-primary-600 dark:text-white hover:text-primary-600 dark:hover:text-primary-200">Connect</span>
                      </Button>
                    );
                  }

                  return (
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500"
                      onClick={openAccountModal}
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            overflow: "hidden",
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              style={{ width: 20, height: 20 }}
                            />
                          )}
                        </div>
                      )}
                    </Button>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
      </nav>
    );
}
