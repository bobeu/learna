import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components//ui/button";
import useStorage from "../hooks/useStorage";
import { Swipeable } from "./Swipeable";
import { useMiniApp } from '@neynar/react';
import ConnectButtons, { buttonProps } from "../ConnectButtons";

export default function Home() {
    const { setpath, setmessage } = useStorage();
    const { isSDKLoaded, isInMiniApp, actions } = useMiniApp();

    // Add Educaster to user's list of miniApps
    const handleAddMiniApp = async () => {
      if (!isSDKLoaded) return;
      const result = await actions.addMiniApp();
      if (result.notificationDetails) {
        // Mini app was added and notifications were enabled
        setmessage(`Educaster added to miniApps`);
      }
    };
    
    return(
        <React.Fragment>
            <MotionDisplayWrapper className="w-full font-mono space-y-2 ">
                <div className="text-white pt-4 border rounded-xl py-4 px-2 bg-cyan-500/80">
                    <h3 className="w-full text-center text-2xl font-bold">{'Learning just got better'}</h3>
                    <h3 className="w-full text-center font-semibold text-white">{"Learn! Grow! Earn! Have fun!"}</h3>
                    <h3 className="w-full text-center text-xs text-white">{"With Educaster, learning is fun"}</h3>
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
            <MotionDisplayWrapper className="space-y-2  mt-4 font-mono">
                { !isInMiniApp && <Button onClick={handleAddMiniApp}>Add Educaster to miniApps</Button>}
                <div className="p-4 border rounded-lg space-y-2">
                    <h3>Quickstart</h3>
                    <Swipeable />
                </div>
                <ConnectButtons />
                <div className="border rounded-lg p-4 space-y-1">
                    <h3>Pick a learning path</h3>
                    <Button { ...buttonProps({onClick: () => setpath('selectcategory')}) }>Quiz</Button>
                </div>
            </MotionDisplayWrapper>
        

        </React.Fragment>

    );
}


{/* <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
<NeynarAuthButton className="right-4 top-4"/>
</div> */}