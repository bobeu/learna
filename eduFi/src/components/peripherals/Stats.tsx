import React from "react";
import { useAccount } from "wagmi";
import { zeroAddress } from "viem";
// import { Button } from "~/components/ui/button";
import CollapsibleComponent from "./Collapsible";
import SortWeeklyPayout from "./inputs/SortWeeklyPayoutInfo";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";
import AddressWrapper from "./AddressFormatter/AddressWrapper";
import { formatValue, getTimeFromEpoch, toBN } from "../utilities";
// import {
//     Carousel,
//     CarouselContent,
//     CarouselItem,
//     CarouselNext,
//     CarouselPrevious,
// } from "~/components/ui/carousel";
import { Address, Campaign } from "../../../types/quiz";
import Wrapper2xl from "./Wrapper2xl";
import { Timer, Fuel, Calendar, BaggageClaim} from "lucide-react";
import CustomButton from "./CustomButton";

function Stat({campaign, index, campaignName} : {campaign: Campaign, index: number, campaignName: string}) {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const { 
            activeLearners, 
            claimActiveUntil,
            transitionDate,
            totalPoints, 
            canClaim,
            fundsERC20,
            fundsNative,
            lastUpdated,
            // operator,
            token
         } = campaign;

    // const intervalBeforeSorted = transitionInterval > 0? transitionInterval / 360 : transitionInterval;
    // const interval = toBN(transitionInterval.toString()).toNumber();
    const toggleOpen = (arg: boolean) => {
        setIsOpen(arg);
    };

    return(
        <CollapsibleComponent 
            header={`${campaignName}`} 
            isOpen={isOpen} 
            toggleOpen={toggleOpen}
            overrideClassName="relative space-y-1"
            triggerClassName="capitalize bg-gradient-to-r border py-2 px-4 border rounded-xl font-semibold"
        >
            <MotionDisplayWrapper>
                {/* Timings */}
                <div className="grid grid-cols-3 gap-2 md:gap-6 mb-8">
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Calendar className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="font-semibold text-gray-800 mb-1">
                            {activeLearners.toString() || '0'}
                        </div>
                        <div className="text-xs text-gray-600">Active users</div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Timer className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="font-semibold text-gray-800 mb-1">
                            {totalPoints.toString() || '0'}
                        </div>
                        <div className="text-xs text-gray-600">All points</div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Fuel className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="font-semibold text-gray-800 mb-1">
                            { getTimeFromEpoch(lastUpdated) }
                        </div>
                        <div className="text-xs text-gray-600">Last updated</div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Fuel className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="font-semibold text-gray-800 mb-1">
                            {getTimeFromEpoch(claimActiveUntil)}
                        </div>
                        <div className="text-xs text-gray-600">Claimable until</div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Fuel className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="font-semibold text-gray-800 mb-1">
                            {getTimeFromEpoch(transitionDate)}
                        </div>
                        <div className="text-xs text-gray-600">Date until sorting active</div>
                    </div>

                     <div className={`glass-card rounded-xl p-4 ${canClaim? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-center mb-3">
                            <BaggageClaim className={`w-5 h-5`} />
                            <h3>{canClaim? 'Ready' : 'Not Ready'}</h3>
                        </div>
                         <div className="font-semibold text-gray-800 mb-1">
                            {getTimeFromEpoch(claimActiveUntil)}
                        </div>
                        <div className="text-xs text-cyan-600">Claim ends</div>
                    </div>
                </div>

                {/* Allocations */}
                <div className="space-y-4">
                    <div className="text-lg text-left font-semibold text-gray-800 mb-2">Funds</div>
                    <div className="grid grid-cols-2 gap-2 md:gap-6 mb-8">
                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-center mb-3">
                                <Fuel className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="font-semibold text-gray-800 mb-1">
                                {formatValue(fundsERC20.toString()).toStr || '0'} 
                            </div>
                            <div className="text-xs text-gray-600">ERC20 balance after claim</div>
                        </div>

                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-center mb-3">
                                <Fuel className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="font-semibold text-gray-800 mb-1">
                                {formatValue(fundsNative.toString()).toStr || '0'} 
                            </div>
                            <div className="text-xs text-gray-600">$CELO balance after claim</div>
                        </div>
                        
                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-center mb-3">
                                <Fuel className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="font-semibold text-gray-800 mb-1">
                                <AddressWrapper account={token} size={4} display/> 
                            </div>
                            <div className="text-xs text-gray-600">Funded asset</div>
                        </div>
                    </div>
                </div>

                {/* Claims
                <div className="space-y-4 ">
                    <div className="text-lg text-left font-semibold text-gray-800 my-2">Claims</div>
                   
                    <div className="grid grid-cols-2 gap-3">
                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-center mb-3">
                                <Fuel className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="font-semibold text-gray-800 mb-1">
                                {formatValue(erc20.totalClaimed.toString()).toStr || '0'}
                            </div>
                            <div className="text-xs text-gray-600">$GROW Claimed</div>
                        </div>
                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-center mb-3">
                                <Fuel className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="font-semibold text-gray-800 mb-1">
                                {formatValue(native.totalAllocated.toString()).toStr || '0'}
                            </div>
                            <div className="text-xs text-gray-600">$CELO Claimed</div>
                        </div>
                    </div>
                </div> */}
                {/* <div className="bg-gradient-to-r my-4 flex justify-center items-center py-6 glass-card rounded-2xl ">
                    {
                        (tippers && tippers.length > 0) &&  <div className="space-y-2 ">
                            <h3 className="text-lg font-semibold">Tippers</h3>
                            <Carousel className="w-full max-w-xs relative">
                                <CarouselContent>
                                    {
                                        tippers.map(({id, lastTippedDate, points, totalTipped}) => (
                                            <CarouselItem key={id}>
                                                <div className="place-items-center text-center ">
                                                    <h3 className="p-4">
                                                        <AddressWrapper account={id} size={4} display   />
                                                    </h3>
                                                    <div className="w-full space-y-2 h-fit text-sm">
                                                        <div className='border border-purple-100 rounded-lg flex justify-between items-center text-xs font-mono'>
                                                            <h3 className="w-[50%]">Amount tipped</h3>
                                                            <h3 className='btn-primary text-white rounded-r-lg p-4 font-bold w-[50%] text-center'>{formatValue(totalTipped.toString()).toStr || '0'}</h3>
                                                        </div>
                                                        <div className='border border-purple-100 rounded-lg flex justify-between items-center text-xs font-mono'>
                                                            <h3 className="w-[50%]">Date tipped</h3>
                                                            <h3 className='btn-primary text-white rounded-r-lg p-4 font-bold w-[50%] text-center'>{getTimeFromEpoch(lastTippedDate)}</h3>
                                                        </div>
                                                        <div className='border border-purple-100 rounded-lg flex justify-between items-center text-xs font-mono'>
                                                            <h3 className="w-[50%]">Point earned</h3>
                                                            <h3 className='btn-primary text-white rounded-r-lg p-4 font-bold w-[50%] text-center'>{points || '0'}</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CarouselItem>
                                        ))
                                    }
                                </CarouselContent>
                                <CarouselPrevious className="absolute -left-4 btn-primary text-cyan-50"/>
                                <CarouselNext className="absolute -right-4 btn-primary text-cyan-50"/>
                            </Carousel>
                        </div>
                    }
                </div> */}
            </MotionDisplayWrapper>
        </CollapsibleComponent>
    )
}

export default function Stats() {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    const account = useAccount().address as Address || zeroAddress;
    const {  
        setpath, 
        weekData,
        campaignStrings,
        owner,
        state: { minimumToken, transitionInterval, weekCounter }
    } = useStorage();
    const { isConnected } = useAccount();

    // console.log("WeekData", weekData)

    const toggleOpen = (arg: boolean) => {
        setIsOpen(arg);
    }

    const backToHome = () => {
        isConnected? setpath('dashboard') : setpath('home');
    }
    const interval = toBN(transitionInterval.toString()).toNumber();

    const renderWeekData = React.useCallback(() => {
        return weekData.map(({campaigns}, weekId) => (
            <CollapsibleComponent 
                key={weekId}
                header={`Week ${weekId}`} 
                isOpen={isOpen} 
                toggleOpen={toggleOpen}
                overrideClassName="relative font-mono"
                triggerClassName="bg-gradient-to-r from-cyan-500 to-purple-500 py-2 px-4 border rounded-xl text-white font-semibold"
            >
                <MotionDisplayWrapper>
                    <div className="text-xl text-left font-bold text-gray-800 mb-2">Campaigns</div>
                    <div className="space-y-1">
                        {
                            campaigns.map((campaign, index) => (
                                <Stat 
                                    key={index}
                                    index={index}
                                    campaign={campaign}
                                    campaignName={campaignStrings[index]}
                                />
                            ))
                        }
                    </div>
                </MotionDisplayWrapper>
            </CollapsibleComponent>
        ))
    }, [weekData, isOpen, toggleOpen ]);

    return(
        <Wrapper2xl useMinHeight={true} >
            <div className="text-3xl text-left font-bold text-gray-800 mb-4">Analytics</div>
            <div className="grid grid-cols-2 gap-2 md:gap-6 mb-8">
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                        {weekCounter.toString() || 0}
                    </div>
                    <div className="text-sm text-gray-600">Current week</div>
                </div>

                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Timer className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                        {`${interval / 60 || 0} Minutes`}
                    </div>
                    <div className="text-sm text-gray-600">Transition interval</div>
                </div>

                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Fuel className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                        {`${formatValue(minimumToken.toString()).toStr || 0} Celo`}
                    </div>
                    <div className="text-sm text-gray-600">Min. Token</div>
                </div>
            </div>
            
            <div className="space-y-1 mb-4">
                <div className="text-2xl text-left font-bold text-gray-800 mb-2">Weeks Data</div>
                <div className="border rounded-2xl p-4">
                    { renderWeekData() }
                </div>
                
            </div>
            <div className="flex justify-center items-center w-full" >
                { (account.toLowerCase() !== zeroAddress && account.toLowerCase() === owner.toLowerCase()) && <SortWeeklyPayout />  }
            </div>
            <div className="flex justify-center items-center gap-1 w-full">
                <CustomButton
                    exit={true}
                    onClick={backToHome}
                    disabled={false}
                >
                    <span>Exit</span>
                </CustomButton>
            </div>
        </Wrapper2xl>
    );
}