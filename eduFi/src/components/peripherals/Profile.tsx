import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import useStorage from "../hooks/useStorage";
import { filterTransactionData, formatValue, mockProfile, toBN, } from "../utilities";
import { useAccount, useChainId, useConfig, useDisconnect, useReadContracts } from "wagmi";
import AddressWrapper from "./AddressFormatter/AddressWrapper";
import GenerateKey from "../transactions/GenerateKey";
import ClaimWeeklyReward from "../transactions/ClaimWeeklyReward";
import CollapsibleComponent from "./Collapsible";
import { useMiniApp, } from "@neynar/react";
import { zeroAddress } from "viem";
import { UserContext } from "@farcaster/frame-core/dist/context";
import { Address, Profile as ProfileType, } from "../../../types/quiz";
import { ArrowLeft, ArrowRight, PlugZap } from "lucide-react";
import CustomButton from "./CustomButton"
import Wrapper2xl from "./Wrapper2xl";

function ProfileComponent({weekId, user} : {weekId: bigint, user?: UserContext | undefined}) {
    const [openDrawer, setDrawer] = React.useState<number>(0);
    
    const chainId = useChainId();
    const config = useConfig();
    const toggleDrawer = (arg:number) => setDrawer(arg);
    const { address, isConnected } = useAccount();
    const account = address as Address;
    const handleClaim = () => setDrawer(1);
    const { callback } = useStorage();

    // Build the transactions to run
    const { readTxObject } = React.useMemo(() => {
        const { contractAddresses: ca, transactionData: td} = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['getUserData', 'checkligibility'],
            callback
        });

        const learna = ca.Learna as Address;
        const readArgs = [[account, weekId], [weekId]];
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

    return(
        <MotionDisplayWrapper className="space-y-2 font-mono">
            <h3 className="font-semibold pl-4">{`Week ${weekId.toString()} data`}</h3>
            <div className="space-y-2">
                {/* <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Account</h3>
                    { 
                        haskey? <AddressWrapper account={zeroAddress} size={4} display={false} copyIconSize={'sm'} overrideClassName="w-[50%] p-4"/>
                        :<h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>No Account detected</h3>
                    }
                </div>  */}
                <div className="flex justify-center bg-cyan-500/60 rounded-lg ">
                    <div className="flex flex-col justify-center items-center text-cyan-900 h-[150px] w-full rounded-lg text-xs">
                        <h3>Points earned</h3>
                        <h3 className="text-6xl font-black">{`${points || 0}`}</h3>
                    </div>
                </div>
                <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">FID</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{user?.fid || 'NA'}</h3>
                </div>
                <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Total attempted quiz</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{totalQuizPerWeek || 0}</h3>
                </div>
                <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">Points earned</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{points || 0}</h3>
                </div>
                <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">PassKey</h3>
                    { 
                        haskey? <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>
                            <AddressWrapper account={passKey} size={4} display={false} copyIconSize={'sm'} />
                        </h3> : <div className='bg-cyan-500/60 rounded-r-lg p-1 text-cyan-900 font-bold w-[50%] text-center'>
                            <GenerateKey functionName={'generateKey'} buttonClassName="bg-none rounded-none" />
                        </div>
                    }
                </div> 
                <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">{"$GROW claimed"}</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{formatValue(amountClaimedInERC20?.toString()).toStr || '0'}</h3>
                </div>
                <div className='pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[50%]">{`$Celo claimed`}</h3>
                    <h3 className='bg-cyan-500/60 rounded-r-lg p-4 text-cyan-900 font-bold w-[50%] text-center'>{formatValue(amountClaimedInNative?.toString()).toStr || '0'}</h3>
                </div>
            </div>
            <div className="flex justify-center items-center gap-1 w-full">
                <Button disabled={disableClaimButton} onClick={handleClaim} variant={'outline'} className="w-full bg-cyan-500 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Claim</Button>
            </div>
            <ClaimWeeklyReward 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                weekId={weekId}
            />
        </MotionDisplayWrapper>
    );
}


export default function Profile() {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    
    const { weekId, setpath } = useStorage();

    const toggleOpen = (arg: boolean) => {
        setIsOpen(arg);
    };

    const backToHome = () => {
        setpath('home');
    };

    const goToQuiz = () => {
        setpath('selectcategory');
    };

    const { context } = useMiniApp();
    const { disconnect } = useDisconnect();
    const { isConnected, address } = useAccount();
    const weekIds = React.useMemo(() => {
        const wkId = toBN(weekId.toString()).toNumber();
        const weekIds = [...Array(wkId === 0? 1 : wkId + 1).keys()];
        return weekIds;
    }, [weekId]);

    return(
        <Wrapper2xl>
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
                <CustomButton
                    onClick={goToQuiz}
                    exit={false}
                    disabled={false}
                >
                    <ArrowRight className="w-5 h-5" />
                    <span>Take A Quiz</span>
                </CustomButton>
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
                <CustomButton
                    onClick={backToHome}
                    exit={true}
                    disabled={false}
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Exit</span>
                </CustomButton>
            </div>
        </Wrapper2xl>
    )

}