import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount, useConfig, useReadContracts } from 'wagmi';
import { type Address, filterTransactionData, type FunctionName, type Profile } from '../utilities';
import useStorage from '../hooks/useStorage';
import { MotionDisplayWrapper } from '../peripherals/MotionDisplayWrapper';
import { Button } from '~/components/ui/button';
import { parseUnits } from "viem";

const VALUE = parseUnits('1', 16);
export default function GenerateKey({functionName} : {functionName: FunctionName}) {
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
            functionNames: ['checkligibility', 'getUserData'],
        });

        const mutate = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['generateKey'],
        });

        const learna = ca.Learna as Address;
        const readArgs = [[weekId], [account, weekId]];
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
    }, [chainId, weekId, account]);

    // Fetch the user's profile
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
        <MotionDisplayWrapper>
            <Button onClick={() => toggleDrawer(1)} variant={'ghost'} className="text-cyan-900 font-bold ">Generate Key</Button>
            <Confirmation 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                getTransactions={getTransactions}
                displayMessage={`Generating a key for week ${weekId}`}
            />
        </MotionDisplayWrapper>
    )
}
