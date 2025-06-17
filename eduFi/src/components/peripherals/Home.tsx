import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components//ui/button";
import useStorage from "../StorageContextProvider/useStorage";
import { Swipeable } from "./Swipeable";
import SignIn from "./SignIn";

export default function Home() {
    const { setpath } = useStorage();
    
    return(
        <MotionDisplayWrapper className="space-y-4 font-mono mt-4">
            <h3 className="text-cente text-xl text-purple-900">{'Learning just got better!'}</h3>
            <div className="border bg-purple-500/10 text-center rounded-xl p-4 text-purple-800 font-bold">
                <h3 className="">{"Learn! Improve! Earn! Have fun!"}</h3>
                <h3 className="text-xs">{"With us, there is no dull moment"}</h3>
            </div>
            <div className="bg-cyan-500/5 w-full p-4 rounded-xl place-items-center">
                <h3 className="w-full text-sm text-start text-purple-800 italic pl-4">How it works</h3>
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