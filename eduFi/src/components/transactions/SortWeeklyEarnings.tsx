import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Address, FunctionName } from '../../../types/quiz';

export default function SortWeeklyReward({growTokenAmount, openDrawer, toggleDrawer }: SortWeeklyRewardProps) {
    const { chainId } = useAccount();
    const { callback } = useStorage();

    const { transactionData: td, args, contractAddress } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['sortWeeklyReward'],
            callback
        });

        const contractAddress = filtered.contractAddresses.LearnaV2 as Address;
        const args = [growTokenAmount];

        return { ...filtered, args, contractAddress };
    }, [chainId, callback, growTokenAmount]);

    const getTransactions = React.useCallback(() => {
        const transactions = td.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args,
                contractAddress,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: false
            };
            return transaction;
        })
        return transactions;
    
   }, [td, args, contractAddress]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            lastStepInList='sortWeeklyReward'
        />
    )
}

type SortWeeklyRewardProps = {
    growTokenAmount: bigint;
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
};