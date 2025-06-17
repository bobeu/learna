import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import GenerateKey from "../transactions/GenerateKey";
import RecordPoints from "../transactions/RecordPoints";

export default function GenerateUserKey({totalScore, exit} : {totalScore: number, exit: () => void}) {
    const [openDrawer, setDrawer] = React.useState<boolean>(false);

    const toggleDrawer = (arg:boolean) => setDrawer(arg);
    const callback = () => setDrawer(true);
    return(
        <MotionDisplayWrapper className="w-full text-center space-y-4">
            <div >
                <h3>{`Ooops! We can't find your key for this week!`}</h3>
            </div>
            <div className="w-full space-y-2">
                <GenerateKey callback={callback} />
                <Button onClick={exit} variant={'outline'} className="w-full bg-orange-500/30">Exit</Button>
            </div>
            <RecordPoints 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
                totalScore={totalScore}
            />
        </MotionDisplayWrapper>
    );
}