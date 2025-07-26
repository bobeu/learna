/* eslint-disable */

import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";
import { formatValue, getTimeFromEpoch } from "../utilities";
import { useAccount } from "wagmi";
import ClaimReward from "../transactions/ClaimReward";
import { useMiniApp } from "@neynar/react";
import { ArrowLeft, ArrowRight, Verified, Store, PlusCircle, Coins, HandCoins, BaggageClaim, CheckCircle, IdCard, ArrowRightCircle } from "lucide-react";
import CustomButton from "./CustomButton"
import Wrapper2xl from "./Wrapper2xl";                                                                      
import useProfile, { ProfileReturnType } from "../hooks/useProfile";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SelectComponent } from "./SelectComponent";
import { Hex } from "viem";
import SelfQRCodeVerifier from "../landingPage/SelfQRCodeVerifier";
import Eligibiliies from "./Eligibilities";

interface ProfileComponentProps {
    fid: number | undefined;
    weekId: number;
    profileData: ProfileReturnType;
}

function ProfileComponent(
    {
        fid,
        profileData: {
            profile: {
                other: { totalQuizPerWeek }
            },
            protocolReward: { erc20Amount, nativeAmount },
            claimDeadline,
            showVerificationButton,
            showWithdrawalButton,
            totalPointsForACampaign,
            requestedWeekId,
            eligibility,
            totalPointsInRequestedCampaign,
            campaign,
            claimed
        }
    } : ProfileComponentProps) {
    const [openDrawer, setDrawer] = React.useState<number>(0);
    const [showQRCode, setShowQRCode] = React.useState<boolean>(false);

    const { state: { transitionDate } } = useStorage();
    const toggleDrawer = (arg:number) => setDrawer(arg);
    const back = () => {
        setShowQRCode(false);
    }

    const handleClaim = () => {
        if(!showVerificationButton && !showWithdrawalButton) return null;
        if(showWithdrawalButton) setDrawer(1);
        if(showVerificationButton && !showWithdrawalButton) setShowQRCode(true);
    };
    const { activeLearners, canClaim } = campaign;

    if(showQRCode) {
        return(
            <MotionDisplayWrapper>
                <SelfQRCodeVerifier 
                    toggleDrawer={toggleDrawer} 
                    back={back}
                />
            </MotionDisplayWrapper>
        );
    }

    return(
        <MotionDisplayWrapper className="space-y-2 font-mono">
            <div className="space-y-2">
                <div className="bg-brand-gradient  rounded-2xl p-8 mb-8 text-white border relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative z-10">
                            <div className="text-6xl font-bold mb-2">
                                {totalPointsForACampaign || 0}
                            </div>
                        <div className="text-xl opacity-90 mb-2">
                            You earned {totalPointsForACampaign} out of {totalPointsInRequestedCampaign.toString()} total points for the week
                        </div>
                        <div className="text-lg opacity-80 capitalize">
                            Your FID: {fid || 'NA'}
                        </div>
                        <div className="text-lg opacity-80 capitalize">
                            <h3>Learners: {activeLearners.toString()}</h3>
                        </div>
                        <div className={`grid grid-cols-1 text-lg my-4 space-y-2 opacity-80 capitalize ${canClaim? 'text-cyan-900' : ''}`}>
                            <div className="flex justify-between gap-3 p-2">
                                <BaggageClaim className={`w-5 h-5 text-gray-`} />
                                <h3>{canClaim? 'Ready to claim' : 'Claim not Ready'}</h3>
                            </div>
                            <div className="flex justify-between gap-3 p-2">
                                <h3 className="text-gray-9">Sorted date</h3>
                                <h3>{getTimeFromEpoch(transitionDate)}</h3>
                            </div>
                            <div className="flex justify-between gap-3 p-2">
                                <h3 className="text-gray-">Claim ends: </h3>
                                <h3>{getTimeFromEpoch(claimDeadline)}</h3>
                            </div>
                            <div className="flex justify-between gap-3 p-2">
                                <h3 className="text-gray-9">Reward: </h3>
                                <h3 className={`${showVerificationButton? 'text-white' : ''}`}>{showVerificationButton? 'Eligible' : 'NotEligible'}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Eligibiliies */}
                <Eligibiliies  
                    eligibility={eligibility}
                />

                {/* Stats Grid*/}
                <div className="space-y-3">
                    <div className="text-2xl text-left font-bold text-gray-800 mb-4">Profile Stats</div>
                    <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8">
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
                                <IdCard className={`w-8 h-8 text-blue-600`} />
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">
                                {
                                    (showVerificationButton && !showWithdrawalButton && !claimed) && <h3 className='text-orange-600 font-bold text-center w-full flex justify-center items-center'> <Verified className="w-8 h-8 " /> </h3> 
                                }
                                {
                                    (showWithdrawalButton || claimed ) && <h3 className='text-green-600 font-bold text-center w-full flex justify-center items-center'> <Verified className="w-8 h-8 " /> </h3> 
                                }
                                {
                                    (!showVerificationButton && !showWithdrawalButton && !claimed) && <h3 className='text-red-600 font-bold text-center w-full flex justify-center items-center'> <CheckCircle className="w-8 h-8 " /> </h3> 
                                }
                            </div>
                            <div className="text-sm text-gray-600">Verification status</div>
                        </div>

                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-center mb-3">
                                <HandCoins className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">
                                {formatValue(erc20Amount?.toString()).toStr || '0'}
                            </div>
                            <div className="text-sm text-gray-600">Amount of $GROW earned</div>
                        </div>

                        <div className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-center mb-3">
                                <Coins className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-800 mb-1">
                                {formatValue(nativeAmount?.toString()).toStr || '0'}
                            </div>
                            <div className="text-sm text-gray-600">Amount of $CELO earned</div>
                        </div>
                    </div>

                </div>
            </div>
            <CustomButton
                exit={false}
                onClick={handleClaim}
                disabled={(!showVerificationButton && !showWithdrawalButton) || showQRCode}
                overrideClassName="w-full mt-4"
            >
                <BaggageClaim className="w-5 h-5 text-orange-white" />
                <span>{(showVerificationButton && !showWithdrawalButton && !claimed) && 'Verify To Claim'}</span>
                <span>{(showWithdrawalButton && !claimed) && 'Withdraw'}</span>
                <span>{(!showVerificationButton && !showWithdrawalButton && !claimed) && 'Not Eligible'}</span>
                <span>{claimed && 'Claimed'}</span>
            </CustomButton>
            <ClaimReward 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                weekId={requestedWeekId}
            />
        </MotionDisplayWrapper>
    );
}

export default function Profile() {
    const { setpath, campaignStrings, wkId, campaignData } = useStorage();
    const { returnObj, setHash: setRequestedHash, setWeekId } = useProfile();
    const { context } = useMiniApp();
    const { isConnected } = useAccount();
    
    const backToHome = () => {
        if(isConnected){
            setpath('dashboard');
        } else {
            setpath('home');
        }
    };
    
    const weekIds = Array.from({length: wkId + 1}, (_: number, i: number) => i).map(q => q.toString());
    const setselectedWeek = (arg: string) => {
        setWeekId(Number(arg));
    }

    const goToQuiz = () => {
        setpath('dashboard');
    };

    const goToStats = () => {
        setpath('stats');
    };

    const createCampaign = () => {
        setpath('setupcampaign');
    };

    const setHash = (arg: string) => {
        const found = campaignData.filter(q => q.campaign === arg);
        if(found.length > 0) setRequestedHash(found[0].campaignHash as Hex);
    }

    return(
        <Wrapper2xl useMinHeight={true} >
            <div className="space-y-6 grid grid-cols-1 ">
                <div className="w-full relative flex justify-between items-center bg-white p-4 gap-4 rounded-2xl">
                    <ConnectButton 
                        accountStatus={"avatar"} 
                        chainStatus={"icon"} 
                        showBalance={false} 
                        label="Reconnect"
                    />
                    <CustomButton 
                        onClick={goToStats} 
                        exit={true} 
                        disabled={false} 
                        overrideClassName="w-2/4 bg-none hover:bg-gradient-to-r border-none "
                    >
                        <ArrowRight className="w-5 h-5" />
                        <span>Stats</span>
                    </CustomButton>
                </div>
                <div className="w-full space-y-2">
                    <CustomButton onClick={goToQuiz} exit={false} disabled={false} overrideClassName="w-full">
                        <ArrowRightCircle className="w-5 h-5" />
                        <span>Take A Quiz</span>
                    </CustomButton>
                    <CustomButton onClick={createCampaign} exit={true} disabled={false} overrideClassName="w-full">
                        <PlusCircle className="w-5 h-5" />
                        <span>New Campaign</span>
                    </CustomButton>
                </div>
                
                <div className="flex justify-between gap-4 max-w-sm">
                    {/* User can view their profile in a selected campaign */}
                    <div className="w-2/4 text-start text-sm p-4 bg-white rounded-2xl">
                        <h3>Campaigns</h3>
                        <SelectComponent 
                            setHash={setHash}
                            campaigns={campaignStrings}
                            placeHolder="Select campaign"
                            width="w-"
                        />
                    </div>
                    {/* User can view their profile in a selected campaign */}
                     <div className="w-2/4 text-start text-sm p-4 bg-white rounded-2xl">
                        <h3>Week</h3>
                        <SelectComponent 
                            setHash={setselectedWeek}
                            campaigns={weekIds}
                            placeHolder="Select campaign"
                            width="w-"
                        />
                    </div>
                </div>
                
                {/* Main profile component */}
                <ProfileComponent 
                    weekId={wkId}
                    fid={context?.user?.fid} 
                    profileData={returnObj}
                />
                
                {/* Exit button */}
                <CustomButton onClick={backToHome} exit={true} disabled={false} >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Exit</span>
                </CustomButton>
            </div>
        </Wrapper2xl>
    )
}

// ...Array(wkId === 0? 1 : wkId + 1).keys()