import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import useStorage from "../hooks/useStorage";
import { formatValue, getTimeFromEpoch, toBN, } from "../utilities";
import { useAccount, useDisconnect, } from "wagmi";
import AddressWrapper from "./AddressFormatter/AddressWrapper";
import GenerateKey from "../transactions/GenerateKey";
import ClaimReward from "../transactions/ClaimReward";
import CollapsibleComponent from "./Collapsible";
import { useMiniApp, } from "@neynar/react";
import { zeroAddress } from "viem";
import { UserContext } from "@farcaster/frame-core/dist/context";
import { CampaignDataFormatted } from "../../../types/quiz";
import { ArrowLeft, ArrowRight, CheckCircle, PlugZap, Store, Key, Coins, HandCoins, BaggageClaim } from "lucide-react";
import CustomButton from "./CustomButton"
import Wrapper2xl from "./Wrapper2xl";
import { CampaignMap } from "./SetupCampaign";
import useProfile from "../hooks/useProfile";

function ProfileComponent({weekId, user} : {weekId: bigint, user?: UserContext | undefined}) {
    const [openDrawer, setDrawer] = React.useState<number>(0);
    const [ reSelectedCampaign, setCampaign ] = React.useState<CampaignDataFormatted>({campaign: '', campaignHash: `0x${''}`});
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    
    const toggleDrawer = (arg:number) => setDrawer(arg);
    const handleClaim = () => setDrawer(1);
    const formattedWeekId = toBN(weekId.toString()).toNumber();
    const { selectedCampaign, campaignData, weekData, setselectedCampaign } = useStorage();
    const wkId = toBN(weekId.toString()).toNumber()
    const { totalPoints, activeLearners, canClaim, hash_, claimActiveUntil, transitionDate } = selectedCampaign ||  weekData[wkId].campaigns[0];
    const { 
        amountClaimedInERC20, 
        amountClaimedInNative, 
        disableClaimButton,
        haskey,
        totalPointsForACampaign,
        totalQuizPerWeek,
        isElibigleToClaimForTheWeek
     } = useProfile({campaignHash: hash_});

    const toggleOpen = (arg: boolean) => {
        setIsOpen(arg)
    };

    const handleSetCampaign = (campaign: CampaignDataFormatted) => {
        const filtered = weekData[formattedWeekId].campaigns.filter(({hash_}) => hash_.toLowerCase() === campaign.campaignHash.toLowerCase());
        setselectedCampaign(filtered?.[0]);
    }


    React.useEffect(() => {
        if(selectedCampaign?.hash_?.toLowerCase() !== reSelectedCampaign.campaignHash.toLowerCase()) handleSetCampaign(reSelectedCampaign);
    }, [reSelectedCampaign, selectedCampaign]);

    return(
        <CollapsibleComponent 
            header={`Week `}
            isOpen={isOpen}
            toggleOpen={toggleOpen}
        >
            <MotionDisplayWrapper className="space-y-2 font-mono">
                <h3 className="w-full text-left mt-4 text-xl text-cyan-900">{`Week ${weekId.toString()} data`}</h3>
                <div className="space-y-2">
                <div>
                    <CampaignMap 
                        campaignData={campaignData}
                        selectedCampaign={reSelectedCampaign.campaign}
                        setCampaign={(campaign) => setCampaign(campaign)}
                    />
                </div>
                    <div className="bg-brand-gradient rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                            <div className="relative z-10">
                                <div className="text-6xl font-bold mb-2">
                                    {totalPointsForACampaign || 0}
                                </div>
                            <div className="text-xl opacity-90 mb-2">
                                You earned {totalPointsForACampaign || 0} out of {totalPoints.toString()} total points for the week
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
                    weekId={weekId}
                    campainHash={hash_}
                />
            </MotionDisplayWrapper>
        </CollapsibleComponent>
    );
}


export default function Profile() {
    const { weekId, setpath } = useStorage();
    const { context } = useMiniApp();
    const { disconnect } = useDisconnect();
    const { isConnected, address } = useAccount();

    const backToHome = () => {
        isConnected? setpath('dashboard') : setpath('home');
    };

    const goToQuiz = () => {
        setpath('quiz');
    };

    const profileData = React.useMemo(() => {
        const wkId = toBN(weekId.toString()).toNumber();
        const weekIds = [...Array(wkId === 0? 1 : wkId + 1).keys()];
        const profileData = weekIds.map((_,i) => (
             <div key={i} className="w-full overflow-hidden md:overflow-auto border rounded-xl p-4 grid grid-cols-1-lg gap-2">
                {
                    weekIds.map((wkId, key) => (
                        <ProfileComponent key={key} weekId={BigInt(wkId)} user={context?.user} />
                    ))
                }
            </div>
        ))
        return profileData;
    }, [weekId]);

    return(
        <Wrapper2xl useMinHeight={true} >
            <div className="space-y-6 grid grid-cols-1 ">
                <div className="w-full relative flex justify-between items-center p-8 border rounded-2xl">
                    {
                        isConnected? <AddressWrapper account={address || zeroAddress} size={5} display copyIconSize="md" /> : <div>
                            <div className="w-24 h-24 rounded-full border bg-purple-200 flex justify-center items-center">
                                <PlugZap className="w-12 h-12 text-pink-500 animate-bounce-gentle" />
                            </div>
                            <h3>{"Not Connected To Any Wallet"}</h3>
                        </div>
                    }
                    { isConnected && <Button onClick={() => disconnect()} variant={'outline'} className="float-right text-cyan-700">Logout</Button>}
                </div>
                <CustomButton onClick={goToQuiz} exit={false} disabled={false}>
                    <ArrowRight className="w-5 h-5" />
                    <span>Take A Quiz</span>
                </CustomButton>

                { profileData }

                <CustomButton onClick={backToHome} exit={true} disabled={false}>
                    <ArrowLeft className="w-5 h-5" />
                    <span>Exit</span>
                </CustomButton>
            </div>
        </Wrapper2xl>
    )

}