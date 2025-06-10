import React from 'react';
import { Confirmation, type Transaction } from '../ActionButton/Confirmation';
import { useAccount } from 'wagmi';
import { Address, filterTransactionData, FunctionName, TransactionCallback } from '../utilities';
import useStorage from '../StorageContextProvider/useStorage';

export default function RecordPoints({points, openDrawer, toggleDrawer }: RecordPointsProps) {
    const { chainId, address } = useAccount();
    const { setError, setmessage } = useStorage();
    
    const callback : TransactionCallback = (arg) => {
        if(arg.message) setmessage(arg.message);
        if(arg.errorMessage) setError(arg.errorMessage);
    }

    const { transactionData: td } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['recordPoints'],
            callback
        });

        return { ...filtered };
    }, [chainId, callback]);

    const getTransactions = React.useCallback(() => {
        let transactions = td.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: [address as Address, points],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: txObject.requireArgUpdate
            };
            return transaction;
        })
        return transactions;
    
   }, [td, points]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            displayMessage='Saving your points'
            lastStepInList='recordPoints'
        />
    )
}

type RecordPointsProps = {
    points: number;
    toggleDrawer: (arg: number) => void;
    openDrawer: number;
};