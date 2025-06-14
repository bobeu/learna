import React from 'react';
import { Confirmation, type Transaction } from '../peripherals/Confirmation';
import { useAccount, useConfig, useReadContracts } from 'wagmi';
import { 
    type Address, 
    filterTransactionData, 
    type FunctionName, 
    type TransactionCallback, 
    type Profile } from '../utilities';
import useStorage from '../StorageContextProvider/useStorage';
import { MotionDisplayWrapper } from '../peripherals/MotionDisplayWrapper';
import { Button } from '~/components/ui/button';
import { parseUnits } from "viem";

const VALUE = parseUnits('1', 16);
export default function GenerateKey() {
    const [openDrawer, setDrawer] = React.useState<boolean>(false);
    // const [claimDrawerOpen, setClaimDrawer] = React.useState<boolean>(false);

    const toggleDrawer = () => setDrawer(!openDrawer); 
    // const toggleClaimDrawer = () => setClaimDrawer(!claimDrawerOpen); 
    const { chainId, address } = useAccount();
    const account = address as Address;
    const config = useConfig();
    const { setError, setmessage, weekId } = useStorage();
    const callback : TransactionCallback = (arg) => {
        if(arg.message) setmessage(arg.message);
        if(arg.errorMessage) setError(arg.errorMessage);
    }

    // Build the transactions to run
    const { readTxObject, mutate } = React.useMemo(() => {
        const { contractAddresses: ca, transactionData: td} = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['checkligibility', 'getUserData'],
            callback
        });

        const mutate = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['generateKey'],
            callback
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
    }, [chainId, weekId, account, callback]);

    // Fetch the user's profile
    const { data, isLoading, isPending, refetch } = useReadContracts({
        config,
        contracts: readTxObject
    });

    // Prepare the transactions
    const getTransactions = React.useCallback(() => {
        const refetchArgs = async(funcName: FunctionName) => {
            let args : any[] = [];
            let value : bigint = 0n;
            let proceed = 1;
            await refetch().then((result) => {
                let profile = result?.data?.[1].result as Profile;
                console.log("profile.hasKey", profile.haskey);

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

        let transactions = mutate.transactionData.map((txObject) => {
            const transaction : Transaction = {
                abi: txObject.abi,
                args: [],
                contractAddress: txObject.contractAddress as Address,
                functionName: txObject.functionName as FunctionName,
                requireArgUpdate: txObject.requireArgUpdate,
                refetchArgs,
                value: VALUE
            };
            return transaction;
        })
        return transactions;
   }, [mutate, refetch]);

    return(
        <MotionDisplayWrapper>
            <div className='w-full place-items-center'>
                <Button onClick={toggleDrawer} variant={'outline'} className="w-full bg-cyan-500/30 text-cyan-700">Generate Key</Button>
            </div>
            <Confirmation 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                getTransactions={getTransactions}
                setDone={true}
            />
        </MotionDisplayWrapper>
    )
}
