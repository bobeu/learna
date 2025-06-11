import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import useStorage from "../StorageContextProvider/useStorage";
import GenerateKey from "../transactions/GenerateKey";
import RecordPoints from "../transactions/RecordPoints";

export default function GenerateUserKey() {
    const [openDrawer, setDrawer] = React.useState<number>(0);

    const toggleDrawer = (arg:number) => setDrawer(arg);
    const { setpath, firstTransactionDone  } = useStorage();
    const backToScores = () => setpath('scores');

    /**
     * Listen to update from confirmation component. Soon as the first transaction
     * i.e generateKey is completed, automatically move to recordPoints.
     */
    React.useEffect(() => {
        if(firstTransactionDone) toggleDrawer(1);
    }, [firstTransactionDone]);
    
    return(
        <MotionDisplayWrapper className="w-full text-center space-y-4">
            <div >
                <h3>{`Ooops! We can't find your key for this week!`}</h3>
            </div>
            <div className="w-full space-y-2">
                <GenerateKey />
                <Button onClick={backToScores} variant={'outline'} className="w-full bg-orange-500/30">Exit</Button>
            </div>
            <RecordPoints 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
            />
        </MotionDisplayWrapper>
    );
}