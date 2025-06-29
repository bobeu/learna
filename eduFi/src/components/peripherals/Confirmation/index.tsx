/* eslint-disable */

import React from "react";
import Drawer from './Drawer';
import { Button } from "~/components/ui/button";
import { useAccount, useConfig, useWriteContract, useSendTransaction, useChainId, useBalance } from "wagmi";
import { WriteContractErrorType, waitForTransactionReceipt } from "wagmi/actions";
import { Address, FunctionName, getCastText, getDivviReferralUtilities, toBN, TOTAL_WEIGHT } from "~/components/utilities";
import useStorage from "~/components/hooks/useStorage";
import Message from "~/components/peripherals/Message";
import { Spinner } from "~/components/peripherals/Spinner";
import { privateKeyToAccount } from 'viem/accounts';
import { parseUnits } from "viem";
import { celo } from "viem/chains";
// import { useNeynarContext } from "@neynar/react";
// import axios, { AxiosError } from "axios";
// import { ErrorRes } from "@neynar/nodejs-sdk/build/api";
import sdk from "@farcaster/frame-sdk";
import { APP_URL, RECEIVER } from "~/lib/constants";

export const Confirmation : 
    React.FC<ConfirmationProps> = 
        ({ getTransactions, openDrawer, toggleDrawer, displayMessage}) => 
{   
    const { weekId: wkId, dataRef, loading, callback, clearData, clearSelectedData, setpath, setmessage, toggleLoading, refetch } = useStorage();
    const { address, isConnected, } = useAccount();
    const chainId = useChainId();
    const config = useConfig();
    const { refetch: fetchBalance } = useBalance({chainId, address: privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address).address});
    const account = address as Address;
    const weekId = toBN(wkId.toString()).toNumber();
    const { data: questionsAtempted, } = dataRef.current;

    const { totalScores } = React.useMemo(() => {
        const totalQuestions = questionsAtempted.length;
        const weightPerQuestion = Math.floor(TOTAL_WEIGHT / totalQuestions);
        const totalAnsweredCorrectly = questionsAtempted.filter(({userAnswer, answer}) => userAnswer === answer);
        const totalScores = weightPerQuestion * totalAnsweredCorrectly.length;
        
        return { totalScores };
    }, [questionsAtempted]);

    React.useEffect(() => {
        callback({message: '', errorMessage: ''});
    }, [callback]);

    const publishCast = async (weekId: number, altText: string, task?: FunctionName) => {
        let text = altText;
        if(task) text = getCastText(task, weekId);
        if(text !== '') {
            const response = await sdk.actions.composeCast({text, embeds: [APP_URL]})
            // const response = await axios.post<{ message: string }>("/api/cast", {
            //   signerUuid: user?.signer_uuid,
            //   text,
            // });
            // console.log("Response: ", response);
            if(response?.cast?.hash) {
                setmessage('Your task was pubished with hash'.concat(response?.cast?.hash || ''));
            } else{
                setmessage('Cast publish failed!');
            }
        }
      };

    // Finalize transaction by reseting the necessary varibles
    const finalize = () => {
         setTimeout(() => {
            console.log("Here4");
            callback({message: '', errorMessage: ''});
            clearData();
            clearSelectedData();
            toggleLoading(false);
            toggleDrawer(0);
            setpath('profile');
            console.log("Here5")
        }, 6000);
        clearTimeout(6000);
    }

    // Wait for sometime before resetting the state after completing a transaction
    const setCompletion = async(functionName: FunctionName, useDivvi: boolean, hash: Address) => {
        const { submitReferralData } = getDivviReferralUtilities();
        callback({message: `Transaction completed!`});
        if(functionName === 'sortWeeklyReward'){
            await publishCast(weekId - 1, '', functionName);
        }

        if(useDivvi) {
            const result = await submitReferralData(hash, chainId);
            if(result.status === 200) {
                setmessage('Publishing cast...');
                await publishCast(weekId, `Got a new referral. Thanks to @letsdivvi`);
            } else {
                setmessage('Referral submission failed');
            }
        }

        await refetch();
        switch (functionName) {
            case 'tip':
                setmessage('Your tip was received. Check your profile for points earned');
            break;
            default:
                setmessage('Yay! transaction was successful ended');
            break;
        }
       finalize();
    };

    // When error occurred, run this function
    const onError = async(error: WriteContractErrorType) => {
        callback({errorMessage: error.message});
        toggleLoading(false);
    }

    const { writeContractAsync, } = useWriteContract({
        config, 
        mutation: { 
            onError: (error) => onError(error), 
        }
    });

    // Prepare send transaction
    const { sendTransactionAsync } = useSendTransaction({
        config,
        mutation: { 
            onSuccess: (hash) => {
                callback({message: `Delegation completed with hash: ${hash.substring(0, 8)}...`});
            },
            onError(error) {
                callback({errorMessage: error.message});
                toggleLoading(false);
            },
        }
    });

    const waitForConfirmation = async(hash: `0x${string}`, functionName: FunctionName | string) => {
        const receipt = await waitForTransactionReceipt(config, {hash, confirmations: 2});
        callback({message: `Completed in ${functionName} task!`});
        return receipt.transactionHash;
    } 

    // Delegate recordPoint transaction task to an admin
    // Forward balances to receiver
    const delegateTransactionTask = async() => {
        callback({message: 'Delegating transaction call to an admin'});
        const viemAccountObj = privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address);
        const hash = await sendTransactionAsync({
            account,
            to: viemAccountObj.address,
            value: parseUnits('2', 16)
        });
        await waitForConfirmation(hash, 'delegation'); 
    }

    const forwardBalances = async() => {
        const celoBalance = (await fetchBalance()).data?.value;
        console.log("CeloBalance", celoBalance);
        const amount = parseUnits('8', 15)
        if(celoBalance && celoBalance > amount) {
            const hash_ = await sendTransactionAsync({
                account: privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address),
                to: RECEIVER,
                value: amount
            });
            await waitForConfirmation(hash_, "Rebalancing completed");
        }
    }

    const runTransaction = async(arg: Transaction) => {
        const { abi, functionName, args, contractAddress, value} = arg;
        const { getDataSuffix } = getDivviReferralUtilities();
        const useDivvi = chainId === celo.id;
        const dataSuffix = useDivvi? getDataSuffix() : undefined;
        let hash : Address = '0x';
        try {
            switch (functionName) {
                case 'recordPoints':
                    await delegateTransactionTask();
                    callback({message: "Now saving your points..."});
                    const recordArgs = [account, totalScores];
                    hash = await writeContractAsync({
                        abi,
                        functionName,
                        address: contractAddress,
                        account: privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address),
                        args: recordArgs,
                        dataSuffix
                    });
                    hash = await waitForConfirmation(hash, '');
                    await forwardBalances();         
                    await setCompletion(functionName, true, hash);
                    break;
                
                case 'generateKey':
                    hash = await writeContractAsync({
                        abi,
                        functionName,
                        address: contractAddress,
                        account,
                        args: [],
                        dataSuffix,
                        value
                    });
                    hash = await waitForConfirmation(hash, '');
                    await setCompletion(functionName, true, hash);
                    break;
    
                case 'runall':
                    hash = await writeContractAsync({
                        abi,
                        functionName: 'generateKey',
                        address: contractAddress,
                        account,
                        args: [],
                        dataSuffix,
                        value
                    });
                    hash = await waitForConfirmation(hash, '');
                    await delegateTransactionTask();
                    callback({message: "Now saving your points..."});
                    const recordArg = [account, totalScores];
                    hash = await writeContractAsync({
                        abi,
                        functionName: 'recordPoints',
                        address: contractAddress,
                        account: privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address),
                        args: recordArg,
                        dataSuffix
                    });
                    hash = await waitForConfirmation(hash, '');
                    await setCompletion('recordPoints', true, hash);
                    
                    break;
                default:
                    hash = await writeContractAsync({
                        abi,
                        functionName,
                        address: contractAddress,
                        account: account,
                        args
        
                    });
                    hash = await waitForConfirmation(hash, '');
                    await setCompletion(functionName, true, hash);
                    break;
            }
        } catch (error) {
            console.log("ErrorOccured: ", error);
            setmessage("Oops! We are unable to complete your transaction. Please send us feedback on Telegram @cryptopreach");
            finalize();
        }
    }

    /**
     * @dev Broadcast transaction to the blockchain and wait for confirmation up to 2 confirmation blocks
     * If function name or step is 'recordPoint', we switch to using the Admin or assigned agent to perform this task.
     * User must first delegate transaction fee to this account before it is executed.
     * @returns void
     */
    const handleSendTransaction = async() => {
        if(!isConnected) return callback({errorMessage: 'Please connect wallet'});
        toggleLoading(true);
        const transactions = getTransactions();

        for( let i = 0; i < transactions.length; i++) {
            const {abi, value, functionName, contractAddress, args} = transactions[i];
            callback({message: 'Sending transaction to the network...'});
            await runTransaction({abi, contractAddress, args, functionName, value, requireArgUpdate: false});
        }
    }

    // Alert message component and reset messages when mounted
    React.useEffect(() => {
        callback({message: "", errorMessage: ''});
        if(loading) toggleLoading(false);
    }, []);

    return (
        <Drawer 
            title={ !loading? (displayMessage || 'Transaction request') : 'Transaction sent' }
            openDrawer={openDrawer} 
            setDrawerState={toggleDrawer}
            onClickAction={() => toggleDrawer(0)}
            styles={{padding:'22px', borderLeft: '1px solid #2e3231', height: "100%", background: '#F9F4F4'}}
        >
            <div className="space-y-4">
                <Message />
                <Button variant={'outline'} disabled={loading} className="w-full bg-cyan-500 p-6 max-w-sm" onClick={handleSendTransaction}>{loading? <Spinner color={"white"} /> : 'Proceed'}</Button>
            </div>
        </Drawer>
    );
}

export type Transaction = {
    functionName: FunctionName,
    contractAddress: Address,
    args: any[] | [],
    requireArgUpdate: boolean;
    abi: any[] | Readonly<any[]>;
    value?: bigint;
    refetchArgs?: (funcName: FunctionName) => Promise<{args: any[], value: bigint, proceed: number}>;
};

export interface ConfirmationProps {
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
    getTransactions: () => Transaction[];
    displayMessage?: string;
}
