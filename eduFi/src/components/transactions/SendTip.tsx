import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { Address, filterTransactionData, FunctionName } from '../utilities';
import useStorage from '../hooks/useStorage';

export default function SendTip({amount, openDrawer, toggleDrawer }: claimProps) {
    const { chainId } = useAccount();
    const { getFunctions } = useStorage();
    const { callback } = getFunctions();

    const { transactionData: td } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['tip'],
            callback
        });

        return { ...filtered };
    }, [chainId, callback]);

    const getTransactions = React.useCallback(() => {
        const transactions = td.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: [],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: txObject.requireArgUpdate,
                value: amount
            };
            return transaction;
        })
        return transactions;
    
   }, [td, amount]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            setDone={false}
            lastStepInList='tip'
        />
    )
}

type claimProps = {
    amount: bigint;
    toggleDrawer: (arg:boolean) => void;
    openDrawer: boolean;
};