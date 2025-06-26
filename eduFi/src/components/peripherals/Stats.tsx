import React from "react";
import { useAccount } from "wagmi";
import { zeroAddress } from "viem";
import { Button } from "~/components/ui/button";
import CollapsibleComponent from "./Collapsible";
import SortWeeklyPayout from "./inputs/SortWeeklyPayoutInfo";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";
import AddressWrapper from "./AddressFormatter/AddressWrapper";
import { Address, formatValue, getTimeFromEpoch, WeekData, toBN } from "../utilities";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "~/components/ui/carousel";

function Stat({weekData} : {weekData: WeekData}) {
    const { 
        activeLearners, 
        claim: { claimActiveUntil, erc20, erc20Addr, native, transitionDate },
        tippers, 
        totalPoints, 
        transitionInterval } = weekData;

    // const intervalBeforeSorted = transitionInterval > 0? transitionInterval / 360 : transitionInterval;
    const interval = toBN(transitionInterval.toString()).toNumber();

    return(
        <MotionDisplayWrapper>
            <div className=" space-y-2" key={claimActiveUntil}>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Active users</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{activeLearners.toString() || '0'}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Total Points</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{totalPoints.toString() || '0'}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Minimum interval before sorted</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{`${interval || '0'} Minutes`}</h3>
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Payout data</h3>
                    <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                        <h3 className="w-[50%]">Time until claim close</h3>
                        <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{getTimeFromEpoch(claimActiveUntil)}</h3>
                    </div>
                    <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                        <h3 className="w-[50%]">Time until sorted</h3>
                        <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{getTimeFromEpoch(transitionDate)}</h3>
                    </div>
                    <div className='border p-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                        <h3 className="w-[50%]">Token address</h3>
                        <AddressWrapper account={erc20Addr} size={4} display/> 
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">ERC20 token claims</h3>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3 className="w-[50%]">Total allocated</h3>
                            <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{formatValue(erc20.totalAllocated.toString()).toStr || '0'}</h3>
                        </div>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3 className="w-[50%]">Total claimed</h3>
                            <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{formatValue(erc20.totalClaimed.toString()).toStr || '0'}</h3>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">{"Claims in $Celo"}</h3>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3 className="w-[50%]">Total allocated</h3>
                            <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{formatValue(native.totalAllocated.toString()).toStr || '0'}</h3>
                        </div>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3 className="w-[50%]">Total claimed</h3>
                            <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{formatValue(native.totalClaimed.toString()).toStr || '0'}</h3>
                        </div>
                    </div>
                </div>
                {
                    (tippers && tippers.length > 0) &&  <div className="space-y-2 border p-4 rounded-xl">
                        <h3 className="text-sm font-semibold">Tippers</h3>
                        <Carousel className="w-full max-w-xs relative">
                            <CarouselContent>
                                {
                                    tippers.map(({id, lastTippedDate, points, totalTipped}) => (
                                        <CarouselItem key={id}>
                                            <div className="place-items-center text-center font-mono">
                                                <h3 className="text-sm h-[60px] p3 rounded-t-xl">
                                                    <AddressWrapper account={id} size={4} display/>
                                                </h3>
                                                <div className="w-full space-y-2 h-fit text-xs">
                                                    <div className='border rounded-lg flex justify-between items-center text-xs font-mono'>
                                                        <h3 className="w-[50%]">Amount tipped</h3>
                                                        <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{formatValue(totalTipped.toString()).toStr || '0'}</h3>
                                                    </div>
                                                    <div className='border rounded-lg flex justify-between items-center text-xs font-mono'>
                                                        <h3 className="w-[50%]">Date tipped</h3>
                                                        <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{getTimeFromEpoch(lastTippedDate)}</h3>
                                                    </div>
                                                    <div className='border rounded-lg flex justify-between items-center text-xs font-mono'>
                                                        <h3 className="w-[50%]">Point earned</h3>
                                                        <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{points || '0'}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    ))
                                }
                            </CarouselContent>
                            <CarouselPrevious className="absolute -left-4 bg-cyan-900 text-cyan-50"/>
                            <CarouselNext className="absolute -right-4 bg-cyan-900 text-cyan-50"/>
                        </Carousel>
                    </div>
                }
            </div>
        </MotionDisplayWrapper>
    )
}

export default function Stats() {
    const account = useAccount().address as Address || zeroAddress;
    const {  
        setpath, 
        weekData,
        owner,
        state: { minimumToken, transitionInterval, weekCounter }
    } = useStorage();

    const backToHome = () => setpath('home');
    const interval = toBN(transitionInterval.toString()).toNumber();

    return(
        <MotionDisplayWrapper className="space-y-2 font-mono">
            <div className="space-y-2 border bg-cyan-500/20 rounded-lg p-4">
                <h3 className="text-sm font-bold pl-4">{`App stats`}</h3>
                <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Current Week</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{weekCounter.toString() || 0}</h3>
                </div>
                <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Transition interval</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{`${interval / 60 || 0} Minutes`}</h3>
                </div>
                <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Minimum token</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{`${formatValue(minimumToken.toString()).toStr || 0} Celo`}</h3>
                </div> 
            </div>
            
            <div className="space-y-2 border bg-cyan-500/20 rounded-lg p-4">
                <h3 className="text-sm font-semibold pl-4">Week Data</h3>
                {
                    weekData.length && weekData.map((wkd, index) => (
                        <CollapsibleComponent 
                            key={index}
                            header={`Week ${index}`}
                        >
                            <Stat weekData={wkd}/>
                        </CollapsibleComponent>
                    ))
                }
                
            </div>
            { (account.toLowerCase() === owner.toLowerCase()) && <SortWeeklyPayout />  }
            <div className="flex justify-center items-center gap-1 w-full">
                <Button onClick={backToHome} variant={'outline'} className="w-full bg-orange-500/50 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Exit</Button>
            </div>
        </MotionDisplayWrapper>
    );
}