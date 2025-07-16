/* eslint-disable */

import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";
import { formatValue, getTimeFromEpoch } from "../utilities";
import { useAccount } from "wagmi";
import GenerateKey from "../transactions/GenerateKey";
import ClaimReward from "../transactions/ClaimReward";
import { useMiniApp, } from "@neynar/react";
import { UserContext } from "@farcaster/frame-core/dist/context";
import { ArrowLeft, ArrowRight, CheckCircle, Store, Key, Coins, HandCoins, BaggageClaim } from "lucide-react";
import CustomButton from "./CustomButton"
import Wrapper2xl from "./Wrapper2xl";
import useProfile, { mockProfileReturn, ProfileReturnType } from "../hooks/useProfile";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SelectComponent } from "./SelectComponent";
import { Hex } from "viem";

interface ProfileComponentProps {
    user: UserContext | undefined;
    weekId: number;
    profileData: ProfileReturnType;
}

function ProfileComponent(
    {
        user,
        weekId,
        profileData: {
            haskey,
            isElibigleToClaimForTheWeek,
            totalPointsForACampaign,
            totalQuizPerWeek,
            amountClaimedInERC20,
            amountClaimedInNative,
            disableClaimButton,
            campaign
        }
    } : ProfileComponentProps) {
    const [openDrawer, setDrawer] = React.useState<number>(0);
    const toggleDrawer = (arg:number) => setDrawer(arg);
    const handleClaim = () => setDrawer(1);
    const { totalPoints, activeLearners, canClaim, hash_, claimActiveUntil, transitionDate } = campaign;

    return(
        <MotionDisplayWrapper className="space-y-2 font-mono">
            {/* <h3 className="w-full text-left mt-4 text-xl text-cyan-900">{`Week ${weekId.toString()} data`}</h3> */}
            <div className="space-y-2">
                <div className="bg-brand-gradient rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative z-10">
                            <div className="text-6xl font-bold mb-2">
                                {totalPointsForACampaign || 0}
                            </div>
                        <div className="text-xl opacity-90 mb-2">
                            You earned {totalPointsForACampaign} out of {totalPoints.toString()} total points for the week
                        </div>
                        <div className="text-lg opacity-80 capitalize">
                            Your FID: {user?.fid || 'NA'}
                        </div>
                        <div className="text-lg opacity-80 capitalize">
                            <h3>Learners: {activeLearners.toString()}</h3>
                        </div>
                        <div className={`border rounded-xl grid grid-cols-1 bg-white p-4 text-lg mt-2 space-y-2 opacity-80 capitalize ${canClaim? 'text-cyan-900' : 'text-red-600'}`}>
                            <div className="flex justify-between gap-3 p-2">
                                <BaggageClaim className={`w-5 h-5 text-gray-900`} />
                                <h3>{canClaim? 'Ready to claim' : 'Claim not Ready'}</h3>
                            </div>
                            <div className="flex justify-between gap-3 p-2">
                                <h3 className="text-gray-900">Sorted date</h3>
                                <h3>{getTimeFromEpoch(transitionDate)}</h3>
                            </div>
                            <div className="flex justify-between gap-3 p-2">
                                <h3 className="text-gray-900">Claim ends: </h3>
                                <h3>{getTimeFromEpoch(claimActiveUntil)}</h3>
                            </div>
                            <div className="flex justify-between gap-3 p-2">
                                <h3 className="text-gray-900">Reward: </h3>
                                <h3 className={`${isElibigleToClaimForTheWeek? 'text-green-600' : 'text-red-600'}`}>{isElibigleToClaimForTheWeek? 'Eligible' : 'NotEligible'}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 md:gap-6 mb-8">
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Store className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {totalQuizPerWeek || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total Onchain Streak</div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Key className={`w-8 h-8 text-blue-600`} />
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            { 
                                haskey? <h3 className='text-green-600 font-bold text-center w-full flex justify-center items-center'>
                                    <CheckCircle className="w-8 h-8 " />
                                </h3> : <div className=' p-1 text-cyan-900  text-center'>
                                    <GenerateKey 
                                        functionName={'generateKey'} 
                                        buttonClassName="text-md fle gap-2" 
                                        campaignHash={hash_}
                                    />
                                </div>
                            }
                        </div>
                        <div className="text-sm text-gray-600">Passkey</div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <HandCoins className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {formatValue(amountClaimedInERC20?.toString()).toStr || '0'}
                        </div>
                        <div className="text-sm text-gray-600">Amount of $GROW earned</div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Coins className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {formatValue(amountClaimedInNative?.toString()).toStr || '0'}
                        </div>
                        <div className="text-sm text-gray-600">Amount of $CELO earned</div>
                    </div>
                </div>
            </div>
            <CustomButton
                exit={false}
                onClick={handleClaim}
                disabled={disableClaimButton}
                overrideClassName="w-full mt-4"
            >
                <BaggageClaim className="w-5 h-5 text-orange-white" />
                <span>Claim</span>
            </CustomButton>
            <ClaimReward 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                weekId={BigInt(weekId)}
                campainHash={hash_}
            />
        </MotionDisplayWrapper>
    );
}

export default function Profile() {
    const [selectedWeek, setSelectedWeek] = React.useState<number>(0);
    const [requestedHash, setRequestedHash] = React.useState<Hex>(`0x${0}`);
    const [profile, setProfile] = React.useState<ProfileReturnType>(mockProfileReturn);
    const { context } = useMiniApp();
    const { isConnected } = useAccount();
    
    const backToHome = () => {
        if(isConnected){
            setpath('dashboard');
        } else {
            setpath('home');
        }
    };
    
    const { setpath, campaignStrings, wkId, campaignData} = useStorage();
    const weekIds = Array.from({length: wkId + 1}, (_: number, i: number) => i).map(q => q.toString());
    const { getCampaignObj } = useProfile();

    const setselectedWeek = (arg: string) => {
        setSelectedWeek(Number(arg));
    }

    const goToQuiz = () => {
        setpath('quiz');
    };

    const goToStats = () => {
        setpath('stats');
    };

    const setHash = (arg: string) => {
        const found = campaignData.find(q => q.campaign === arg);
        setRequestedHash(found?.campaignHash as Hex);
    }

    React.useEffect(() => {
        setProfile(getCampaignObj(selectedWeek, requestedHash));
    }, [selectedWeek, requestedHash, getCampaignObj]);

    return(
        <Wrapper2xl useMinHeight={true} >
            <div className="space-y-6 grid grid-cols-1 ">
                <div className="w-full relative flex justify-between items-center bg-gradient-to-r p-4 gap-4 border rounded-2xl">
                    {
                        isConnected?  <ConnectButton accountStatus={"avatar"} chainStatus={"icon"} showBalance={false} /> : <h3 className="text-center">{"Not Connected To Any Wallet"}</h3>
                    }
                    <CustomButton onClick={goToStats} exit={true} disabled={false} overrideClassName="w-2/4 bg-white border-none">
                        <ArrowRight className="w-5 h-5" />
                        <span>Go To Stat</span>
                    </CustomButton>
                </div>
                <CustomButton onClick={goToQuiz} exit={false} disabled={false}>
                    <ArrowRight className="w-5 h-5" />
                    <span>Take A Quiz</span>
                </CustomButton>
                
                <div className="flex justify-between gap-4">
                    {/* User can view their profile in a selected campaign */}
                    <SelectComponent 
                        title="Campaigns"
                        setHash={setHash}
                        campaigns={campaignStrings}
                        placeHolder="Select campaign"
                    />
                    {/* User can view their profile in a selected campaign */}
                    <SelectComponent 
                        title="Week"
                        setHash={setselectedWeek}
                        campaigns={weekIds}
                        placeHolder="Select campaign"
                    />
                </div>
                
                <ProfileComponent 
                    weekId={wkId}
                    user={context?.user} 
                    profileData={profile}
                />

                <CustomButton onClick={backToHome} exit={true} disabled={false} >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Exit</span>
                </CustomButton>
            </div>
        </Wrapper2xl>
    )
}

// ...Array(wkId === 0? 1 : wkId + 1).keys()