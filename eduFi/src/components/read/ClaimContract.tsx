import React from 'react';
import { useAccount, useBalance, useConfig, useReadContract } from 'wagmi';
import { filterTransactionData, formatValue } from '../utilities';
import { Address } from '../../../types/quiz';
import { Coins, Wallet } from 'lucide-react';
import AddressWrapper from '../peripherals/AddressFormatter/AddressWrapper';
import { Spinner } from '../peripherals/Spinner';

export default function ClaimContract() {
    const { chainId } = useAccount();
    const config = useConfig();

    const { claim, grotToken, args, abi } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['balanceOf']
        });
        const abi = filtered.transactionData[0].abi;
        const claim = filtered.contractAddresses.Claim as Address;
        const grotToken = filtered.contractAddresses.GrowToken as Address;
        const args = [claim];
        return { claim, grotToken, args, abi }
    }, [chainId]);

    const { data, isFetching, isLoading } = useBalance({
        address: claim,
        chainId,
        config
    });

    const { data: erc20, ...rest } = useReadContract({
        abi,
        address: grotToken,
        args,
        chainId,
        config,
        functionName: 'balanceOf',
        query: {
            enabled: !!grotToken,
        }
    });

    const erc20Balance = erc20 as bigint;

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
                                <div className="text-xs text-gray-600">Contract Address</div>
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
                    {
                        rest.isLoading || rest.isFetching ? <Spinner color='purple' /> :
                            <div className="glass-card rounded-xl p-4">
                                <div className="flex items-center justify-center mb-3">
                                    <Wallet className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="font-semibold text-gray-800 mb-1">
                                    <AddressWrapper account={grotToken} size={4} display/> 
                                </div>
                                <div className="text-xs text-gray-600">ERC20 Token in contract</div>
                            </div>
                    }

                    {
                        rest.isLoading || rest.isFetching ? <Spinner color='purple' /> :
                            <div className="glass-card rounded-xl p-4">
                                <div className="flex items-center justify-center mb-3">
                                    <Coins className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="font-semibold text-gray-800 mb-1">
                                    {formatValue(erc20Balance || 0n).toStr || '0'} 
                                </div>
                                <div className="text-xs text-gray-600">Balances in {`GROT`}</div>
                            </div>
                    }
                </div>
            </div>

        </div>
    )
}
