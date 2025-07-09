import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import useStorage from "../hooks/useStorage";
import { filterTransactionData, formatValue, getTimeFromEpoch, mockProfile, toBN, } from "../utilities";
import { useAccount, useChainId, useConfig, useDisconnect, useReadContracts } from "wagmi";
import AddressWrapper from "./AddressFormatter/AddressWrapper";
import GenerateKey from "../transactions/GenerateKey";
import ClaimReward from "../transactions/ClaimReward";
import CollapsibleComponent from "./Collapsible";
import { useMiniApp, } from "@neynar/react";
import { zeroAddress } from "viem";
import { UserContext } from "@farcaster/frame-core/dist/context";
import { Address, CampaignDataFormatted, Profile as ProfileType, } from "../../../types/quiz";
import { ArrowLeft, ArrowRight, CheckCircle, PlugZap, Store, Key, Coins, HandCoins, BaggageClaim } from "lucide-react";
import CustomButton from "./CustomButton"
import Wrapper2xl from "./Wrapper2xl";
import { CampaignMap } from "./SetupCampaign";

function ProfileComponent({weekId, user} : {weekId: bigint, user?: UserContext | undefined}) {
    const [openDrawer, setDrawer] = React.useState<number>(0);
    const [ reSelectedCampaign, setCampaign ] = React.useState<CampaignDataFormatted>({campaign: '', campaignHash: `0x${''}`});
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    
    const chainId = useChainId();
    const config = useConfig();
    const toggleDrawer = (arg:number) => setDrawer(arg);
    const { address, isConnected } = useAccount();
    const account = address as Address;
    const handleClaim = () => setDrawer(1);
    const formattedWeekId = toBN(weekId.toString()).toNumber();
    const { callback, selectedCampaign, campaignData, weekData, setselectedCampaign } = useStorage();
    const { totalPoints, activeLearners, canClaim, hash_, claimActiveUntil, transitionDate } = selectedCampaign;

    const toggleOpen = (arg: boolean) => {
        setIsOpen(arg)
    };

    const handleSetCampaign = (campaign: CampaignDataFormatted) => {
        const filtered = weekData[formattedWeekId].campaigns.filter(({hash_}) => hash_.toLowerCase() === campaign.campaignHash.toLowerCase());
        setselectedCampaign(filtered?.[0]);
    }

    // Build the transactions to run
    const { readTxObject } = React.useMemo(() => {
        const { contractAddresses: ca, transactionData: td} = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['getProfile', 'checkEligibility'],
            callback
        });

        const learna = ca.Learna as Address;
        const readArgs = [[account, weekId, [hash_]], [weekId]];
        const addresses = [learna, learna];
        const readTxObject = td.map((item, i) => {
            return{
                abi: item.abi,
                functionName: item.functionName,
                address: addresses[i],
                args: readArgs[i]
            }
        });
        return { readTxObject };
    }, [chainId, account, weekId, callback]);

    // Fetch user data 
    const { data } = useReadContracts({
        config,
        contracts: readTxObject,
        allowFailure: true,
        query: {
            enabled: !!isConnected,
            refetchOnReconnect: 'always', 
            refetchInterval: 5000,
            refetchOnMount: 'always',

        }
    });

    const { amountClaimedInERC20, amountClaimedInNative, haskey, passKey, points, disableClaimButton, totalQuizPerWeek } = React.useMemo(() => {
        const profile = data?.[0]?.result as ProfileType || mockProfile;
        const isElibigle = data?.[1]?.result as boolean;
        const disableClaimButton = (profile && profile.claimed) || !profile || (profile && !profile.haskey || !isElibigle);
        const { amountClaimedInERC20, amountClaimedInNative, haskey, passKey, points, totalQuizPerWeek } = profile;
        return {
            isElibigle,
            amountClaimedInERC20,
            amountClaimedInNative,
            haskey,
            passKey,
            points,
            totalQuizPerWeek,
            disableClaimButton
        }
    }, [data]);

    React.useEffect(() => {
        if(selectedCampaign.hash_.toLowerCase() !== reSelectedCampaign.campaignHash.toLowerCase()) handleSetCampaign(reSelectedCampaign);
    }, [reSelectedCampaign, selectedCampaign]);

    return(
        <MotionDisplayWrapper className="space-y-2 font-mono">
            <h3 className="pl-4 text-xl text-cyan-900">{`Week ${weekId.toString()} data`}</h3>
            <div className="space-y-2">
               <div>
                    <CampaignMap 
                        campaignData={campaignData}
                        isOpen={isOpen}
                        selectedCampaign={reSelectedCampaign.campaign}
                        setCampaign={(campaign) => setCampaign(campaign)}
                        toggleOpen={toggleOpen}
                    />
               </div>
                <div className="bg-brand-gradient rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative z-10">
                            <div className="text-6xl font-bold mb-2">
                                {points || 0}
                            </div>
                        <div className="text-xl opacity-90 mb-2">
                            You earned {points || 0} out of {totalPoints.toString()} total points for the week
                        </div>
                        <div className="text-lg opacity-80 capitalize">
                            Your FID: {user?.fid || 'NA'}
                        </div>
                        <div className="flex-1 justify-between items-center text-lg opacity-80 capitalize">
                            <h3>Learners</h3>
                            <h3>{activeLearners.toString()}</h3>
                        </div>
                        <div className={`flex-1 justify-between items-center text-lg opacity-80 capitalize ${canClaim? 'text-green-600' : 'text-red-600'}`}>
                            <div className="flex gap-3 text-center">
                                <BaggageClaim className={`w-5 h-5`} />
                                <h3>{canClaim? 'Ready' : 'Not Ready'}</h3>
                            </div>
                            <div className="text-center">
                                <h3>Will be sorted on/after</h3>
                                <h3>{getTimeFromEpoch(transitionDate)}</h3>
                            </div>
                            <div className="text-center">
                                <h3>Claim ends</h3>
                                <h3>{getTimeFromEpoch(claimActiveUntil)}</h3>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="flex justify-center bg-cyan-500/60 rounded-lg ">
                    <div className="flex flex-col justify-center items-center text-cyan-900 h-[150px] w-full rounded-lg text-xs">
                        <h3>Points earned</h3>
                        <h3 className="text-6xl font-black">{`${points || 0}`}</h3>
                    </div>
                </div> */}
                {/* <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">FID</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{user?.fid || 'NA'}</h3>
                </div> */}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 md:gap-6 mb-8">
                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Store className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {totalQuizPerWeek || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total Onchain Streak</div>
                    </div>

                    <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center justify-center mb-3">
                            <Key className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            { 
                                !haskey? <h3 className='text-green-600 font-bold text-center w-full flex justify-center items-center'>
                                    <CheckCircle className="w-8 h-8 " />
                                </h3> : <div className=' p-1 text-cyan-900  text-center'>
                                    <GenerateKey 
                                        functionName={'generateKey'} 
                                        buttonClassName="text-md " 
                                        campainHash={hash_} 
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

                {/* <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Total attempted quiz</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{totalQuizPerWeek || 0}</h3>
                </div> */}
                {/* <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Points earned</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{points || 0}</h3>
                </div> */}
                {/* <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">PassKey</h3>
                    { 
                        haskey? <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>
                            <AddressWrapper account={passKey} size={4} display={false} copyIconSize={'sm'} />
                        </h3> : <div className='bg-cyan-500/60 rounded-r-lg p-1 text-cyan-900 font-bold w-[50%] text-center'>
                            <GenerateKey functionName={'generateKey'} buttonClassName="bg-none rounded-none" />
                        </div>
                    }
                </div>  */}
                {/* <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">{"$GROW claimed"}</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{formatValue(amountClaimedInERC20?.toString()).toStr || '0'}</h3>
                </div> */}
                {/* <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">{`$Celo claimed`}</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{formatValue(amountClaimedInNative?.toString()).toStr || '0'}</h3>
                </div> */}
            </div>
            <button
                onClick={handleClaim}
                disabled={!disableClaimButton}
                className={`w-full mt-4 ${disableClaimButton? "btn-secondary" : "btn-primary"} flex items-center justify-center gap-2 border`}
            >
                <BaggageClaim className="w-5 h-5 text-orange-600" />
                <span>Claim</span>
            </button>
            {/* <div className="flex justify-center items-center gap-1 w-full">
                <CustomButton
                    onClick={handleClaim}
                    disabled={disableClaimButton}
                    exit={false}
                >
                    <span>Claim</span>
                </CustomButton>
            </div> */}
            <ClaimReward 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                weekId={weekId}
                campainHash={hash_}
            />
        </MotionDisplayWrapper>
    );
}


export default function Profile() {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    
    const { weekId, setpath } = useStorage();
    const { context } = useMiniApp();
    const { disconnect } = useDisconnect();
    const { isConnected, address } = useAccount();

    const toggleOpen = (arg: boolean) => {
        setIsOpen(arg);
    };

    const backToHome = () => {
        isConnected? setpath('dashboard') : setpath('home');
    };

    const goToQuiz = () => {
        setpath('quiz');
    };

    
    const profileData = React.useMemo(() => {
        const wkId = toBN(weekId.toString()).toNumber();
        const weekIds = [...Array(wkId === 0? 1 : wkId + 1).keys()];
        const profileData = weekIds.map(() => (
             <div className="w-full overflow-hidden md:overflow-auto border rounded-xl p-4 grid grid-cols-1-lg gap-2">
                {
                    weekIds.map((wkId) => (
                        <MotionDisplayWrapper 
                            key={wkId}
                        >
                            <CollapsibleComponent 
                                header={`Week ${wkId}`}
                                isOpen={isOpen}
                                toggleOpen={toggleOpen}
                            >
                                <ProfileComponent weekId={BigInt(wkId)} user={context?.user} />
                            </CollapsibleComponent>
                        </MotionDisplayWrapper>
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