import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Address, FunctionName } from '../../../types/quiz';

export default function VerifyByWallet({openDrawer, toggleDrawer }: SetClaimProp) {
    const { chainId } = useAccount();
    const { callback } = useStorage();

    const { transactionData: td } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['verify'],
            callback
        });
        // console.log("filtered", filtered);
        return { ...filtered };
    }, [chainId, callback]);

    const getTransactions = React.useCallback(() => {
        const transactions = td.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: [],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: txObject.requireArgUpdate
            };
            return transaction;
        })
        return transactions;
    
   }, [td]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            lastStepInList='verify'
        />
    )
}

type SetClaimProp = {
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
};