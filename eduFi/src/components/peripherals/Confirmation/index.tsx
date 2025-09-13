/* eslint-disable */

import React from "react";
import Drawer from './Drawer';
import { useAccount, useConfig, useWriteContract, useChainId } from "wagmi";
import { WriteContractErrorType, waitForTransactionReceipt } from "wagmi/actions";
import { getCastText, getDivviReferralUtilities } from "@/components/utilities";
// import useStorage from "@/components/hooks/useStorage";
import Message from "@/components/peripherals/Message";
import { Spinner } from "@/components/peripherals/Spinner";
// import { privateKeyToAccount } from 'viem/accounts';
// import { parseUnits } from "viem";
import { celo } from "viem/chains";
import sdk from "@farcaster/frame-sdk";
import { APP_URL } from "@/lib/constants";
import { Address, FunctionName } from "../../../../types";

// const DELEGATE_VALUE = parseUnits('15', 15);

export const Confirmation : 
    React.FC<ConfirmationProps> = 
        ({ getTransactions, lastStepInList, openDrawer, toggleDrawer, displayMessage}) => 
{   
    const [loading, setLoading] = React.useState<boolean>(false);
    const [message, setMessage] = React.useState<string>('');
    const [errorMessage, setErrorMessage] = React.useState<string>('');

    const { address, isConnected } = useAccount()
    const account = address as Address;
    const chainId = useChainId();
    const config = useConfig();

    const publishCast = async (altText: string, task?: FunctionName) => {
        let text = altText;
        if(task) text = getCastText(task, 0);
        if(text !== '') {
            const response = await sdk.actions.composeCast({text, embeds: [APP_URL]})
            // const response = await axios.post<{ message: string }>("/api/cast", {
            //   signerUuid: user?.signer_uuid,
            //   text,
            // });
            // console.log("Response: ", response);
            if(response?.cast?.hash) {
                setMessage('Your task was pubished with hash'.concat(response?.cast?.hash || ''));
            } else{
                setMessage('Cast publish failed!');
            }
        }
      };

    // Finalize transaction by reseting the necessary varibles
    const finalize = (functionName: FunctionName = '') => {
        if(functionName === lastStepInList || functionName === '') {
            setTimeout(() => {
               setLoading(false);
               setMessage('');
               toggleDrawer(0);
           }, 6000);
           clearTimeout(6000);
        }
    }

    // Wait for sometime before resetting the state after completing a transaction
    const setCompletion = async(functionName: FunctionName, useDivvi: boolean, hash: Address) => {
        if(functionName === lastStepInList){
            const { submitReferralData } = getDivviReferralUtilities();
            setMessage("Transaction completed!");
            if(useDivvi) {
                try {
                    const result = await submitReferralData(hash, chainId);
                    if(result.status === 200) {
                        // setMessage('Divvi ref submission successful');
                        setMessage('Publishing cast...');
                        await publishCast(`Got a new referral. Thanks to @letsdivvi. This is an automated message from @LearnaBot`);
                    } else {
                        setMessage('Failed to submit Divvi ref');
                    }
                } catch (error) {
                    setMessage('Failed to submit Divvi ref');
                    console.error("Error submitting Divvi ref:", error);
                }
            }
    
            // await refetch();
            // switch (functionName) {
            //     case 'setUpCampaign':
            //         setMessage('Your campaign was successfully set up!');
            //     break;
            //     default:
            //         setMessage('Yay! transaction was successful ended');
            //     break;
            // }
           finalize(functionName);
        }
    };

    // When error occurred, run this function
    const onError = async(error: WriteContractErrorType) => {
        setErrorMessage(error.message);
        setTimeout(
            () => {
                setErrorMessage('');
                setLoading(false);
            }, 
            3000
        );
        clearTimeout(3000);
    }

    const { writeContractAsync, } = useWriteContract({
        config, 
        mutation: { 
            onError: (error) => onError(error), 
        }
    });

    // // Prepare send transaction
    // const { sendTransactionAsync } = useSendTransaction({
    //     config,
    //     mutation: { 
    //         onSuccess: (hash) => {
    //             callback({message: `Delegation completed with hash: ${hash.substring(0, 8)}...`});
    //         },
    //         onError(error) {
    //             callback({errorMessage: error.message});
    //             toggleLoading(false);
    //         },
    //     }
    // });

    const waitForConfirmation = async(hash: `0x${string}`, functionName: FunctionName | string) => {
        const receipt = await waitForTransactionReceipt(config, {hash, confirmations: 2});
        setMessage(`Completed in ${functionName} task!`);
        return receipt.transactionHash;
    } 

    // Delegate recordPoint transaction task to an admin
    // Forward balances to receiver
    // const delegateTransaction = async() => {
    //     callback({message: 'Delegating storage power to an admin'});
    //     const viemAccountObj = privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address);
    //     const hash = await sendTransactionAsync({
    //         account,
    //         to: viemAccountObj.address,
    //         value: DELEGATE_VALUE
    //     });
    //     delegateTransaction
    //     callback({message: 'Waiting for confirmation'});
    //     await waitForConfirmation(hash, 'delegation'); 
    // }

    // const forwardBalances = async() => {
    //     const celoBalance = (await fetchBalance()).data?.value;
    //     console.log("CeloBalance", celoBalance);
    //     // const amount = parseUnits('8', 15)
    //     // if(celoBalance && celoBalance > amount) {
    //     //     const hash_ = await sendTransactionAsync({
    //     //         account: privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address),
    //     //         to: RECEIVER,
    //     //         value: amount
    //     //     });
    //     //     await waitForConfirmation(hash_, "Rebalancing completed");
    //     // }
    // }

    const runTransaction = async(arg: Transaction, ) => {
        const { abi, functionName, args, contractAddress, value, useAdmin } = arg;
        const { getDataSuffix } = getDivviReferralUtilities();
        const useDivvi = chainId === celo.id;
        const dataSuffix = useDivvi? getDataSuffix() : undefined;
        let hash : Address = '0x';
        let message : string = '';
        switch (functionName) {
            case 'approve':
                message = 'Please approve spending cap';
                break;
            case 'unpause':
                message = 'Returning contract state to active';
                break;
            case 'pause':
                message = 'Deactivating contract state';
                break;
            case 'banOrUnbanUser':
                message = 'Setting user status';
                break;
            case 'createCampaign':
                message = 'Creating a new campaign';
                break;
            case 'verify':
                message = 'Setting up your claim...';
                break;
        
            default:
                message = "Please wait..."
                break;
        }
        setMessage(message);
        try {
            setMessage(message)
            hash = await writeContractAsync({
                abi,
                functionName,
                address: contractAddress,
                account,
                args,
                dataSuffix,
                value
            });
            hash = await waitForConfirmation(hash, '');
            await setCompletion(functionName, useDivvi, hash);
        } catch (error) {
            console.log("ErrorOccured: ", error);
            setMessage("Oops! We are unable to complete your transaction. Please send us feedback on Telegram @cryptopreach");
            finalize();
        }
    }

    /**
     * @dev Broadcast transaction to the blockchain and wait for confirmation up to 2 confirmation blocks
    */ 
    const handleSendTransaction = async() => {
        if(!isConnected) return setErrorMessage('Please connect wallet');
        setLoading(true);
        // console.log("transactions")
        const transactions = getTransactions();
        // console.log("transactions", transactions)
        for( const transaction of transactions) {
            const {abi, value, functionName, contractAddress, args, useAdmin} = transaction;
            setMessage('Sending transaction to the network...');
            await runTransaction({abi, contractAddress, args, functionName, value, requireArgUpdate: false, useAdmin});
        }
    }

    return (
        <Drawer 
            title={ !loading? (displayMessage || 'Transaction request') : 'Transaction sent' }
            openDrawer={openDrawer} 
            setDrawerState={toggleDrawer}
            onClickAction={() => toggleDrawer(0)}
            styles={{padding:'22px', borderLeft: '1px solid #2e3231', height: "100%", background: '#F9F4F4'}}
        >
            <div className="space-y-4">
                <Message 
                    messages={message}
                    errorMessage={errorMessage}
                    loading={loading}
                    setmessage={(arg: string) => setMessage(arg)}
                    setError={(arg: string) => setErrorMessage(arg)}
                />
                <button 
                    disabled={loading} 
                    className="w-full flex-1 btn-primary flex items-center justify-center space-x-2" 
                    onClick={handleSendTransaction}
                >
                    {loading? <Spinner color={"white"} /> : 'Proceed'}
                </button>
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
    useAdmin?: number;
    refetchArgs?: (funcName?: FunctionName) => Promise<{args: any[], value: bigint, proceed: number}>;
};

export interface ConfirmationProps {
    toggleDrawer: (arg:number) => void;
    openDrawer: number;
    getTransactions: () => Transaction[];
    displayMessage?: string;
    lastStepInList: FunctionName;
}

