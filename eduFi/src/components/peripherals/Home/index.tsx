import React from "react";
import { MotionDisplayWrapper } from "../MotionDisplayWrapper";
import { Button } from "~/components//ui/button";
import useStorage from "../../hooks/useStorage";
import { Swipeable } from "../Swipeable";
import { useMiniApp } from '@neynar/react';
import ConnectButtons, { buttonProps } from "../../ConnectButtons";
import { useChainId, useConfig, useAccount, useReadContracts  } from "wagmi";
import { Address, filterTransactionData, Profile } from "../../utilities";
import GenerateUserKey from "../GenerateUserKey";
import { WelcomeScreen } from "./WelcomeScreen";

export default function Home() {
    const { setpath, setmessage, callback, weekId, currentPath } = useStorage();
    const { isSDKLoaded, isInMiniApp, actions } = useMiniApp();
    const [showGenerateUserKey, setShowGenerateUserKey] = React.useState<boolean>(false);
    const [showWelcomeScreen, setShowWelcomeScreen] = React.useState<number>(0);
    
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount().address as Address;

    // Build the transactions to run
    const { readTxObject } = React.useMemo(() => {
        const { contractAddresses: ca, transactionData: td} = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['getUserData'],
            callback
        });

        const learna = ca.Learna as Address;
        const readArgs = [[account, weekId]];
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
    const { data: result } = useReadContracts({
        config,
        contracts: readTxObject
    });
    
     const profile = result?.[0]?.result as Profile;

    const handleNavigate = () => {
        // if(!result || !result?.[0].result) return alert('Please check your connection');
        if(!profile){
            return alert("Please connect your wallet first or check your connection");
        } else {
            if(profile.haskey){
                setpath('selectcategory');
            } else {
                setShowGenerateUserKey(true);
                setShowWelcomeScreen(1);
            }
        }
    }

    // Add Educaster to user's list of miniApps
    const handleAddMiniApp = async () => {
      if (!isSDKLoaded) return;
      const result = await actions.addMiniApp();
      if (result.notificationDetails) {
        // Mini app was added and notifications were enabled
        setmessage(`Educaster added to miniApps`);
      }
    };

    React.useEffect(() => {
        if(profile && !profile.haskey && currentPath !== "home"){
            setpath('home');
        }
    }, [profile, currentPath, setpath]);

    return(
        <div className="space-y-4">
            <MotionDisplayWrapper className="w-full font-mono space-y-2 ">
                <div className="pt-4 border rounded-xl py-4 px-2 bg-cyan-500/60">
                    <h3 className="w-full text-center text-2xl font-bold">{'Learning just got better'}</h3>
                    <h3 className="w-full text-center font-semibold">{"Learn! Grow! Earn! Have fun!"}</h3>
                    <h3 className="w-full text-center text-xs">{"With Educaster, learning is fun"}</h3>
                </div>
                <div className="p-4 bg-cyan-500/10 border rounded-xl text-cyan-600 font-semibold">
                    <h3 className="w-full flex justify-between gap-1 ">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                        <p className="text-xs mb-2 underline">{'Key is a weekly passport with enormous benefits:'}</p>
                    </h3>
                    <div className=" text-[10px]">
                        <h3 className="pl-4">{'- A placeholder for stacking your scores'}</h3>
                        <h3 className="pl-4">{'- Qualifies you as a full member'}</h3>
                        <h3 className="pl-4">{'- Partake in weekly payout both in'} <strong className="text-cyan-900 font-bold text-md">{'$GROW '} </strong> and <strong className="text-cyan-900 font-bold text-md">{'$CELO'}</strong> if any</h3>
                    </div>
                </div>
            </MotionDisplayWrapper>
            {
                showGenerateUserKey? <div className="border rounded-lg p-4 font-mono bg-cyan-500/10">
                    <GenerateUserKey 
                        exit={() => setShowGenerateUserKey(false)} 
                        runAll={false}
                    />
                </div> : 
                    <MotionDisplayWrapper className="space-y-2  mt-4 font-mono">
                        { !isInMiniApp && <Button onClick={handleAddMiniApp}>Add Educaster to miniApps</Button>}
                        <div className="p-4 border rounded-lg space-y-2">
                            <h3>Quickstart</h3>
                            <Swipeable />
                        </div>
                        <ConnectButtons />
                        <div className="border rounded-lg p-4 space-y-1">
                            <h3>Pick a learning path</h3>
                            <Button { ...buttonProps({onClick: handleNavigate}) }>Quiz</Button>
                        </div>
                    </MotionDisplayWrapper>
            }
            <WelcomeScreen 
                openDrawer={showWelcomeScreen}
                toggleDrawer={(arg: number) => setShowWelcomeScreen(arg)}
            >
                <h3 className="border p-4 rounded-lg bg-cyan-500/10">Every week is a refreshing opportunity on Educaster. Passkey gives you access to get rewarded for the time you spent learning and interacting</h3>
            </WelcomeScreen>
        </div>

    );
}
