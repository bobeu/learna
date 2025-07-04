import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import useStorage from "../hooks/useStorage";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import { useChainId, } from "wagmi";
import { filterTransactionData, toBigInt } from "../utilities";
import { Confirmation, type Transaction } from "./Confirmation";
import { parseUnits } from "viem";
import { Address, FunctionName } from "../../../types/quiz";
import Wrapper2xl from "./Wrapper2xl";
import CollapsibleComponent from "./Collapsible";
import CustomButton from "./CustomButton";
import { Info } from "lucide-react";

export default function SendTip() {
    const [ showSendCelo, setShowSendCelo ] = React.useState<boolean>(false);
    const [ openDrawer, setDrawer ] = React.useState<number>(0);
    const [ celoAmount, setCeloAmount ] = React.useState<string>('0');
    const [ protocol, setProtocol ] = React.useState<string | undefined>(undefined);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    const { setpath, appData } = useStorage();
    const toggleDrawer = (arg: number) => {
        setDrawer(arg);
    }
    const toggleOpen = (arg: boolean) => setIsOpen(arg);
    const backToDashboard = () => setpath('dashboard');
    const chainId = useChainId();
    
    const handleSubmit = () => {
        if(celoAmount === '0') return alert('Please enter amount');
        setDrawer(1);
    }

    React.useEffect(
        () => {
            if(protocol !== undefined){
                setTimeout(() => 
                    setShowSendCelo(true), 
                    500
                );
            }
            return () => clearTimeout(500);
        },
        [protocol]
    );

    const getTransactions = React.useCallback(() => {
        const functionName: FunctionName = 'tip';
        const transactions : Transaction[] = [];
        const { contractAddresses : ca, transactionData} = filterTransactionData({chainId, filter: true, functionNames:[functionName],})
        const contractAddress = ca.Learna as Address;
        if(showSendCelo) {
            transactions.push({
                abi: transactionData[0].abi,
                args: [protocol],
                contractAddress,
                functionName,
                requireArgUpdate: false,
                value: toBigInt(celoAmount)
            })
        }
        return transactions;
    }, [showSendCelo, chainId, protocol, celoAmount]);

    const protocols = (
        <CollapsibleComponent
            isOpen={isOpen}
            toggleOpen={toggleOpen}
            header="Select your protocol"
            selected={protocol}
            overrideClassName="relati"
            triggerClassName="border rounded-xl p-4 bg-gradient-to-r from-cyan-400 to-purple-300"
        >
            <div className="absolute top-10 slide-in-from-top-10 p-4 bg-white z-[100px] border rounded-xl max-h-[250px] overflow-hidden md:overflow-auto">
                {
                    appData.categories.map((protocol_) => (
                        <Button 
                            key={protocol_}
                            onClick={() => {
                                setProtocol(protocol_);
                                setIsOpen(!isOpen)
                            }}
                            variant={'ghost'}
                            className="w-1/3 p-6"
                        >
                            { protocol_ }
                        </Button>
                    ))
                }
            </div>
        </CollapsibleComponent>
    );

    return(
        <MotionDisplayWrapper>
            <Wrapper2xl useMinHeight={true} >
                <div className='relative space-y-4 overflow-auto font-mono'>
                    {
                        !showSendCelo && 
                            <div className="flex flex-col justify-center items-center text-center text-2xl gap-4">
                                <h3>Encourage deep and fast learning about your protocol or tech by funding your pool. Our system is decentralized and transparent. </h3>
                                <Image 
                                    src={'/support.svg'}
                                    alt="support image"
                                    width={150}
                                    height={150}
                                />
                            </div>
                    }
                    {
                        showSendCelo && <MotionDisplayWrapper>
                            <div className='space-y-4 border rounded-2xl p-4'> 
                                <div className="flex justify-between items-center gap-4 text-lg bg-gradient-to-r px-3 py-6 rounded-xl">
                                    <h3 className='w-2/4'>{`You're funding: `}</h3>
                                    <h3 className='w-2/4 capitalize font-medium'>{protocol}</h3>
                                </div>
                                <div className="flex justify-between items-center gap-4">
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
                                    <Button variant={'ghost'} className='w-full bg-white text-lg p-6' onClick={handleSubmit}>Submit</Button>
                                </div>
                            </div>
                            
                        </MotionDisplayWrapper>
                    }
                    <div className="space-y-2">
                        { protocols }
                        {/* <Button disabled={showSendCelo} onClick={() => setShowSendCelo(true)} variant={'outline'} className="w-full bg-cyan-500/80">Send Celo</Button> */}
                        <CustomButton
                            onClick={backToDashboard}
                            disabled={false}
                            exit={true}
                            overrideClassName="w-full"
                        >
                            <span>Exit</span>
                        </CustomButton>
                    </div>
                    <div className="border flex justify-between rounded-2xl">
                        <div className="flex justify-center items-center p-4">
                            <Info className="w-7 h-7 text-cyan-500 font-bold" />
                        </div>
                        <h3 className="text-sm text-center p-4 text-cyan-900">Tokens or Coins sent as support are shared as payout to all active users</h3>
                    </div>
                </div>
            </Wrapper2xl>
            <Confirmation 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                getTransactions={getTransactions}
            />
        </MotionDisplayWrapper>
    );
}