import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData } from '../utilities';
import { Address, FunctionName } from '../../../types/quiz';
import { Hex } from 'viem';

export default function RecordPoints({openDrawer, toggleDrawer, campaignHashes }: RecordPointsProps) {
    const { chainId, address } = useAccount();

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
                args: [address, [], ca.GrowToken, campaignHashes],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: false
            };
            return transaction;
        })
        return transactions;
    
   }, [td, ca, campaignHashes]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
        />
    )
}

type RecordPointsProps = {
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
    campaignHashes: Hex[];
};