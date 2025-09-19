// import React from 'react';
// import { Confirmation } from '../peripherals/Confirmation';
// import { useAccount } from 'wagmi';
// import { filterTransactionData } from '../utilities';
// import useStorage from '../hooks/useStorage';
// import { Address, FunctionName } from '../../../types';
// import type { Hex } from "viem";

// export default function SetConfigId({openDrawer, configId, toggleDrawer }: SetConfigIdProps) {
//     const { chainId } = useAccount();
//     const { callback } = useStorage();

//     const { mutate, setupArgs } = React.useMemo(() => {
//         const mutate = filterTransactionData({
//             chainId,
//             filter: true,
//             functionNames: ['setConfigId'],
//             callback
//         });
        
//         const setupArgs = [configId];

//         return { mutate, setupArgs, };

//     }, [chainId, configId, callback]);

//     const getTransactions = React.useCallback(() => {
//         const transactions = mutate.transactionData.map((txObject) => {
//             return {
//                 abi: txObject.abi,
//                 args: setupArgs,
//                 contractAddress: txObject.contractAddress as Address,
//                 functionName: txObject.functionName as FunctionName,
//                 requireArgUpdate: txObject.requireArgUpdate,
//             };
//         })
//         return transactions;
    
//    }, [setupArgs, mutate]);

//     return(
//         <Confirmation 
//             openDrawer={openDrawer}
//             toggleDrawer={toggleDrawer}
//             getTransactions={getTransactions}
//             lastStepInList='setConfigId'
//         />
//     )
// }

// interface SetConfigIdProps {
//     toggleDrawer: (arg:number) => void;
//     openDrawer: number;
//     configId: Hex;
// };