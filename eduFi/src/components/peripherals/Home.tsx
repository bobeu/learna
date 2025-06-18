import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components//ui/button";
import useStorage from "../hooks/useStorage";
import { Swipeable } from "./Swipeable";
import SignIn from "./SignIn";

export default function Home() {
    const { setpath } = useStorage();
    
    return(
        <MotionDisplayWrapper className="space-y-4 font-mono mt-4">
            <div className="text-purple-900 text-center">
                <h3 className="text-2xl text-purple-900 text-center font-semibold">{'Learning just got better'}</h3>
                <h3 className="font-semibold">{"Learn! Improve! Earn! Have fun!"}</h3>
                <h3 className="text-xs">{"With Educaster, no dull moment"}</h3>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-xl text-purple-800 font-bold">
                <h3 className="w-full flex justify-between gap-1 ">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    <h3 className="text-xs mb-2 underline">{'Key is a weekly passport with enormous benefits:'}</h3>
                </h3>
                <div className=" text-[10px] text-purple-700">
                    <h3 className="pl-4">{'- A placeholder for stacking your scores'}</h3>
                    <h3 className="pl-4">{'- Qualifies you as a full member'}</h3>
                    <h3 className="pl-4">{'- Partake in weekly payout both in'} <strong className="text-purple-700 font-bold">{'$GROW '} token</strong> and <strong className="text-purple-700 font-bold">{'$CELO'}</strong> if any</h3>
                </div>
            </div>
            <div className=" ">
                <h3 className="w-full text-sm text-start text-purple-800 italic">How it works</h3>
                <Swipeable />
                <SignIn />
                <Button 
                    // onClick={() => setpath('profile')}
                    onClick={() => setpath('selectcategory')}
                    variant={'outline'} 
                    className="w-full mt-1 bg-cyan-500"
                >
                    Get started
                </Button>
            </div>
        </MotionDisplayWrapper>
    );
}