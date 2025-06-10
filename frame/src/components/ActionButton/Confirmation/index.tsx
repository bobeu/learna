import React from "react";
import Drawer from './Drawer';
import { Button } from "~/components/ui/button";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { WriteContractErrorType, waitForTransactionReceipt } from "wagmi/actions";
import { Address, FunctionName } from "~/components/utilities";
import useStorage from "~/components/StorageContextProvider/useStorage";
import Message from "~/components/peripherals/Message";
import { Spinner } from "~/components/peripherals/Spinner";

export const Confirmation : 
    React.FC<ConfirmationProps> = 
        ({ getTransactions, back, toggleDrawer, lastStepInList, openDrawer, displayMessage, optionalDisplay, actionButtonText}) => 
{   
    const [loading, setLoading] = React.useState<boolean>(false);

    const { setmessage, setError } = useStorage();
    const { address, isConnected } = useAccount();
    const config = useConfig(); 

    // Reset the messages and error messages in state, and close the drawer when transaction is completed
    const handleCloseDrawer = () => {
        setmessage('');
        setError('');
        toggleDrawer(0);
    };

    // Wait for sometime before resetting the state after completing a transaction
    const setCompletion = async(functionName: FunctionName) => {
        // await refetch();
        setLoading(false);
        setTimeout(() => {
            handleCloseDrawer();
            back?.();
            // if(functionName === 'createPool') setActivepath('Flexpool');
        }, 6000);
        clearTimeout(6000);
    };

    // Call this function when transaction successfully completed
    const onSuccess = (data: Address, variables: any) => {
        if(variables.functionName === lastStepInList){
            // const functionName = variables.functionName as string;
            setmessage(`Completed with hash: /n ${data}`);
            // setmessage(`Completed ${functionName.toWellFormed()} with hash: ${data.substring(0, 16)}...`)
            setCompletion(variables.functionName as FunctionName);
        } else {
            setmessage(`Completed ${variables.functionName} request with: ${data.substring(0, 8)}...`);
        }
    };

    
    const { writeContractAsync: retry} = useWriteContract({
        config,
        mutation: { 
            onSuccess, 
            onError : (error, variables) => {
                setError(error.message);
                setCompletion(variables.functionName as FunctionName);
            }
        }
    });

    // const { data, refetch } = useWaitForTransactionReceipt();

    const onError = async(error: WriteContractErrorType, variables: any) => {
        if(variables.functionName !== lastStepInList){
            setError('')
            setmessage(`${variables.functionName.toLocaleUpperCase()} failed!. Retrying ${lastStepInList}...`);
            const transactions = getTransactions();
            const { abi, functionName, args: inArgs, value, requireArgUpdate, refetchArgs, contractAddress,  } = transactions[transactions.length - 1];
            let args = inArgs;
            let value_ = value;
            if(requireArgUpdate) {
                const result = await refetchArgs?.(functionName);
                args = result?.args || [];
                value_ = result?.value;
            }
            await retry({
                abi,
                functionName,
                address: contractAddress,
                account: address,
                args,
                value: value_
            })
            setCompletion(variables.functionName as FunctionName);

        } else {
            setError(error.message);
            setCompletion(variables.functionName as FunctionName);
        }
    }

    const { writeContractAsync, } = useWriteContract({
        config, 
        mutation: { onError, onSuccess }
    });

    const handleSendTransaction = async() => {
        if(!isConnected) return setError('Please connect wallet');
        setLoading(true);
        const transactions = getTransactions();
        for( let i = 0; i < transactions.length; i++) {
            const {abi, value, functionName, refetchArgs, requireArgUpdate, contractAddress: address, args: inArgs} = transactions[i];
            let args = inArgs;
            let value_ = value;
            let execute : number | undefined = 1;
            if(requireArgUpdate) {
                const result = await refetchArgs?.(functionName);
                args = result?.args || [];
                value_ = result?.value;
                execute = result?.proceed;
            }
            // console.log("FuncName", functionName);
            // console.log("address", address);
            // console.log("Args", args);
            if(execute === 1) {
                setmessage(`Broadcasting...`);
                const hash = await writeContractAsync({
                    abi,
                    functionName,
                    address,
                    account: address as Address,
                    args,
                    value: value_
                });
                await waitForTransactionReceipt(
                    config,
                    { hash, confirmations: 2 }
                );
            } else {
                setmessage(`${functionName} was completed!`);
            }
        }
    }

    return (
        <Drawer 
            title={ !loading? (displayMessage || 'Transaction request') : 'Transaction sent' }
        >
            <div className="bg-white1 dark:bg-green1/90 space-y-4 text-green1/90 dark:text-orange-300 text-center">
                { optionalDisplay && optionalDisplay }
                {/* {
                    isGetFinance && !loading && <SelectComponent data='convertible' callback={setConvertible} label="Asset holding" placeholder="Which asset are you holding?"/>
                }  */}
                <Message />
                <Button variant={'outline'} disabled={loading} className="w-full max-w-sm dark:text-orange-200" onClick={handleSendTransaction}>{loading? <Spinner color={"white"} /> : actionButtonText || 'Proceed'}</Button>
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
    toggleDrawer: (arg: number) => void;
    openDrawer: number;
    back?: () => void;
    optionalDisplay?: React.ReactNode;
    displayMessage?: string;
    actionButtonText?: string;
    getTransactions: () => Transaction[];
    lastStepInList: FunctionName;
}
