import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { Address, filterTransactionData, FunctionName } from '../utilities';
import useStorage from '../StorageContextProvider/useStorage';

export default function UnregisterUsersForWeeklyEarning({args, openDrawer, toggleDrawer }: RegisterUsersForWeeklyEarningProps) {
    const { chainId } = useAccount();
    const { getFunctions } = useStorage();
    const { callback } = getFunctions();

    const { contractAddresses: ca, transactionData: td } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['unregisterUsersForWeeklyEarning'],
            callback
        });

        return { ...filtered };
    }, [chainId, callback]);

    const getTransactions = React.useCallback(() => {
        let transactions = td.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args,
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
            setDone={false}
            lastStepInList='unregisterUsersForWeeklyEarning'
        />
    )
}

type RegisterUsersForWeeklyEarningProps = {
    unit: bigint;
    args: any[];
    toggleDrawer: (arg:boolean) => void;
    openDrawer: boolean;
};