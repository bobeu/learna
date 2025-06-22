/* eslint-disable */

import React from "react";
import Drawer from './Drawer';
import { Button } from "~/components/ui/button";
import { useAccount, useConfig, useWriteContract, useSendTransaction, useChainId } from "wagmi";
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
import { APP_URL } from "~/lib/constants";

export const Confirmation : 
    React.FC<ConfirmationProps> = 
        ({ getTransactions, lastStepInList, openDrawer, back, toggleDrawer}) => 
{   
    const [completed, setIsCompleted] = React.useState<boolean>(false);

    const { errorMessage, messages, weekId: wkId, data, loading, refetch, getFunctions } = useStorage();
    const { address, isConnected } = useAccount();

    const config = useConfig(); 
    const chainId = useChainId();
    const account = address as Address;
    const { callback, setmessage, toggleLoading, setcompletedTask } = getFunctions();

    const { totalScores, weekId} = React.useMemo(() => {
        const { totalQuestions, data: questionsAtempted, } = data;
        const weightPerQuestion = Math.floor(TOTAL_WEIGHT / totalQuestions);
        const totalAnsweredCorrectly = questionsAtempted.filter(({userAnswer, correctAnswer}) => userAnswer?.label === correctAnswer.label);
        const totalScores = weightPerQuestion * totalAnsweredCorrectly.length;
        const weekId = toBN(wkId.toString()).toNumber();
        return {
            totalScores,
            weekId
        };
    }, [data]);

    const publishCast = async (weekId: number, altText: string, task?: FunctionName) => {
        let text = altText;
        if(task) text = getCastText(task, weekId);
        try {
            if(text !== '') {
                const response = await sdk.actions.composeCast({text, embeds: [APP_URL]})
                // const response = await axios.post<{ message: string }>("/api/cast", {
                //   signerUuid: user?.signer_uuid,
                //   text,
                // });
                console.log("Response: ", response);
                setmessage('Your task was pubished with hash'.concat(response?.cast?.hash || ''));
            }
        } catch (err) {
        //   const { message } = (err as AxiosError).response?.data as ErrorRes;
          setmessage("Casting failed");
          alert('Casting failed');
        }
      };

    // Wait for sometime before resetting the state after completing a transaction
    const setCompletion = (functionName: FunctionName) => {
        toggleLoading(false);
        refetch().then((res) => {console.log(res.isSuccess)});
        // if(functionName === 'generateKey') {
        //     setIsCompleted(true);
        // } else {
        // }
        const timeoutObj = setTimeout(() => {
            setIsCompleted(true);
            callback({message: '', errorMessage: ''});
            back?.();
        }, 6000);
        return clearTimeout(timeoutObj);
    };

    // Call this function when transaction successfully completed
    const onSuccess = (hash: Address, variables: { functionName: string; } | undefined) => {
        callback({message: `Completed request with hash: ${hash.substring(0, 8)}...`});
        const functionName = variables?.functionName as FunctionName;
        if(functionName === lastStepInList){
            setcompletedTask(functionName);
            publishCast(functionName === 'sortWeeklyReward'? weekId - 1 : weekId, '', functionName)
            .then(() => setCompletion(functionName))
            .catch((error: any) => {
                console.log("Publish error: ", error);
                setCompletion(functionName);
            })
        }
    };

    // When error occurred, run this function
    const onError = async(error: WriteContractErrorType) => {
        callback({errorMessage: error.message});
        setCompletion('');
    }

    const { writeContractAsync, } = useWriteContract({
        config, 
        mutation: { 
            onError: (error) => onError(error), 
            onSuccess
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
                setCompletion('');
            },
        }
    });

    const waitForConfirmation = async(hash: `0x${string}`, setDone: boolean) => {
        const receipt = await waitForTransactionReceipt(config, {hash, confirmations: 2});
        callback({message: `Completed in ${receipt.blockNumber.toString()} block with transaction hash: ${receipt.transactionHash.substring(0, 8)}...`});
        if((receipt.status === 'success') && setDone) setIsCompleted(true);
        return receipt.transactionHash;
    } 

    const runTransaction = async(arg: Transaction) => {
        const { abi, functionName, args, contractAddress, value} = arg;
        const { getDataSuffix, submitReferralData } = getDivviReferralUtilities();
        const useDivvi = chainId === celo.id;
        const dataSuffix = useDivvi? getDataSuffix() : undefined;
        let hash : Address = '0x';
        console.log("functionName", functionName);
        if(functionName === 'recordPoints') {
            callback({message: 'Delegating transaction call to an admin'});
            // console.log("process.env.ADMIN_0xC0F", process.env.NEXT_PUBLIC_ADMIN_0xC0F)
            const viemAccountObj = privateKeyToAccount(process.env.ADMIN_0xC0F as Address);
            hash = await sendTransactionAsync({
                account,
                to: viemAccountObj.address,
                value: parseUnits('2', 16)
            });
            hash = await waitForConfirmation(hash, false);
            callback({message: "Now saving your points..."});
            hash = await writeContractAsync({
                abi,
                functionName,
                address: contractAddress,
                account: viemAccountObj,
                args,
                dataSuffix
            });
            hash = await waitForConfirmation(hash, true);
        } else {
            hash = await writeContractAsync({
                abi,
                functionName,
                address: contractAddress,
                account,
                args: [],
                dataSuffix,
                value

            });
            hash = await waitForConfirmation(hash, true);
            
        }
        if(useDivvi) {
            const result = await submitReferralData(hash, chainId);
            if(result.status === 200) {
                setmessage('Publishing cast...');
                await publishCast(weekId, `Got a new referral. Thanks to @letsdivvi`);
            }
            // console.log("Divvi Ref result:", result, "\n resultHash", hash);
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
        console.log("account11",account);

        for( let i = 0; i < transactions.length; i++) {
            const {abi, value, functionName, contractAddress: address, args} = transactions[i];
            callback({message: 'Broadcasting...'});
            switch (functionName) {
                case 'recordPoints':
                    const recordArgs = [account, totalScores];
                    await runTransaction({abi, contractAddress: address, args: recordArgs, functionName, requireArgUpdate: false});
                    break;
                case 'tip':
                    if(value && value > 0) {
                        const hash3 = await writeContractAsync({
                            abi,
                            functionName,
                            address,
                            account,
                            args,
                            value
                        });
                        await waitForConfirmation(hash3, true);
                    }
                case 'sortWeeklyReward':
                    const hash4 = await writeContractAsync({
                        abi,
                        functionName,
                        address,
                        account,
                        args,
                        value
                    });
                    await waitForConfirmation(hash4, true);
                    break;
                case 'generateKey':
                    await runTransaction({abi, value, contractAddress: address, args: [account, totalScores], functionName, requireArgUpdate: false});
                    break;
            
                default:
                    break;
            }
        }
    }

    return (
        <Drawer 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            title={ !loading? 'Transaction request' : 'Transaction sent' }
        >
            <div className="space-y-4 text-center">
                <Message 
                    completed={completed} 
                    // closeDrawer={() => toggleDrawer(false)} 
                    setCompletion={() => setIsCompleted(false)}
                    closeDrawer={() => {
                        toggleDrawer(false);
                        back?.();
                    }} 
                />
                <Button variant={'outline'} disabled={loading || completed} className="w-full max-w-sm" onClick={handleSendTransaction}>{loading? <Spinner color={"cyan"} /> : 'Proceed'}</Button>
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
    toggleDrawer: (arg:boolean) => void;
    openDrawer: boolean;
    getTransactions: () => Transaction[];
    back?: () => void;
    setDone: boolean;
    lastStepInList: FunctionName;
}
