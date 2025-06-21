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
        className: `w-full bg-cyan-500/50 font-mono ${overrideClassName}`,
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
                !isConnected && <div className="w-full place-items-center text-start mb-4 font-mono">
                    <h3 className="w-full  ">Connect any of the following wallets</h3>
                    <div className="w-full flex flex-col gap-[6px]">
                        <Button {...buttonProps({onClick: () => handleConnect(0), disabled })} >Farcaster wallet</Button>
                        <Button {...buttonProps({onClick: () => handleConnect(1), disabled })}>Coinbase Wallet</Button>
                        <Button {...buttonProps({onClick: () => handleConnect(2), disabled })}>Metamask</Button>
                    </div>
                </div>
            }
        </React.Fragment>
    )
}