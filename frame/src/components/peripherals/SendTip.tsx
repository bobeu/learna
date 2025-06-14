import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import useStorage from "../StorageContextProvider/useStorage";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import Drawer from "./Confirmation/Drawer";
import { useAccount, useChainId, useSendTransaction, useWriteContract } from "wagmi";
import Message from "./Message";
import { Address, filterTransactionData, FunctionName, toBigInt } from "../utilities";
import { Confirmation, type Transaction } from "./Confirmation";
import { parseUnits } from "viem";

export default function SendTip() {
    const [ showSendCelo, setShowSendCelo ] = React.useState<boolean>(false);
    const [ openDrawer, setDrawer ] = React.useState<boolean>(false);
    const [ celoAmount, setCeloAmount ] = React.useState<string>('0');
    const { setpath } = useStorage();
    const toggleDrawer = () => setDrawer(!openDrawer);
    const backToHome = () => setpath('home');
    const chainId = useChainId();
    
    const handleSubmit = () => {
        if(celoAmount === '0') return alert('Please enter amount');
        setDrawer(true);
    }

    const getTransactions = React.useCallback(() => {
        const functionName: FunctionName = 'tip';
        let transactions : Transaction[] = [];
        const { contractAddresses : ca, transactionData} = filterTransactionData({chainId, filter: true, functionNames:[functionName],})
        const contractAddress = ca.Learna as Address;
        if(showSendCelo) {
            transactions.push({
                abi: transactionData[0].abi,
                args: [],
                contractAddress,
                functionName,
                requireArgUpdate: false,
                value: toBigInt(celoAmount)
            })
        }
        return transactions;
    }, [showSendCelo, filterTransactionData, chainId, celoAmount]);

    return(
        <MotionDisplayWrapper>
            <div className='space-y-4 max-w-[300px] overflow-auto'>
                <div className="relative flex justify-between items-center text-cyan-600 bg-cyan-300/10 rounded-xl p-2 gap-2">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                    </span>
                    <h3 className="text-[10px] text-center">Tokens or Coins sent as support are shared as payout to all active users</h3>
                </div>
                {
                    !showSendCelo && 
                        <MotionDisplayWrapper className="flex flex-col justify-center items-center text-center gap-4 text- font-semibold bg-purple-500/50 text-cyan-700 rounded-xl p-4">
                            <h3>Support us by sending tip in Celo. Our system is decentralized and transparent. </h3>
                            <Image 
                                src={'/support.svg'}
                                alt="support image"
                                width={150}
                                height={150}
                            />
                        </MotionDisplayWrapper>
                }
                {
                    showSendCelo && <MotionDisplayWrapper>
                        <div className='space-y-2 rounded-xl p-4 bg-cyan-300/5'>
                            <h3 className='font-semibold text-sm'>{`Enter tip amount e.g 1 = 1 CELO`}</h3>
                            <Input 
                                type={'text'}
                                placeholder={'Amount'}
                                required
                                id={'Celo'}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setCeloAmount(parseUnits(e.target.value, 18).toString());
                                }}
                                className={`bg-white1 text-xs border border-green1/30 focus:ring-0 `}
                            />
                        </div>
                        <Button variant={'outline'} className='w-full bg-cyan-500' onClick={handleSubmit}>Submit</Button>
                    </MotionDisplayWrapper>
                }
                <div className=" space-y-2">
                    <Button disabled={showSendCelo} onClick={() => setShowSendCelo(true)} variant={'outline'} className="w-full bg-purple-500/50">Send Celo</Button>
                    <Button onClick={backToHome} variant={'outline'} className="w-full bg-orange-500/30">Exit</Button>
                </div>
            </div>
            <Confirmation 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                getTransactions={getTransactions}
                setDone
            />
        </MotionDisplayWrapper>
    );
}