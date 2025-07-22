/* eslint-disable */

import React from "react";
import Drawer from './Drawer';
import { useAccount, useConfig, useWriteContract, useSendTransaction, useConnect, useChainId, useBalance, } from "wagmi";
import { WriteContractErrorType, waitForTransactionReceipt } from "wagmi/actions";
import { filterTransactionData, getCastText, getDivviReferralUtilities, toBN } from "~/components/utilities";
import useStorage from "~/components/hooks/useStorage";
import Message from "~/components/peripherals/Message";
import { Spinner } from "~/components/peripherals/Spinner";
import { privateKeyToAccount } from 'viem/accounts';
import { parseUnits } from "viem";
import { celo } from "viem/chains";
import sdk from "@farcaster/frame-sdk";
import { APP_URL } from "~/lib/constants";
import { Address, FunctionName } from "../../../../types/quiz";

export const Confirmation : 
    React.FC<ConfirmationProps> = 
        ({ getTransactions, lastStepInList, openDrawer, toggleDrawer, displayMessage}) => 
{   
    const { weekId: wkId, result, loading, recordPoints, toggleRecordPoints, callback, setpath, setmessage, toggleLoading, refetch } = useStorage();
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const config = useConfig();
    const { refetch: fetchBalance } = useBalance({chainId, address: privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address).address});
    const account = address as Address;
    const weekId = toBN(wkId.toString()).toNumber();

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
    const finalize = (functionName: FunctionName = '') => {
        if(functionName === lastStepInList || functionName === '') {
            setTimeout(() => {
               toggleLoading(false);
               toggleDrawer(0);
               switch (functionName) {
                   case 'setUpCampaign':
                       setpath('stats');
                       break;
                   case 'adjustCampaignValues':
                       setpath('stats');
                       break;
                   case 'generateKey':
                       setpath('dashboard');
                       break;
                   case 'recordPoints':
                       setpath('profile');
                       break;
                   case 'sortWeeklyReward':
                       setpath('stats');
                       break;
                   default:
                       break;
               } 
               
               // console.log("Here5")
           }, 5000);
           clearTimeout(5000);
        }
    }

    // Wait for sometime before resetting the state after completing a transaction
    const setCompletion = async(functionName: FunctionName, useDivvi: boolean, hash: Address) => {
        if(functionName === lastStepInList){
            const { submitReferralData } = getDivviReferralUtilities();
            callback({message: `Transaction completed!`});
            if(functionName === 'sortWeeklyReward'){
                await publishCast(weekId - 1, '', functionName);
            }
    
            if(useDivvi) {
                const result = await submitReferralData(hash, chainId);
                if(result.status === 200) {
                    setmessage('Divvi ref submission successful');
                    // setmessage('Publishing cast...');
                    // await publishCast(weekId, `Got a new referral. Thanks to @letsdivvi`);
                } else {
                    setmessage('Failed to submit Divvi ref');
                }
            }
    
            await refetch();
            switch (functionName) {
                case 'setUpCampaign':
                    setmessage('Your campaign was successfully set up!');
                break;
                default:
                    setmessage('Yay! transaction was successful ended');
                break;
            }
           finalize(functionName);
        }
    };

    // When error occurred, run this function
    const onError = async(error: WriteContractErrorType) => {
        callback({errorMessage: error.message});
        setTimeout(() => toggleLoading(false), 3000);
        clearTimeout(3000);
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
        // const amount = parseUnits('8', 15)
        // if(celoBalance && celoBalance > amount) {
        //     const hash_ = await sendTransactionAsync({
        //         account: privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address),
        //         to: RECEIVER,
        //         value: amount
        //     });
        //     await waitForConfirmation(hash_, "Rebalancing completed");
        // }
    }

    const runTransaction = async(arg: Transaction, ) => {
        console.log("Args1: ", arg)
        const { abi, functionName, args, contractAddress, value, useAdmin } = arg;
        const { getDataSuffix } = getDivviReferralUtilities();
        const useDivvi = chainId === celo.id;
        const dataSuffix = useDivvi? getDataSuffix() : undefined;
        let hash : Address = '0x';
        try {
            if(functionName === 'recordPoints') {
                if(!useAdmin || useAdmin === 0)  {
                    await delegateTransactionTask();
                }
                callback({message: "Now saving your points..."});
                hash = await writeContractAsync({
                    abi,
                    functionName,
                    address: contractAddress,
                    account: (useAdmin && useAdmin > 0)? privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address) : account,
                    args,
                    value,
                    dataSuffix
                });
                hash = await waitForConfirmation(hash, '');
                await forwardBalances();         
                await setCompletion(functionName, useDivvi, hash);
            } else if(functionName === 'generateKey') {
                hash = await writeContractAsync({
                    abi,
                    functionName,
                    address: contractAddress,
                    account: account,
                    args,
                    dataSuffix,
                    value
                });
                hash = await waitForConfirmation(hash, '');
                await setCompletion(functionName, useDivvi, hash);
            } else {
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
            }
        } catch (error) {
            console.log("ErrorOccured: ", error);
            setmessage("Oops! We are unable to complete your transaction. Please send us feedback on Telegram @cryptopreach");
            finalize();
        }
    }

    /**
     * @dev Broadcast transaction to the blockchain and wait for confirmation up to 2 confirmation blocks
     */
    const handleSendTransaction = async() => {
        if(!isConnected) return callback({errorMessage: 'Please connect wallet'});
        toggleLoading(true);
        const transactions = getTransactions();
        for( let i = 0; i < transactions.length; i++) {
            const {abi, value, functionName, contractAddress, args, useAdmin} = transactions[i];
            // if(functionName === 'recordPoints'){
            //     const campaignHash = result.other.quizId as Hex;
            //     if(!haskey){
            //         callback({message: "Oops! We can't find your key for this week. Requesting to generate a new key"});
            //         const { transactionData: td, contractAddresses: { Learna, GrowToken } } = filterTransactionData({chainId, filter: true, functionNames: ['generateKey']});
            //         await runTransaction({
            //             abi: td[0].abi, 
            //             contractAddress: formatAddr(Learna), 
            //             args: [formatAddr(GrowToken), [campaignHash]], 
            //             functionName, 
            //             value: VALUE, 
            //             requireArgUpdate: false, 
            //             useAdmin: 0,
            //         });
            //     }
            // }
            callback({message: 'Sending transaction to the network...'});
            await runTransaction({abi, contractAddress, args, functionName, value, requireArgUpdate: false, useAdmin});
        }
    }

    // Record points silently
    React.useEffect(() => {
        if(recordPoints && result.other.score > 0) {
            const { transactionData, contractAddresses: { GrowToken} } = filterTransactionData({chainId, filter: true, functionNames: ['recordPoints']});
            const td = transactionData[0];
            const sendScore = async() => {
                try {
                    callback({message: "We're saving your score"});
                    toggleDrawer(1);
                    toggleLoading(true);
                    const args : any[] = [account, result, result.other.quizId];
                    await runTransaction({abi: td.abi, contractAddress: td.contractAddress as Address, args, functionName: td.functionName as FunctionName, value: 0n, requireArgUpdate: false, useAdmin: 1});
                    callback({message: "Your scores was successfully updated"})
                } catch (error: any) {
                    console.log("Record Error", error?.message || error?.data?.message);
                    callback({errorMessage: "Something went wrong. We could not update your scores automatically. Please save it manually using the save button"})
                }
                finalize();
                toggleRecordPoints(false);
            }
            sendScore();
        } else {
            toggleRecordPoints(false);
            toggleDrawer(0);
            toggleLoading(false);
        }
    }, [recordPoints]);

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

