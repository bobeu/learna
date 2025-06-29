import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { Address, filterTransactionData, FunctionName } from '../utilities';
import useStorage from '../hooks/useStorage';
import { zeroAddress } from 'viem';

export default function SortWeeklyReward({token, amountInERC20, owner, openDrawer, toggleDrawer }: SortWeeklyRewardProps) {
    const { chainId } = useAccount();
    const { callback } = useStorage();

    const { transactionData: td, args, contractAddress } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['sortWeeklyReward'],
            callback
        });

        const contractAddress = filtered.contractAddresses.Learna as Address;
        const growToken = filtered.contractAddresses.GrowToken as Address;
        const args = [
            token? token === zeroAddress? growToken : token : growToken, 
            owner? owner : zeroAddress, 
            amountInERC20
        ];

        return { ...filtered, args, contractAddress };
    }, [chainId, callback, token, amountInERC20, owner]);

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
        />
    )
}

type SortWeeklyRewardProps = {
    token?: Address;
    owner?: Address;
    amountInERC20: bigint;
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
};