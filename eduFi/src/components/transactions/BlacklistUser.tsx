import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Address, FunctionName } from '../../../types/quiz';
import { Hex } from 'viem';

export default function BlacklistUser({user, openDrawer, campaignHash, toggleDrawer }: RegisterUsersForWeeklyEarningProps) {
    const { chainId } = useAccount();
    const { callback } = useStorage();

    const { transactionData: td } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['banUserFromCampaign'],
            callback
        });

        return { ...filtered };
    }, [chainId, callback]);

    const getTransactions = React.useCallback(() => {
        const transactions = td.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: [[user], [campaignHash]],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: txObject.requireArgUpdate
            };
            return transaction;
        })
        return transactions;
    
   }, [td, user, campaignHash]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            lastStepInList='banUserFromCampaign'
        />
    )
}

type RegisterUsersForWeeklyEarningProps = {
    user: Address;
    campaignHash: Hex;
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
};