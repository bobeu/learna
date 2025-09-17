"use client";

import React from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./button";
import { Wallet, User } from "lucide-react";

interface WalletConnectButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  showUserInfo?: boolean;
}

export default function WalletConnectButton({ 
  variant = "default", 
  size = "default", 
  className = "",
  showUserInfo = false
}: WalletConnectButtonProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          return (
            <Button variant={variant} size={size} className={className} disabled>
              <Wallet className="w-4 h-4 mr-2" />
              Loading...
            </Button>
          );
        }

        if (!connected) {
          return (
            <Button 
              variant={variant} 
              size={size} 
              className={className}
              onClick={openConnectModal}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button 
              variant="destructive" 
              size={size} 
              className={className}
              onClick={openChainModal}
            >
              Wrong Network
            </Button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openChainModal}
              className="flex items-center gap-2"
            >
              {chain.hasIcon && (
                <div
                  style={{
                    background: chain.iconBackground,
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    overflow: "hidden",
                    marginRight: 4,
                  }}
                >
                  {chain.iconUrl && (
                    <img
                      alt={chain.name ?? "Chain icon"}
                      src={chain.iconUrl}
                      style={{ width: 12, height: 12 }}
                    />
                  )}
                </div>
              )}
              {chain.name}
            </Button>

            <Button
              variant={variant}
              size={size}
              className={className}
              onClick={openAccountModal}
            >
              {showUserInfo ? (
                <>
                  <User className="w-4 h-4 mr-2" />
                  {account.displayName}
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  {account.displayName}
                </>
              )}
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
