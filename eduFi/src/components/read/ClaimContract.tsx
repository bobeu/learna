import React from 'react';
import { useAccount, useBalance, useConfig, useReadContracts } from 'wagmi';
import { filterTransactionData, formatAddr, formatValue } from '../utilities';
import { Address } from '../../../types/quiz';
import { Coins, Wallet } from 'lucide-react';
import AddressWrapper from '../peripherals/AddressFormatter/AddressWrapper';
import { Spinner } from '../peripherals/Spinner';

export default function ClaimContract({erc20InContract}: {erc20InContract: Address}) {
    const { chainId, isConnected, address } = useAccount();
    const config = useConfig();
    const account = formatAddr(address);

    const { claim, GrowToken, readTxObject } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['balanceOf', 'balanceOf']
        });
        // const abi = filtered.transactionData[0].abi;
        const claim = filtered.contractAddresses.Claim as Address;
        const GrowToken = filtered.contractAddresses.GrowToken as Address;
        const contractAddresses = [erc20InContract, GrowToken];
        const args = [[claim], [claim]];
        const readTxObject = filtered.transactionData.map((item, i) => {
            return{
                abi: item.abi,
                functionName: item.functionName,
                address: contractAddresses[i],
                args: args[i]
            }
        });
        return { claim, GrowToken, readTxObject }
    }, [chainId, erc20InContract]);

    const { data, isFetching, isLoading } = useBalance({
        address: claim,
        chainId,
        config
    });

    const { data: result } = useReadContracts({
        config,
        account,
        contracts: readTxObject,
        allowFailure: true,
        query: {
            enabled: !!isConnected,
            refetchOnReconnect: 'always', 
            refetchInterval: 5000,
        }
    });

    const erc20Balance = result?.[0].result as bigint;
    const GrowTokenBalance = result?.[1].result as bigint;

    return(
        <div className="space-y-4">
            <div className="text-lg text-left font-semibold text-gray-800 mb-2">Claim contract</div>
            <div className='space-y-4'>
                <div className="grid grid-cols-2 gap-2 md:gap-6 mb-8">
                    {
                        (isLoading || isFetching)? <Spinner color='purple' /> : 
                            <div className="glass-card rounded-xl p-4">
                                <div className="flex items-center justify-center mb-3">
                                    <Wallet className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="font-semibold text-gray-800 mb-1">
                                    <AddressWrapper account={claim} size={4} display/> 
                                </div>
                                <div className="text-xs text-gray-600">Claim CA</div>
                            </div>
                    }
                    {
                        (isLoading || isFetching)? <Spinner color='purple' /> : 
                            <div className="glass-card rounded-xl p-4">
                                <div className="flex items-center justify-center mb-3">
                                    <Coins className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="font-semibold text-gray-800 mb-1">
                                    {formatValue(data?.value || 0n).toStr || '0'} 
                                </div>
                                <div className="text-xs text-gray-600">Balances in ${data?.symbol}</div>
                            </div>
                    }
                </div>
                
                <div className="grid grid-cols-2 gap-2 md:gap-6 mb-8">
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Wallet className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="font-semibold text-gray-800 mb-1">
                            <AddressWrapper account={GrowToken} size={4} display/> 
                        </div>
                        <div className="text-xs text-gray-600">$KNOW contract</div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Coins className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="font-semibold text-gray-800 mb-1">
                            {formatValue(GrowTokenBalance || 0n).toStr || '0'} 
                        </div>
                        <div className="text-xs text-gray-600">Balances in {`KNOW Token`}</div>
                    </div>
                </div>
              
                <div className="grid grid-cols-2 gap-2 md:gap-6 mb-8">
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Wallet className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="font-semibold text-gray-800 mb-1">
                            <AddressWrapper account={erc20InContract} size={4} display/> 
                        </div>
                        <div className="text-xs text-gray-600">ERC20 Token in contract</div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Coins className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="font-semibold text-gray-800 mb-1">
                            {formatValue(erc20Balance || 0n).toStr || '0'} 
                        </div>
                        <div className="text-xs text-gray-600">Balances of funded ERC20 Tokens</div>
                    </div>
                </div>
            </div>

        </div>
    )
}
