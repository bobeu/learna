import React from 'react';
import { Confirmation } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Address, FunctionName } from '../../../types/quiz';

export default function SetAdmin({openDrawer, admin, toggleDrawer }: SetAdminProps) {
    const { chainId } = useAccount();
    const { callback } = useStorage();

    const { mutate, setupArgs } = React.useMemo(() => {
        const mutate = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['setAdmin'],
            callback
        });
        
        const setupArgs = [admin];

        return { mutate, setupArgs, };

    }, [chainId, admin, callback]);

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
            lastStepInList='setAdmin'
        />
    )
}

interface SetAdminProps {
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
    admin: Address;
};