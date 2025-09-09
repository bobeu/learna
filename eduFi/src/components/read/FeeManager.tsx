import React from 'react';
import { useAccount, useBalance, useConfig } from 'wagmi';
import { filterTransactionData, formatValue } from '../utilities';
import { Address } from '../../../types';
import { Coins, Wallet } from 'lucide-react';
import AddressWrapper from '../peripherals/AddressFormatter/AddressWrapper';
import { Spinner } from '../peripherals/Spinner';

export default function FeeManager() {
    const { chainId } = useAccount();
    const config = useConfig();

    const feeManager = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: false,
        });
        return filtered.contractAddresses.FeeManager as Address;
    }, [chainId]);

    const { data, isFetching, isLoading } = useBalance({
        address: feeManager,
        chainId,
        config,
        query: {
            enabled: !!feeManager,
        }
    });

    return(
        <div className="space-y-4">
            <div className="text-lg text-left font-semibold text-gray-800 mb-2">Fee Manager</div>
            <div className="grid grid-cols-2 gap-2 md:gap-6 mb-8">
                {
                    (isLoading || isFetching)? <Spinner color='purple' /> : 
                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-center mb-3">
                                <Wallet className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="font-semibold text-gray-800 mb-1">
                                <AddressWrapper account={feeManager} size={4} display/> 
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
                            <div className="text-xs text-gray-600">Balances in {`${data?.symbol}`}</div>
                        </div>
                }
            </div>
        </div>
    )
}
