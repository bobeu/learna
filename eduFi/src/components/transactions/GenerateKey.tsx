import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount } from 'wagmi';
import { filterTransactionData } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Hex, parseUnits } from "viem";
import { FunctionName, Address } from '../../../types/quiz';
import useProfile from '../hooks/useProfile';

const VALUE = parseUnits('1', 16);
export default function GenerateKey({functionName, campaignHash, buttonClassName} : {campaignHash: Hex, functionName: FunctionName, buttonClassName?: string}) {
    const [openDrawer, setDrawer] = React.useState<number>(0);

    const toggleDrawer = (arg:number) => setDrawer(arg); 
    const { chainId, address } = useAccount();
    const account = address as Address;
    // const config = useConfig();
    const { weekId } = useStorage();
    const { haskey } = useProfile({campaignHash});

    // Build the transactions to run
    const { mutate, generateArgs } = React.useMemo(() => {
        const mutate = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['generateKey'],
        });
        
        const growToken = mutate.contractAddresses.GrowToken as Address;
        const generateArgs = [growToken, [campaignHash]];
        return { mutate, generateArgs };
    }, [chainId, weekId, account, campaignHash]);

    // Prepare the transactions
    const getTransactions = React.useCallback(() => {
        const refetchArgs = async() => {
            const args: any[] = generateArgs;
            const value = VALUE;
            const proceed = haskey? 0 : 1;
            return {args, value, proceed};
        };

        const transactions = mutate.transactionData.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: generateArgs,
                contractAddress: txObject.contractAddress as Address,
                functionName: functionName === 'runall'? functionName : 'generateKey',
                requireArgUpdate: true,
                refetchArgs,
                value: VALUE
            };
            return transaction;
        })
        return transactions;
   }, [mutate, generateArgs, functionName]);

    return(
        <React.Fragment>
            <button
                onClick={() => toggleDrawer(1)}
                className={`${buttonClassName || "w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"}`}
            >
                Get key
                {/* <ArrowRight className="w-5 h-5" /> */}
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
