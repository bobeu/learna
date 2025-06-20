import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { Address, filterTransactionData, FunctionName } from '../utilities';

export default function RecordPoints({openDrawer, totalScore, toggleDrawer }: RecordPointsProps) {
    const { chainId, address } = useAccount();

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
            // console.log("txObject", txObject);
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
            setDone={false}
            lastStepInList='recordPoints'
            // back={callback}
        />
    )
}

type RecordPointsProps = {
    toggleDrawer: (arg:boolean) => void;
    // callback?: () => void
    openDrawer: boolean;
    totalScore: number;
};