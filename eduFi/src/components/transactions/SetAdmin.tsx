import React from 'react';
import { Confirmation } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Address, FunctionName } from '../../../types/quiz';

export default function SetAdmin({openDrawer, admin, toggleDrawer }: SetAdminProps) {
    const { chainId } = useAccount();
    const { callback } = useStorage();

    const { mutate, setupArgs, contractAddresses } = React.useMemo(() => {
        const mutate = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['setPermission'],
            callback
        });
        
        const setupArgs = [admin];
        const contractAddresses = [mutate.contractAddresses.LearnaV2 as Address];

        return { mutate, setupArgs, contractAddresses };

    }, [chainId, admin, callback]);

    const getTransactions = React.useCallback(() => {
        const transactions = mutate.transactionData.map((txObject, index) => {
            return {
                abi: txObject.abi,
                args: setupArgs,
                contractAddress: contractAddresses[index],
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: txObject.requireArgUpdate,
            };
        })
        return transactions;
    
   }, [setupArgs, mutate, contractAddresses]);

    return(
        <Confirmation 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            getTransactions={getTransactions}
            lastStepInList='setPermission'
        />
    )
}

interface SetAdminProps {
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
    admin: Address;
};