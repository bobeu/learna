import React from 'react';
import { Confirmation, type Transaction } from '../ActionButton/Confirmation';
import { useAccount, useConfig, useReadContracts } from 'wagmi';
import { Address, filterTransactionData, formatValue, FunctionName, TransactionCallback } from '../utilities';
import useStorage from '../StorageContextProvider/useStorage';
import { MotionDisplayWrapper } from '../peripherals/MotionDisplayWrapper';
import AddressWrapper from '../peripherals/AddressFormatter/AddressWrapper';
import { Button } from '~/components/ui/button';
import { Spinner } from '../peripherals/Spinner';
import ClaimWeeklyReward from './ClaimWeeklyReward';

export default function GenerateKey({weekId}: {weekId: bigint}) {
    const [openDrawer, setDrawer] = React.useState<number>(0);
    const [claimDrawerOpen, setClaimDrawer] = React.useState<number>(0);

    const toggleDrawer = (arg: number) => setDrawer(arg); 
    const toggleClaimDrawer = (arg: number) => setClaimDrawer(arg); 
    const { chainId, address } = useAccount();
    const account = address as Address;
    const config = useConfig();
    const { setError, setmessage } = useStorage();
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
    }, [chainId, callback]);

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
                refetchArgs
            };
            return transaction;
        })
        return transactions;
   }, [mutate, refetch]);

    const result = React.useMemo(() => {
        const isEligible = data?.[0].result as boolean;
        const profileData = data?.[1].result as Profile;
        const notReady = isLoading || isPending || !data;
        const renderElement = (arg: string | number) => notReady? <Spinner color='cyan'/> : <h3>{arg}</h3>;
        let result = (
            <MotionDisplayWrapper>
                <div className='w-full place-items-center'>
                    <Button variant={'outline'} className=''>Get Your Key</Button>
                </div>
                <Confirmation 
                    openDrawer={openDrawer}
                    toggleDrawer={toggleDrawer}
                    getTransactions={getTransactions}
                    displayMessage='Claiming weekly reward'
                    lastStepInList='generateKey'
                />
            </MotionDisplayWrapper>
        );

        if(profileData && profileData.haskey) {
            result =
                <MotionDisplayWrapper>
                    <div>
                        <h3>{`Your key for week ${weekId.toString()}`}</h3>
                        <AddressWrapper account={profileData.passKey} size={5} display overrideClassName=''/>
                    </div>
                    <div>
                        <div>
                            <h3>Points earned for the week</h3>
                            { renderElement(profileData.points.toString()) }
                        </div>
                        <div>
                            <h3>Total attempted quizzes</h3>
                            { renderElement(profileData.totalQuizPerWeek) }
                        </div>
                        <div>
                            <h3>Amount claimed in ERC20 Token</h3>
                            { renderElement(formatValue(profileData.amountClaimedInERC20.toString()).toStr) }
                        </div>
                        <div>
                            <h3>Amount claimed in Celo</h3>
                            { renderElement(`$CELO ${formatValue(profileData.amountClaimedInNative.toString()).toStr}`) }
                        </div>
                        {
                            isEligible? 
                                <Button onClick={() => toggleClaimDrawer(1)} disabled={profileData.claimed || !profileData.haskey} >{ profileData.claimed? 'Claimed' : 'Claim' }</Button>
                                    : 
                                    <div className='w-full text-center bg-orange-500/20 text-orange-500'>
                                        <h3>Not Eligible</h3>
                                    </div>
    
                        }
                    </div>
                    <ClaimWeeklyReward 
                        openDrawer={claimDrawerOpen}
                        toggleDrawer={toggleClaimDrawer}
                        weekId={weekId}
                    />
                </MotionDisplayWrapper>;
        }
        return result;
    }, [data, isPending, isLoading, claimDrawerOpen, toggleClaimDrawer]);

    return(
        <MotionDisplayWrapper>{ result }</MotionDisplayWrapper>
    )
}

export interface Profile {
    amountClaimedInNative: bigint;
    amountClaimedInERC20: bigint;
    claimed: boolean;
    points: number;
    passKey: string;
    haskey: boolean;
    totalQuizPerWeek: number;
}