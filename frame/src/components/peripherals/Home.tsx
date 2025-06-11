import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components//ui/button";
import useStorage from "../StorageContextProvider/useStorage";
import { Swipeable } from "./Swipeable";
import SignIn from "./SignIn";

export default function Home() {
    const { setpath } = useStorage();
    
    return(
        <MotionDisplayWrapper className="space-y-2 font-mono">
            <h3 className="text-center text-2xl">{'Welcome!'}</h3>
            <div>
                <h3 className="text-center">Learna is platform that rewards you for improving your knowledge base</h3>
            </div>
            <div className="space-y-">
                <h3 className="text-sm italic pl-4">How it works</h3>
                <Swipeable />
                <SignIn />
                <Button 
                    // onClick={() => setpath('profile')}
                    onClick={() => setpath('selectcategory')}
                    variant={'outline'} 
                    className="w-full mt-1 bg-cyan-500"
                >
                    Let me in
                </Button>
            </div>
        </MotionDisplayWrapper>
    );
}