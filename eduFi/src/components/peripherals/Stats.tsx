/* eslint-disable */
import React from "react";
import { useAccount } from "wagmi";
import { zeroAddress } from "viem";
import SortWeeklyPayout from "./inputs/SortWeeklyPayoutInfo";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";
import AddressWrapper from "./AddressFormatter/AddressWrapper";
import { formatValue, getTimeFromEpoch, toBN } from "../utilities";
import { Address, Campaign } from "../../../types/quiz";
import Wrapper2xl from "./Wrapper2xl";
import { Timer, Fuel, Calendar, BaggageClaim, ArrowLeftCircle, ArrowRightCircle} from "lucide-react";
import CustomButton from "./CustomButton";
import { SelectComponent } from "./SelectComponent";
import useProfile from "../hooks/useProfile";
import MinimumToken from "./inputs/MinimumToken";
import TransitionInterval from "./inputs/TransitionInterval";
import Admins from "./inputs/Admins";
import Pause from "../transactions/Pause";
import UnPause from "../transactions/UnPause";

function Stat({campaign, claimDeadline, transitionDate} : {campaign: Campaign, transitionDate: number, claimDeadline: number}) {
    const { 
        activeLearners, 
        totalPoints, 
        canClaim,
        fundsERC20,
        fundsNative,
        lastUpdated,
        token
    } = campaign;

    return(
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
                        {getTimeFromEpoch(claimDeadline)}
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
                        {getTimeFromEpoch(claimDeadline)}
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
    )
}

export default function Stats() {
    const [ openPausePopUp, setPausePopUp ] = React.useState<number>(0);
    const [ openUnPausePopUp, setUnPausePopUp ] = React.useState<number>(0);
    const [ action, setAction ] = React.useState<string>('none');

    const { returnObj: { claimDeadline, campaign }, setHash, setWeekId } = useProfile();
    const { 
        setpath, 
        owner,
        wkId,
        campaignStrings,
        userAdminStatus,
        campaignData,
        state: { transitionInterval, weekId, transitionDate }
    } = useStorage();

    const account = useAccount().address as Address || zeroAddress;
    const { isConnected } = useAccount();
    const weekIds = Array.from({length: wkId + 1}, (_: number, i: number) => i).map(q => q.toString());

    const backToHome = () => {
        if(isConnected) {
            setpath('dashboard');
        } else {
            setpath('home')
        }
    }

    const goToQuiz = () => {
        if(isConnected) {
            setpath('quiz');
        } else {
            setpath('home')
        }
    }

    const setCampaignStr = (arg: string) => {
        const fd = campaignData.filter(q => q.campaign === arg);
        if(fd) setHash(fd?.[0]?.campaignHash);
    }

    const setselectedWeek = (arg: string) => {
        setWeekId(toBN(arg).toNumber());
    }

    const setaction = (arg: string) => {
        setAction(arg);
    }

    const togglePausePopUp = (arg: number) => {
        setPausePopUp(arg);
    }
 
    const toggleUnPausePopUp = (arg: number) => {
        setUnPausePopUp(arg);
    }

    const interval = toBN(transitionInterval.toString()).toNumber();
    React.useEffect(() => {
        if(action === 'pause') setPausePopUp(1);
        if(action === 'unpause') setUnPausePopUp(1);
    }, [action]);

    return(
        <Wrapper2xl useMinHeight={true} >
            <div className="text-3xl text-left font-bold text-gray-800 mb-4">Analytics</div>
            <div className="w-full space-y-2 mb-2">
                <CustomButton onClick={goToQuiz} exit={false} disabled={false} overrideClassName="w-full">
                    <ArrowRightCircle className="w-5 h-5" />
                    <span>Take A Quiz</span>
                </CustomButton>
                <CustomButton onClick={backToHome} exit={true} disabled={false} overrideClassName="w-full">
                    <ArrowLeftCircle className="w-5 h-5" />
                    <span>Exit</span>
                </CustomButton>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-6 mb-8">
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                        {weekId.toString() || 0}
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

                {/* <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-center mb-3">
                        <Fuel className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                        {`${formatValue(minimumToken.toString()).toStr || 0} Celo`}
                    </div>
                    <div className="text-sm text-gray-600">Min. Token</div>
                </div> */}
            </div>
            
            {/* Week Data - Select week and campaign */}
            <div className="space-y-4 mb-2">
                <div className="text-2xl text-left font-bold text-gray-800 mb-2">Weeks Data</div>
                <div className="w-full flex justify-between items-center gap-2">
                    <div className="w-2/4 space-y-2 text-start text-sm p-4 bg-white rounded-2xl">
                        <h3>Campaigns</h3>
                        <SelectComponent 
                            setHash={setCampaignStr}
                            campaigns={campaignStrings}
                            placeHolder="Campaigns"
                            width="w-"
                        />
                    </div>
                    <div className="w-2/4 space-y-2 text-start text-sm p-4 bg-white rounded-2xl">
                        <h3>Week</h3>
                         <SelectComponent 
                            setHash={setselectedWeek}
                            campaigns={weekIds}
                            placeHolder="Weeks"
                            width="w-"
                        />
                    </div>
                </div>
                <Stat 
                    campaign={campaign} 
                    transitionDate={transitionDate}
                    claimDeadline={claimDeadline}
                />
            </div>

            {/* Admin and Owner only settings */}
            {
                (userAdminStatus || owner.toLowerCase() === account.toLowerCase()) && 
                    <div className="" >
                        <SortWeeklyPayout /> 
                        <MinimumToken />
                        <TransitionInterval />
                    </div>
            }

            {/* Owner only settings */}
            {
                owner.toLowerCase() === account.toLowerCase() && <div className="mb-4 w-full">
                    <Admins />
                    <SelectComponent 
                        campaigns={['none', 'pause', 'unpause']}
                        placeHolder="Set contract state"
                        setHash={setaction}
                        title="Set contract state"
                        width="w-full"
                    />
                </div>
            }

            {/* Exit button */}
            <div className="flex justify-center items-center gap-1 w-full">
                <CustomButton
                    exit={true}
                    onClick={backToHome}
                    disabled={false}
                >
                    <span>Exit</span>
                </CustomButton>
            </div>
            <Pause openDrawer={openPausePopUp} toggleDrawer={togglePausePopUp} />
            <UnPause openDrawer={openUnPausePopUp} toggleDrawer={toggleUnPausePopUp} />
        </Wrapper2xl>
    );
}