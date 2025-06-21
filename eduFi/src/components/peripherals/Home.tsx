import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components//ui/button";
import useStorage from "../hooks/useStorage";
import { Swipeable } from "./Swipeable";
// import SignIn from "./SignIn";
import { useMiniApp } from '@neynar/react';
// import { NeynarAuthButton } from "@neynar/react";
import ConnectButtons, { buttonProps } from "../ConnectButtons";
import { useAccount } from "wagmi";

export default function Home() {
    const { setpath } = useStorage();
    const { isSDKLoaded, isInMiniApp, actions, context } = useMiniApp();
    const { getFunctions } = useStorage();
    const { isConnected } = useAccount();

    // Add Educaster to user's list of miniApps
    const handleAddMiniApp = async () => {
      if (!isSDKLoaded) return;
      const result = await actions.addMiniApp();
      if (result.notificationDetails) {
        // Mini app was added and notifications were enabled
        getFunctions().setmessage(`Educaster added to miniApps`);
      }
    };
    
    return(
        <React.Fragment>
            <MotionDisplayWrapper className="w-full font-mono space-y-2 ">
                <div className="text-cyan-900 pt-4 border rounded-xl pb-4 bg-cyan-500/10">
                    <h3 className="w-full text-center text-3xl font-bold">{'Learning just got better'}</h3>
                    <h3 className="w-full text-center font-semibold text-purple-800">{"Learn! Earn! Have fun!"}</h3>
                    <h3 className="w-full text-center text-xs text-purple-700">{"With Educaster, no dull moment"}</h3>
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
            <MotionDisplayWrapper className="space-y-4  mt-4 font-mono">
                { !isInMiniApp && <Button onClick={handleAddMiniApp}>Add Educaster to miniApps</Button>}
                <h3 className="w-full text-start ">How it works</h3>
                <Swipeable />
                <ConnectButtons />
                { isConnected && <Button { ...buttonProps({onClick: () => setpath('selectcategory')}) }>Get started</Button> }
            </MotionDisplayWrapper>
        

        </React.Fragment>

    );
}


{/* <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
<NeynarAuthButton className="right-4 top-4"/>
</div> */}