import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { Address, filterTransactionData, FunctionName } from '../utilities';

export default function RecordPoints({openDrawer, toggleDrawer }: RecordPointsProps) {
    const { chainId } = useAccount();

    const { transactionData: td } = React.useMemo(() => {
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
                args: [],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: false
            };
            return transaction;
        })
        return transactions;
    
   }, [td]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
        />
    )
}

type RecordPointsProps = {
    toggleDrawer: (arg:boolean) => void;
    openDrawer: boolean;
};