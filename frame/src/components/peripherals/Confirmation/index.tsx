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
        ({ getTransactions, openDrawer, toggleDrawer}) => 
{   
    const [loading, setLoading] = React.useState<boolean>(false);
    const [completed, setIsCompleted] = React.useState<boolean>(false);

    const { setmessage, setError, setpath, setTransactionDone, refetch } = useStorage();
    const { address, isConnected } = useAccount();
    const config = useConfig(); 
    const account = address as Address;

    // Reset the messages and error messages in state, and close the drawer when transaction is completed
    const handleCloseDrawer = () => {
        toggleDrawer();
        setmessage('');
        setError('');
    };

    // Wait for sometime before resetting the state after completing a transaction
    const setCompletion = () => {
        setLoading(false);
        setIsCompleted(true);
        refetch().then((res) => {console.log(res.isSuccess)})
    };

    // Call this function when transaction successfully completed
    const onSuccess = (hash: Address) => {
        setmessage(`Completed request with hash: ${hash.substring(0, 8)}...`);
        setCompletion();
    };

    // When error occurred, run this function
    const onError = async(error: WriteContractErrorType) => {
        setError(error.message);
        setCompletion();
    }

    const { writeContractAsync, } = useWriteContract({
        config, 
        mutation: { 
            onError: (error) => onError(error), 
            onSuccess: (hash, variables) => {
                const functionName = variables.functionName as FunctionName;
                onSuccess(hash);
                if(functionName === 'generateKey') setTransactionDone(true);
            }
        }
    });

    // Prepare send transaction
    const { sendTransactionAsync } = useSendTransaction({
        config,
        mutation: { 
            onSuccess: (hash) => {
                setmessage(`Delegation completed with hash: /n ${hash}`);
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
        console.log("account11",account);
        for( let i = 0; i < transactions.length; i++) {
            const {abi, value, functionName, contractAddress: address, args} = transactions[i];
            setmessage(`Broadcasting...`);
            switch (functionName) {
                case 'recordPoints':
                    const viemAccountObj = privateKeyToAccount(process.env.NEXT_PUBLIC_ADMIN_0xC0F as Address);
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
                        value
                    });
                    await waitForTransactionReceipt(config, {hash: hash_, confirmations: 2});
                    break;
                case 'sortWeeklyReward':
                    const hash1 = await writeContractAsync({
                        abi,
                        functionName,
                        address,
                        account,
                        args,
                        value
                    });
                    await waitForTransactionReceipt(config, {hash: hash1, confirmations: 2});
                    break;
            
                default:
                    const resultHash = await writeContractAsync({
                        abi,
                        functionName,
                        address,
                        account,
                        args,
                        value
                    });
                    await waitForTransactionReceipt(config, { hash: resultHash, confirmations: 2 });
                    break;
            }
        }
    }

    React.useEffect(() => {
        if(completed){
            const timeoutObj = setTimeout(() => {
                handleCloseDrawer();
                setIsCompleted(false);
                setpath('profile'); 
            }, 6000);
            clearTimeout(timeoutObj);
        }
    }, [completed, handleCloseDrawer, setIsCompleted, setpath]);

    return (
        <Drawer 
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            title={ !loading? 'Transaction request' : 'Transaction sent' }
        >
            <div className="bg-white1 dark:bg-green1/90 space-y-4 text-green1/90 dark:text-orange-300 text-center">
                <Message />
                <Button variant={'outline'} disabled={loading || completed} className="w-full max-w-sm dark:text-orange-200" onClick={handleSendTransaction}>{loading? <Spinner color={"white"} /> : 'Proceed'}</Button>
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
    toggleDrawer: () => void;
    openDrawer: boolean;
    getTransactions: () => Transaction[];
    setDone: boolean;
}
