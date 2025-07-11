/* eslint-disable */
import React from "react";
import { useAccount } from "wagmi";
import { zeroAddress } from "viem";
import CollapsibleComponent from "./Collapsible";
import SortWeeklyPayout from "./inputs/SortWeeklyPayoutInfo";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";
import AddressWrapper from "./AddressFormatter/AddressWrapper";
import { formatValue, getTimeFromEpoch, toBN } from "../utilities";
import { Address, Campaign } from "../../../types/quiz";
import Wrapper2xl from "./Wrapper2xl";
import { Timer, Fuel, Calendar, BaggageClaim} from "lucide-react";
import CustomButton from "./CustomButton";

function Stat({campaign, campaignName} : {campaign: Campaign, campaignName: string}) {
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
            token
         } = campaign;

    const toggleOpen = (arg: boolean) => {
        setIsOpen(arg);
    };

    return(
        <CollapsibleComponent 
            header={`${campaignName || ''}`} 
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

    const toggleOpen = (arg: boolean) => {
        setIsOpen(arg);
    }

    const backToHome = () => {
        if(isConnected) {
            setpath('dashboard');
        } else {
            setpath('home')
        }
            
    }
    const interval = toBN(transitionInterval.toString()).toNumber();

    const renderWeekData = React.useCallback(() => {
        return weekData.map(({campaigns}, weekId) => (
            <CollapsibleComponent 
                key={weekId.toString()}
                header={`Week ${weekId}`} 
                isOpen={isOpen} 
                toggleOpen={toggleOpen}
                overrideClassName="relative font-mono"
                triggerClassName="bg-gradient-to-r from-cyan-500 to-purple-500 py-2 px-4 border rounded-xl text-white font-semibold"
            >
                <MotionDisplayWrapper>
                    <div className="text-xl text-purple-900 text-left mb-2 pl-2 pt-4 ">Campaigns</div>
                    <div className="space-y-1">
                        {
                            campaigns && campaigns.map((campaign, index) => (
                                <Stat 
                                    key={campaign.hash_.slice(0, 15)}
                                    campaign={campaign}
                                    campaignName={campaignStrings[index]}
                                />
                            ))
                        }
                    </div>
                </MotionDisplayWrapper>
            </CollapsibleComponent>
        ))
    }, [weekData, isOpen, campaignStrings, toggleOpen ]);

    return(
        <Wrapper2xl useMinHeight={true} >
            <div className="text-3xl text-left font-bold text-gray-800 mb-4">Analytics</div>
            <div className="grid grid-cols-2 gap-2 md:gap-6 mb-8">
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                        {weekCounter.toString() || 0}
                    </div>
                    <div className="text-sm text-gray-600">Current week</div>
                </div>

                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Timer className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                        {`Every ${(interval / (60 * 60)) / 24 || 0} Days`}
                    </div>
                    <div className="text-sm text-gray-600">Transition interval</div>
                </div>

                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Fuel className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">
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