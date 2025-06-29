import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import GenerateKey from "../transactions/GenerateKey";

export default function GenerateUserKey({exit, runAll} : {exit: () => void, runAll: boolean}) {
    return(
        <MotionDisplayWrapper className="w-full text-center space-y-4">
            <div >
                <h3>{`Ooops! We can't find your key for this week!`}</h3>
            </div>
            <div className="w-full space-y-2">
                <GenerateKey functionName={runAll? 'runall' : 'generateKey' } />
                <Button onClick={exit} variant={'outline'} className="w-full bg-orange-500/30">Exit</Button>
            </div>
        </MotionDisplayWrapper>
    );
}