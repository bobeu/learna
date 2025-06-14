import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { Address, filterTransactionData, FunctionName, TransactionCallback } from '../utilities';
import useStorage from '../StorageContextProvider/useStorage';

export default function ClaimWeeklyReward({weekId, openDrawer, toggleDrawer }: claimProps) {
    const { chainId } = useAccount();
    const { setError, setmessage } = useStorage();
    const callback : TransactionCallback = (arg) => {
        if(arg.message) setmessage(arg.message);
        if(arg.errorMessage) setError(arg.errorMessage);
    }

    const { contractAddresses: ca, transactionData: td } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['claimWeeklyReward'],
            callback
        });

        return { ...filtered };
    }, [chainId, callback]);

    const getTransactions = React.useCallback(() => {
        let transactions = td.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: [weekId],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: txObject.requireArgUpdate
            };
            return transaction;
        })
        return transactions;
    
   }, [td, weekId]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            setDone={false}
        />
    )
}

type claimProps = {
    weekId: bigint;
    toggleDrawer: (arg:boolean) => void;
    openDrawer: boolean;
};