import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";
import { formatValue, getTimeFromEpoch } from "../utilities";
import { useAccount } from "wagmi";
import ClaimReward from "../transactions/ClaimReward";
import { useMiniApp } from "@neynar/react";
import { ArrowLeft, ArrowRight, Verified, Store, Key, Coins, HandCoins, BaggageClaim, CheckCircle, IdCard } from "lucide-react";
import CustomButton from "./CustomButton"
import Wrapper2xl from "./Wrapper2xl";                                                                      
import useProfile, { ProfileReturnType } from "../hooks/useProfile";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SelectComponent } from "./SelectComponent";
import { Hex } from "viem";
import SelfQRCodeVerifier from "../landingPage/SelfQRCodeVerifier";

interface ProfileComponentProps {
    fid: number | undefined;
    weekId: number;
    profileData: ProfileReturnType;
}

function ProfileComponent(
    {
        fid,
        weekId,
        profileData: {
            profile: {
                other: {
                    amountClaimedInERC20,
                    amountClaimedInNative,
                    totalQuizPerWeek,
                }
            },
            showVerificationButton,
            showWithdrawalButton,
            // claimable: { isVerified },
            totalPointsForACampaign,
            campaign
        }
    } : ProfileComponentProps) {
    const [openDrawer, setDrawer] = React.useState<number>(0);
    const [showQRCode, setShowQRCode] = React.useState<boolean>(false);

    const toggleDrawer = (arg:number) => setDrawer(arg);
    const back = () => {
        setShowQRCode(false);
    }

    const handleClaim = () => {
        if(!showVerificationButton && !showWithdrawalButton) return null;
        if(showWithdrawalButton) setDrawer(1);
        if(showVerificationButton && !showWithdrawalButton) setShowQRCode(true);
    };
    const { totalPoints, activeLearners, canClaim, hash_, claimActiveUntil, transitionDate } = campaign;

    if(showQRCode) {
        return(
            <MotionDisplayWrapper>
                <SelfQRCodeVerifier 
                    toggleDrawer={toggleDrawer} 
                    back={back}
                    campaignHash={campaign.hash_}
                />
            </MotionDisplayWrapper>
        );
    }

    return(
        <MotionDisplayWrapper className="space-y-2 font-mono">
            {/* <h3 className="w-full text-left mt-4 text-xl text-cyan-900">{`Week ${weekId.toString()} data`}</h3> */}
            <div className="space-y-2">
                <div className="bg-brand-gradient  rounded-2xl p-8 mb-8 text-white border relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative z-10">
                            <div className="text-6xl font-bold mb-2">
                                {totalPointsForACampaign || 0}
                            </div>
                        <div className="text-xl opacity-90 mb-2">
                            You earned {totalPointsForACampaign} out of {totalPoints.toString()} total points for the week
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
                                <h3>{getTimeFromEpoch(claimActiveUntil)}</h3>
                            </div>
                            <div className="flex justify-between gap-3 p-2">
                                <h3 className="text-gray-9">Reward: </h3>
                                <h3 className={`${showVerificationButton? 'text-green-600' : ''}`}>{showVerificationButton? 'Eligible' : 'NotEligible'}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid  & QRCode*/}
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
                            <IdCard className={`w-8 h-8 text-blue-600`} />
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {
                                (showVerificationButton && !showWithdrawalButton) && <h3 className='text-orange-600 font-bold text-center w-full flex justify-center items-center'> <Verified className="w-8 h-8 " /> </h3> 
                            }
                            {
                                (showVerificationButton && showWithdrawalButton) && <h3 className='text-green-600 font-bold text-center w-full flex justify-center items-center'> <Verified className="w-8 h-8 " /> </h3> 
                            }
                            {
                                (!showVerificationButton && !showWithdrawalButton) && <h3 className='text-red-600 font-bold text-center w-full flex justify-center items-center'> <CheckCircle className="w-8 h-8 " /> </h3> 
                            }
                        </div>
                        <div className="text-sm text-gray-600">Verification status</div>
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
                disabled={(!showVerificationButton && !showWithdrawalButton) || showQRCode}
                overrideClassName="w-full mt-4"
            >
                <BaggageClaim className="w-5 h-5 text-orange-white" />
                <span>{(showVerificationButton && !showWithdrawalButton) && 'Verify To Claim'}</span>
                <span>{showWithdrawalButton && 'Withdraw'}</span>
                <span>{(!showVerificationButton && !showWithdrawalButton) && 'Not Eligible'}</span>
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
    const { setpath, campaignStrings, wkId, campaignData} = useStorage();
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
    const { setWeekId, setHash: setCampaignHash, ...rest } = useProfile({});

    const setselectedWeek = (arg: string) => {
        setWeekId(Number(arg));
    }

    const goToQuiz = () => {
        setpath('quiz');
    };

    const goToStats = () => {
        setpath('stats');
    };

    const setHash = (arg: string) => {
        const found = campaignData.filter(q => q.campaign === arg);
        console.log("Arg", arg);
        console.log("Found", found);
        if(found.length > 0) setCampaignHash(found[0].campaignHash as Hex);
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
                <CustomButton onClick={goToQuiz} exit={false} disabled={false}>
                    <ArrowRight className="w-5 h-5" />
                    <span>Take A Quiz</span>
                </CustomButton>
                
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
                    profileData={rest}
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