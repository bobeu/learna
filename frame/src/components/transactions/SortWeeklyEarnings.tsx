import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { Address, filterTransactionData, FunctionName, TransactionCallback } from '../utilities';
import useStorage from '../StorageContextProvider/useStorage';
import { zeroAddress } from 'viem';

export default function SortWeeklyReward({token, amountInERC20, owner, openDrawer, toggleDrawer }: SortWeeklyRewardProps) {
    const { chainId } = useAccount();
    const { setError, setmessage } = useStorage();
    const callback : TransactionCallback = (arg) => {
        if(arg.message) setmessage(arg.message);
        if(arg.errorMessage) setError(arg.errorMessage);
    }

    const { transactionData: td, args, contractAddress } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['sortWeeklyReward'],
            callback
        });

        const contractAddress = filtered.contractAddresses.Learna as Address;
        const args = [
            token? token : filtered.contractAddresses.GrowToken as Address, 
            owner? owner : zeroAddress, 
            amountInERC20
        ];

        return { ...filtered, args, contractAddress };
    }, [chainId, callback, token, amountInERC20, owner]);

    const getTransactions = React.useCallback(() => {
        let transactions = td.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args,
                contractAddress,
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
            displayMessage='Setting up weekly reward'
            setDone={false}
        />
    )
}

type SortWeeklyRewardProps = {
    token?: Address;
    owner?: Address;
    amountInERC20: bigint;
    toggleDrawer: (arg: number) => void;
    openDrawer: number;
};