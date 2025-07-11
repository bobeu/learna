/* eslint-disable */
import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData, formatAddr } from '../utilities';
import { Address, FunctionName } from '../../../types/quiz';
import { Hex } from 'viem';

export default function RecordPoints({openDrawer, toggleDrawer, campaignHash }: RecordPointsProps) {
    const { chainId, address } = useAccount();
    const account = formatAddr(address);

    const { transactionData: td, contractAddresses: ca } = React.useMemo(() => {
        const filtered = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['recordPoints']
        });
        return { ...filtered };
    }, [chainId]);

    const getTransactions = React.useCallback(() => {
        const transactions = td.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: [account, [], ca.GrowToken, campaignHash],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: false
            };
            return transaction;
        })
        return transactions;
    
   }, [td, ca, account, campaignHash]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            lastStepInList='recordPoints'
        />
    )
}

type RecordPointsProps = {
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
    campaignHash: Hex;
};