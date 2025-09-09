/* eslint-disable */

import React from 'react';
import { Confirmation } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Address, FunctionName } from '../../../types';

export default function Pause({openDrawer, toggleDrawer }: SetMiniTokenProps) {
    const { chainId } = useAccount();
    const { callback } = useStorage();

    const { mutate, setupArgs } = React.useMemo(() => {
        const mutate = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['pause'],
            callback
        });
        
        const setupArgs : any[] = [];

        return { mutate, setupArgs, };

    }, [chainId, callback]);

    const getTransactions = React.useCallback(() => {
        const transactions = mutate.transactionData.map((txObject) => {
            return {
                abi: txObject.abi,
                args: setupArgs,
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: txObject.requireArgUpdate,
            };
        })
        return transactions;
    
   }, [setupArgs, mutate]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            lastStepInList='pause'
        />
    )
}

interface SetMiniTokenProps {
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
};