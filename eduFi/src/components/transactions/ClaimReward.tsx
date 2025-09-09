import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Address, FunctionName } from '../../../types';

export default function ClaimReward({openDrawer, toggleDrawer, campaignName }: claimProps) {
    const { chainId } = useAccount();
    const { callback } = useStorage();

    const { transactionData: td, args } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['claimReward'],
            callback
        });
        const args = [[campaignName]];

        return { ...filtered,args };
    }, [chainId, callback, campaignName]);

    const getTransactions = React.useCallback(() => {
        const transactions = td.map((txObject, index) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: args[index],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: txObject.requireArgUpdate
            };
            return transaction;
        })
        return transactions;
    
   }, [td, args]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            lastStepInList='claimReward'
        />
    )
}

type claimProps = {
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
    campaignName: string;
};