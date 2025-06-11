import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import useStorage from "../StorageContextProvider/useStorage";
import { Address, filterTransactionData, formatValue, Profile as ProfileType, TransactionCallback } from "../utilities";
import { useAccount, useChainId, useConfig, useReadContracts } from "wagmi";
import AddressWrapper from "./AddressFormatter/AddressWrapper";
import GenerateKey from "../transactions/GenerateKey";
import ClaimWeeklyReward from "../transactions/ClaimWeeklyReward";

export default function Stats() {
    const [openDrawer, setDrawer] = React.useState<number>(0);

    const chainId = useChainId();
    const config = useConfig();
    const toggleDrawer = (arg:number) => setDrawer(arg);
    const account = useAccount().address as Address;
    const {  
        setpath, 
        weekId, 
        setmessage, 
        setError, 
        pastClaims, 
        state: { activeLearners, minimumToken, tippers, totalPoints }
    } = useStorage();

    const backToHome = () => setpath('home');
    const handleClaim = () => setDrawer(1);

    // const callback : TransactionCallback = (arg) => {
    //     if(arg.message) setmessage(arg.message);
    //     if(arg.errorMessage) setError(arg.errorMessage);
    // }
    
    return(
        <MotionDisplayWrapper className="space-y-2 font-mono">
            <h3 className="text-center text-2xl ">{`Stats ${weekId.toString()}`}</h3>
            <div className="space-y-2">
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Current Week</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[50%] text-center'>{weekId.toString() || 0}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Active users</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[50%] text-center'>{activeLearners.toString() || 0}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Minimum token</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[50%] text-center'>{minimumToken.toString() || 0}</h3>
                </div> 
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Total Points</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[50%] text-center'>{totalPoints.toString() || '0'}</h3>
                </div>
            </div>
            <div>
                <div>
                    {
                        tippers && tippers.length > 0 && <div className="space-y-4">
                            <h3 className="font-bold text-sm">Tippers</h3>
                            <div className="space-y-2">
                                {
                                    tippers.map(({points, totalTipped}) => (
                                        <div className="p-4 border border-cyan-500/10 ">
                                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                                <h3 className="w-[50%]">Amount</h3>
                                                <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[50%] text-center'>{formatValue(totalTipped?.toString()).toStr || '0'}</h3>
                                            </div>
                                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                                <h3 className="w-[50%]">Points earned</h3>
                                                <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[50%] text-center'>{points|| '0'}</h3>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                        </div>
                    }
                </div>
            </div>
           
            <div className="flex justify-center items-center gap-1 w-full">
                {/* <Button disabled={disableClaimButton} onClick={handleClaim} variant={'outline'} className="w-full bg-cyan-500 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Claim</Button> */}
                <Button onClick={backToHome} variant={'outline'} className="w-full bg-orange-500/50 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Exit</Button>
            </div>
        </MotionDisplayWrapper>
    );
}