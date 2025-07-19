/* eslint-disable */
import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData, formatAddr } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Hex, parseUnits } from "viem";
import { FunctionName, Address } from '../../../types/quiz';
import useProfile from '../hooks/useProfile';

export const VALUE = parseUnits('0', 16);
export default function GenerateKey({campaignHash, buttonClassName} : {campaignHash: Hex, buttonClassName?: string}) {
    const [openDrawer, setDrawer] = React.useState<number>(0);

    const toggleDrawer = (arg:number) => setDrawer(arg); 
    const { chainId, address } = useAccount();
    const account = formatAddr(address);
    const { weekId, wkId } = useStorage();
    const { profile: { other: { haskey}} } = useProfile({wkId, inHash: campaignHash});

    // Build the transactions to run
    const { mutate, funcArgs } = React.useMemo(() => {
        const mutate = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['generateKey'],
        });
        
        const growToken = mutate.contractAddresses.GrowToken as Address;
        const generateArgs = [growToken, [campaignHash]];
        // const recordPointsArgs = [account, result, growToken, result.other.quizId];
        return { mutate, funcArgs: [generateArgs] };
    }, [chainId, campaignHash, account]);

    // Prepare the transactions
    const getTransactions = React.useCallback(() => {
        const refetchArgs = async() => {
            const args: any[] = funcArgs[0];
            const value = VALUE;
            const proceed = haskey? 0 : 1;
            return {args, value, proceed};
        };

        const getArgs = (funcName: FunctionName, index: number) => {
            let value = 0n;
            const args = funcArgs[index];
            switch (funcName) {
                case 'generateKey':
                    value = VALUE;
                    break;
                default:
                    break;
            }

            return { value, args }
        }

        const transactions = mutate.transactionData.map((txObject, i) :Transaction => {
            const { value, args } = getArgs(txObject.functionName as FunctionName, i);
            return {
                abi: txObject.abi,
                args,
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: true,
                refetchArgs,
                value
            };
        })
        return transactions;
   }, [mutate, funcArgs, haskey]);

    return(
        <React.Fragment>
            <button
                onClick={() => toggleDrawer(1)}
                className={`${buttonClassName || "w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"}`}
            >
                Get key
            </button>
            <Confirmation 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                getTransactions={getTransactions}
                displayMessage={`Hang on while we create your passkey for ${weekId}...`}
                lastStepInList='generateKey'
            />
        </React.Fragment>
    )
}
