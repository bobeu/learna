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
import { useNeynarContext } from "@neynar/react";
import axios, { AxiosError } from "axios";
import { ErrorRes } from "@neynar/nodejs-sdk/build/api";

export const Confirmation : 
    React.FC<ConfirmationProps> = 
        ({ getTransactions, lastStepInList, openDrawer, back, toggleDrawer}) => 
{   
    const [loading, setLoading] = React.useState<boolean>(false);
    const [completed, setIsCompleted] = React.useState<boolean>(false);

    const { errorMessage, messages, weekId: wkId, selectedQuizData, refetch, getFunctions } = useStorage();
    const { address, isConnected } = useAccount();

    const config = useConfig(); 
    const chainId = useChainId();
    const account = address as Address;
    const { user } = useNeynarContext();
    const { callback, setmessage } = getFunctions();

    const { totalScores, weekId} = React.useMemo(() => {
        const { questions } = selectedQuizData.data;
        const questionSize = questions.length;
        const weightPerQuestion = Math.floor(TOTAL_WEIGHT / questionSize);
        const totalAnsweredCorrectly = questions.filter(({userAnswer, correctAnswer}) => userAnswer?.label === correctAnswer.label);
        const totalScores = weightPerQuestion * totalAnsweredCorrectly.length;
        const weekId = toBN(wkId.toString()).toNumber();
        return {
            totalScores,
            weekId
        };
    }, []);

    // Reset the messages and error messages in state, and close the drawer when transaction is completed
    // const handleCloseDrawer = () => {
    //     callback({message: '', errorMessage: ''});
    //     toggleDrawer(false);
    // };

    const puublishCast = async (task: FunctionName, weekId: number) => {
        const text = getCastText(task, weekId)
        try {
            if(text !== '') {
                const response = await axios.post<{ message: string }>("/api/cast", {
                  signerUuid: user?.signer_uuid,
                  text,
                });
                console.log("Response: ", response.data.message);
                setmessage('Your task was pubished'.concat(response.data.message));
            }
        } catch (err) {
          const { message } = (err as AxiosError).response?.data as ErrorRes;
          alert(message);
        }
      };

    // Wait for sometime before resetting the state after completing a transaction
    const setCompletion = () => {
        setLoading(false);
        refetch().then((res) => {console.log(res.isSuccess)});
        const timeoutObj = setTimeout(() => {
            // handleCloseDrawer();
            setIsCompleted(true);
            back?.();
        }, 6000);
        return clearTimeout(timeoutObj);
    };

    // Call this function when transaction successfully completed
    const onSuccess = (hash: Address, variables: { functionName: string; } | undefined) => {
        callback({message: `Completed request with hash: ${hash.substring(0, 8)}...`});
        const functionName = variables?.functionName as FunctionName;
        if(functionName === lastStepInList){
            puublishCast(functionName, functionName === 'sortWeeklyReward'? weekId - 1 : weekId)
            .then(() => setCompletion());
        }
    };

    // When error occurred, run this function
    const onError = async(error: WriteContractErrorType) => {
        callback({errorMessage: error.message});
        setCompletion();
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
                setCompletion();
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
        const { abi, functionName, args, contractAddress} = arg;
        const { getDataSuffix, submitReferralData } = getDivviReferralUtilities();
        // const useDivvi = chainId === celo.id && functionName === 'generateKey';
        const useDivvi = chainId === celo.id;
        const dataSuffix = useDivvi? getDataSuffix() : undefined;
        callback({message: 'Delegating transaction call to an admin'});
        const viemAccountObj = privateKeyToAccount(process.env.ADMIN_0xC0F as Address);
        const hash = await sendTransactionAsync({
            account,
            to: viemAccountObj.address,
            value: parseUnits('2', 16)
        });
        let resultHash = await waitForConfirmation(hash, false);
        callback({message: "Now saving your points..."});
        const hash1 = await writeContractAsync({
            abi,
            functionName,
            address: contractAddress,
            account: viemAccountObj,
            args,
            dataSuffix
        });
        resultHash = await waitForConfirmation(hash1, true);
        if(useDivvi) {
            const result = await submitReferralData(resultHash, chainId);
            console.log("Divvi Ref result:", result, "\n resultHash", resultHash);
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
        setLoading(true);
        const transactions = getTransactions();
        console.log("account11",account);

        for( let i = 0; i < transactions.length; i++) {
            const {abi, value, functionName, contractAddress: address, args} = transactions[i];
            callback({message: 'Broadcasting...'});
            switch (functionName) {
                case 'recordPoints':
                    await runTransaction({abi, contractAddress: address, args, functionName, requireArgUpdate: false});
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
                    if(totalScores > 0) {
                        await runTransaction({abi, contractAddress: address, args: [account, totalScores], functionName, requireArgUpdate: false});
                    }
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
                    parentMessage={messages}
                    parentErrorMessage={errorMessage}
                    setCompletion={() => setIsCompleted(false)}
                    closeDrawer={() => {
                        toggleDrawer(false);
                        back?.();
                    }} 
                />
                <Button variant={'outline'} disabled={loading || completed} className="w-full max-w-sm" onClick={handleSendTransaction}>{loading? <Spinner color={"white"} /> : 'Proceed'}</Button>
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
