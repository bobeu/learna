import React from "react";
import { useAccount, useConfig, useConnect, useSwitchChain } from "wagmi";
import { celo } from "wagmi/chains";
import CustomButton from "../peripherals/CustomButton";

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
        <section id="connect" className="px-4 py-16 md:py-20 bg-gradient-to-br from-gray-50 to-cyan-50">
            {
                !isConnected && <div className="w-full font-mono">
                    {/* <h3>Connect any of the following wallets</h3> */}
                    <div className="w-full flex flex-col border p-4 rounded-lg gap-3">
                        {
                            (['Connect Farcaster', 'Use Coinbase Wallet', 'Use Metamask'] as const)
                            .map((item, index) => (
                                <CustomButton 
                                    onClick={() => handleConnect(index)}
                                    disabled={disabled}
                                    exit={false}
                                    key={index}
                                >
                                    <span>{ item }</span>
                                </CustomButton>

                            ))
                        }
                    </div>
                </div>
            }
        </section>
    )
}
            // <CustomButton>Connect Coinbase Wallet</CustomButton>
            // <CustomButton>Use Metamask</CustomButton>
            // <Button ></Button>
            // <Button {...buttonProps({onClick: () => handleConnect(1), disabled })}></Button>
            // <Button {...buttonProps({onClick: () => handleConnect(2), disabled })}></Button>