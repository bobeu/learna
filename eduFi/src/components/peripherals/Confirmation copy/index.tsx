// import React from "react";
// import { Spinner } from "@/components/utilities/Spinner";
// import useAppStorage from "@/components/contexts/StateContextProvider/useAppStorage";
// import Drawer from '../Confirmation/Drawer';
// import Message from "@/components/utilities/Message";
// import { Address, FunctionName, VoidFunc } from "@/interfaces";
// import { Button } from "@/components/ui/button";
// import { useTheme } from "next-themes";
// import { formatAddr, getDivviReferralUtilities } from "@/utilities";
// import { useAccount, useChainId, useConfig, useWriteContract } from "wagmi";
// import { WriteContractErrorType, waitForTransactionReceipt } from "wagmi/actions";
// import { displayMessages } from "@/constants";
// import { celo } from "wagmi/chains";

// export const Confirmation : 
//     React.FC<ConfirmationProps> = 
//         ({ getTransactions, back, toggleDrawer, lastStepInList, openDrawer, displayMessage, optionalDisplay, actionButtonText}) => 
// {   
//     const [loading, setLoading] = React.useState<boolean>(false);

//     const { setActivepath, refetch, setmessage, setError } = useAppStorage();
//     const isDark = useTheme().theme === 'dark';
//     const { address, isConnected } = useAccount();
//     const account = formatAddr(address);
//     const config = useConfig();
//     const chainId = useChainId();

//     // Reset the messages and error messages in state, and close the drawer when transaction is completed
//     const handleCloseDrawer = () => {
//         setmessage('');
//         setError('');
//         toggleDrawer(0);
//     };

//     // Wait for sometime before resetting the state after completing a transaction
//     const setCompletion = async(functionName: FunctionName) => {
//         await refetch();
//         setLoading(false);
//         setTimeout(() => {
//             handleCloseDrawer();
//             back?.();
//             if(functionName === 'createPool') setActivepath('Flexpool');
//         }, 6000);
//         clearTimeout(6000);
//     };

//     // Call this function when transaction successfully completed
//     const onSuccess = (data: Address, variables: any) => {
//         if(variables.functionName === lastStepInList){
//             const functionName = variables.functionName as string;
//             setmessage(`${displayMessages[functionName].end}.\n With hash: /n ${data}`);
//             // setmessage(`Completed ${functionName.toWellFormed()} with hash: ${data.substring(0, 16)}...`)
//             setCompletion(variables.functionName as FunctionName);
//         } else {
//             setmessage(`Completed ${variables.functionName} request with: ${data.substring(0, 8)}...`);
//         }
//     };

    
//     const { writeContractAsync: retry} = useWriteContract({
//         config,
//         mutation: { 
//             onSuccess, 
//             onError : (error, variables) => {
//                 setError(error.message);
//                 setCompletion(variables.functionName as FunctionName);
//             }
//         }
//     });

//     // const { data, refetch } = useWaitForTransactionReceipt();

//     const onError = async(error: WriteContractErrorType, variables: any) => {
//         if(variables.functionName !== lastStepInList){
//             setError('')
//             setmessage(`${variables.functionName.toLocaleUpperCase()} failed!. Retrying ${lastStepInList}...`);
//             const transactions = getTransactions();
//             const { abi, functionName, args: inArgs, value, requireArgUpdate, refetchArgs, contractAddress,  } = transactions[transactions.length - 1];
//             let args = inArgs;
//             let value_ = value;
//             if(requireArgUpdate) {
//                 const result = await refetchArgs?.(functionName);
//                 args = result?.args || [];
//                 value_ = result?.value;
//             }
//             await retry({
//                 abi,
//                 functionName,
//                 address: contractAddress,
//                 account,
//                 args,
//                 value: value_
//             })
//             setCompletion(variables.functionName as FunctionName);

//         } else {
//             setError(error.message);
//             setCompletion(variables.functionName as FunctionName);
//         }
//     }

//     const { writeContractAsync, } = useWriteContract({
//         config, 
//         mutation: { onError, onSuccess }
//     });

//     /**
//      * @dev Broadcast a transaction to the blockchain with Divvi referral processing
//      *  @param arg: Parameter of type Transaction
//      */
//     const runTransaction = async(
//         arg: {
//                 abi: any[] | [], 
//                 functionName: FunctionName,
//                 args: any[] | Readonly<any[]>, 
//                 contractAddress: Address,
//                 value?: bigint;
//             }, 
//             message: string
//     ) => {
//         const { abi, functionName, args, contractAddress, value } = arg;
//         const { getDataSuffix, submitReferralData } = getDivviReferralUtilities();
//         const useDivvi = chainId === celo.id;
//         const dataSuffix = useDivvi? getDataSuffix() : undefined;
//         setmessage(message);
//         const hash = await writeContractAsync({
//             abi,
//             functionName,
//             address:contractAddress,
//             account,
//             args,
//             value,
//             dataSuffix
//         });
//         let receipt = await waitForTransactionReceipt(
//             config,
//             { hash, confirmations: 2 }
//         );
//         if(useDivvi) {
//             const result = await submitReferralData(receipt.transactionHash, chainId);
//             console.log("Divvi Ref result:", result, "\n resultHash", receipt.transactionHash);
//         }
//     }

//     // handle send transaction event
//     const handleSendTransaction = async() => {
//         if(!isConnected) return setError('Please connect wallet');
//         setLoading(true);
//         const transactions = getTransactions();
//         for( let i = 0; i < transactions.length; i++) {
//             const {abi, value, functionName, refetchArgs, requireArgUpdate, contractAddress: address, args: inArgs} = transactions[i];
//             let args = inArgs;
//             let value_ = value;
//             let execute : number | undefined = 1;
//             if(requireArgUpdate) {
//                 const result = await refetchArgs?.(functionName);
//                 args = result?.args || [];
//                 value_ = result?.value;
//                 execute = result?.proceed;
//             }
//             if(execute === 1) {
//                 await runTransaction(
//                     {
//                         abi: [...abi],
//                         functionName,
//                         contractAddress: address,
//                         args,
//                         value: value_
//                     },
//                     `${displayMessages[functionName].start}.none`
//                 );
//             } else {
//                 setmessage(functionName === 'approve'? 'Previous approval was detected!' : `${functionName} was completed!`);
//             }
//         }
//     }

//     return (
//         <Drawer 
//             title={ !loading? (displayMessage || 'Transaction request') : 'Transaction sent' }
//             openDrawer={openDrawer} 
//             setDrawerState={toggleDrawer}
//             onClickAction={handleCloseDrawer}
//             styles={{padding:'22px', borderLeft: '1px solid #2e3231', height: "100%", background: isDark? '#121212' : '#F9F4F4'}}
//         >
//             <div className="bg-white1 dark:bg-green1/90 space-y-4 text-green1/90 dark:text-orange-300 text-center">
//                 { optionalDisplay && optionalDisplay }
//                 {/* {
//                     isGetFinance && !loading && <SelectComponent data='convertible' callback={setConvertible} label="Asset holding" placeholder="Which asset are you holding?"/>
//                 }  */}
//                 <Message />
//                 <Button variant={'outline'} disabled={loading} className="w-full max-w-sm dark:text-orange-200" onClick={handleSendTransaction}>{loading? <Spinner color={"white"} /> : actionButtonText || 'Proceed'}</Button>
//             </div>
//         </Drawer>
//     );
// }

// export type Transaction = {
//     functionName: FunctionName,
//     contractAddress: Address,
//     args: any[] | [],
//     requireArgUpdate: boolean;
//     abi: any[] | Readonly<any[]>;
//     value?: bigint;
//     refetchArgs?: (funcName: FunctionName) => Promise<{args: any[], value: bigint, proceed: number}>;
// };

// export interface ConfirmationProps {
//     toggleDrawer: (arg: number) => void;
//     openDrawer: number;
//     back?: VoidFunc;
//     optionalDisplay?: React.ReactNode;
//     displayMessage?: string;
//     actionButtonText?: string;
//     getTransactions: () => Transaction[];
//     lastStepInList: FunctionName;
// }
