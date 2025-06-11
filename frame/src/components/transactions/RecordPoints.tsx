import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { Address, filterTransactionData, FunctionName, TransactionCallback } from '../utilities';
import useStorage from '../StorageContextProvider/useStorage';

export default function RecordPoints({openDrawer, toggleDrawer }: RecordPointsProps) {
    const { chainId, address } = useAccount();
    const { setError, setmessage, totalScore } = useStorage();
    
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
            console.log("txObject", txObject);
            const transaction : Transaction = {
                abi: txObject.abi,
                args: [address as Address, totalScore],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: false
            };
            return transaction;
        })
        return transactions;
    
   }, [td, totalScore, address]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            displayMessage='Saving your points'
            setDone={false}
        />
    )
}

type RecordPointsProps = {
    toggleDrawer: (arg: number) => void;
    openDrawer: number;
};