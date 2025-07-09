import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount, useConfig, useReadContracts } from 'wagmi';
import { filterTransactionData } from '../utilities';
import useStorage from '../hooks/useStorage';
import { Hex, parseUnits } from "viem";
import { ArrowRight } from "lucide-react";
import { FunctionName, Address, Profile } from '../../../types/quiz';

const VALUE = parseUnits('1', 16);
export default function GenerateKey({functionName, campainHash, buttonClassName} : {campainHash: Hex, functionName: FunctionName, buttonClassName?: string}) {
    const [openDrawer, setDrawer] = React.useState<number>(0);

    const toggleDrawer = (arg:number) => setDrawer(arg); 
    const { chainId, address } = useAccount();
    const account = address as Address;
    const config = useConfig();
    const { weekId } = useStorage();

    // Build the transactions to run
    const { readTxObject, mutate } = React.useMemo(() => {
        const { contractAddresses: ca, transactionData: td} = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['checkEligibility', 'getProfile'],
        });

        const mutate = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['generateKey'],
        });

        const learna = ca.Learna as Address;
        const readArgs = [[weekId, account, campainHash], [account, weekId, [campainHash]]];
        const addresses = [learna, learna];
        const readTxObject = td.map((item, i) => {
            return{
                abi: item.abi,
                functionName: item.functionName,
                address: addresses[i],
                args: readArgs[i]
            }
        });

        return { readTxObject, mutate };
    }, [chainId, weekId, account, campainHash]);

    // Fetch the user's profile and eligibility status
    const { refetch } = useReadContracts({
        config,
        contracts: readTxObject
    });

    // Prepare the transactions
    const getTransactions = React.useCallback(() => {
        const refetchArgs = async(funcName: FunctionName) => {
            const args = [''];
            const value : bigint = 0n;
            let proceed = 1;
            await refetch().then((result) => {
                const profile = result?.data?.[1].result as Profile;
                // console.log("profile.hasKey", profile.haskey);

                switch (funcName) {
                    case 'generateKey':
                        if(profile.haskey){
                            proceed = 0;
                        }
                        break;
                    default:
                        break;
                }                
            });
            return {args, value, proceed};
        };

        const transactions = mutate.transactionData.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: [],
                contractAddress: txObject.contractAddress as Address,
                functionName: functionName === 'runall'? functionName : 'generateKey',
                requireArgUpdate: txObject.requireArgUpdate,
                refetchArgs,
                value: VALUE
            };
            return transaction;
        })
        return transactions;
   }, [mutate, functionName, refetch]);

    return(
        <React.Fragment>
            <button
                onClick={() => toggleDrawer(1)}
                className={`${buttonClassName || "w-full flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"}`}
            >
                <span>Get Passkey</span>
                <ArrowRight className="w-5 h-5" />
            </button>
            <Confirmation 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                getTransactions={getTransactions}
                displayMessage={`Hang on while we create your passkey for ${weekId}...`}
            />
        </React.Fragment>
    )
}
