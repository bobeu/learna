import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Address, FunctionName } from '../../../types';
import { Hex } from 'viem';

export default function AdjustCampaignValues({erc20Values, nativeValues, openDrawer, campaignHash, toggleDrawer }: RegisterUsersForWeeklyEarningProps) {
    const { chainId } = useAccount();
    const { callback } = useStorage();

    const { transactionData: td } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['adjustCampaignValues'],
            callback
        });

        return { ...filtered };
    }, [chainId, callback]);

    const getTransactions = React.useCallback(() => {
        const transactions = td.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: [campaignHash, erc20Values, nativeValues],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: txObject.requireArgUpdate
            };
            return transaction;
        })
        return transactions;
    
   }, [td, campaignHash, erc20Values, nativeValues]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            lastStepInList='adjustCampaignValues'
        />
    )
}

type RegisterUsersForWeeklyEarningProps = {
    campaignHash: Hex;
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
    erc20Values: bigint[];
    nativeValues: bigint[];
};