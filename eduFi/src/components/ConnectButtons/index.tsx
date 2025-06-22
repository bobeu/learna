import React from "react";
import { useAccount, useConfig, useConnect, useSwitchChain } from "wagmi";
import { Button } from "../ui/button";
import { celo } from "wagmi/chains";

interface ButtonProps {
    onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
    className: string | undefined;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
    disabled?: boolean;
}

// Return encapsulated button attributes
export const  buttonProps = ({onClick, overrideClassName, disabled} : {onClick: React.MouseEventHandler<HTMLButtonElement> | undefined, disabled?: boolean, overrideClassName?: string}) : ButtonProps => {
    return {
        onClick,
        className: `w-full bg-cyan-500/80 font-mono ${overrideClassName}`,
        variant: 'outline',
        disabled: disabled && disabled
    }
} 

export default function ConnectButtons() {
    const { connectAsync, connectors } = useConnect();
    const { isConnected, isConnecting, isReconnecting } = useAccount();
    const config = useConfig();
    const { switchChainAsync } = useSwitchChain({config});
    const disabled = isConnecting || isReconnecting;
    
    // Handle Wallet Connection request
    const handleConnect = async(connectorId: number) => {
        const connector = connectors[connectorId];
        const result = await connectAsync({connector});
        if(result.chainId !== celo.id) {
            const res = await switchChainAsync({
                chainId: celo.id, 
                connector,
            });
            console.log("Switched to ", res.name)
        }
    }

    return(
        <React.Fragment>
            {
                !isConnected && <div className="w-full space-y-2 font-mono">
                    {/* <h3>Connect any of the following wallets</h3> */}
                    <div className="w-full flex flex-col border rounded-lg p-4">
                        <Button {...buttonProps({onClick: () => handleConnect(0), disabled })}>Connect Farcaster wallet</Button>
                        <Button {...buttonProps({onClick: () => handleConnect(1), disabled })}>Connect Coinbase Wallet</Button>
                        <Button {...buttonProps({onClick: () => handleConnect(2), disabled })}>Use Metamask</Button>
                    </div>
                </div>
            }
        </React.Fragment>
    )
}