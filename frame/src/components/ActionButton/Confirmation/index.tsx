import React from "react";
import Drawer from './Drawer';
import { Button } from "~/components/ui/button";
import { useAccount, useConfig, useWriteContract, useSendTransaction } from "wagmi";
import { WriteContractErrorType, waitForTransactionReceipt } from "wagmi/actions";
import { Address, FunctionName } from "~/components/utilities";
import useStorage from "~/components/StorageContextProvider/useStorage";
import Message from "~/components/peripherals/Message";
import { Spinner } from "~/components/peripherals/Spinner";
import { privateKeyToAccount } from 'viem/accounts';
import { parseUnits } from "viem";

export const Confirmation : 
    React.FC<ConfirmationProps> = 
        ({ getTransactions, back, toggleDrawer, lastStepInList, displayMessage, optionalDisplay, actionButtonText}) => 
{   
    const [loading, setLoading] = React.useState<boolean>(false);

    const { setmessage, setError } = useStorage();
    const { address, isConnected } = useAccount();
    const config = useConfig(); 
    const account = address as Address;

    // Reset the messages and error messages in state, and close the drawer when transaction is completed
    const handleCloseDrawer = () => {
        setmessage('');
        setError('');
        toggleDrawer(0);
    };

    // Wait for sometime before resetting the state after completing a transaction
    const setCompletion = async() => {
        setLoading(false);
        setTimeout(() => {
            handleCloseDrawer();
            back?.();
        }, 6000);
        clearTimeout(6000);
    };

    // Call this function when transaction successfully completed
    const onSuccess = (data: Address, variables: any) => {
        if(variables.functionName === lastStepInList){
            setmessage(`Completed with hash: /n ${data}`);
            setCompletion();
        } else {
            setmessage(`Completed ${variables.functionName} request with: ${data.substring(0, 8)}...`);
        }
    };

    // When error occurred, run this function
    const onError = async(error: WriteContractErrorType) => {
        setError(error.message);
        setCompletion();
    }

    const { writeContractAsync, } = useWriteContract({
        config, 
        mutation: { onError, onSuccess }
    });

    // Prepare send transaction
    const { sendTransactionAsync } = useSendTransaction({
        config,
        mutation: { 
            onSuccess: (hash) => {
                setmessage(`Delegation completed with hash: /n ${hash}`);
                setCompletion();
            },
            onError(error) {
                setError(error.message);
                setCompletion();
            },
        }
    })

    /**
     * @dev Broadcast transaction to the blockchain and wait for confirmation up to 2 confirmation blocks
     * If function name or step is 'recordPoint', we switch to using the Admin or assigned agent to perform this task.
     * User must first delegate transaction fee to this account before it is executed.
     * @returns void
     */
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
                const viemAccountObj = privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address);
                switch (functionName) {
                    case 'recordPoints':
                        const hash = await sendTransactionAsync({
                            account,
                            to: viemAccountObj.address,
                            value: parseUnits('2', 16)
                        });
                        await waitForTransactionReceipt(config, {hash, confirmations: 2});
                        const hash_ = await writeContractAsync({
                            abi,
                            functionName,
                            address,
                            account: viemAccountObj,
                            args,
                            value: value_
                        });
                        await waitForTransactionReceipt(config, {hash: hash_, confirmations: 2});
                        break;
                
                    default:
                        const resultHash = await writeContractAsync({
                            abi,
                            functionName,
                            address,
                            account,
                            args,
                            value: value_
                        });
                        await waitForTransactionReceipt(config, { hash: resultHash, confirmations: 2 });
                        break;
                }
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
