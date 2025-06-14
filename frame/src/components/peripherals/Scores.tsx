import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components//ui/button";
import useStorage from "../StorageContextProvider/useStorage";
import RecordPoints from "../transactions/RecordPoints";
import { useAccount, useChainId, useConfig, useReadContracts } from "wagmi";
import { 
    type Address, 
    filterTransactionData, 
    type TransactionCallback,
    type Profile
} from "../utilities";

const TOTAL_WEIGHT = 100;

export default function Scores() {
    const [openDrawer, setDrawer] = React.useState<boolean>(false);

    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount().address as Address;
    const toggleDrawer = (arg:boolean) => setDrawer(arg);
    const { setpath, setError, setmessage, weekId, scoresParam } = useStorage();
    const callback : TransactionCallback = (arg) => {
        if(arg.message) setmessage(arg.message);
        if(arg.errorMessage) setError(arg.errorMessage);
    }

    // Back to review page and clear the previously selected quiz data
    const exit = () => {
        setpath('selectcategory');
        // clearData();
    }

    const { 
        totalScores,
        questionSize,
        weightPerQuestion,
        totalAnsweredCorrectly,
        totalAnsweredIncorrectly,
        category,
        difficultyLevel

    } = React.useMemo(() => {
       const scores = scoresParam;
        return{ ...scores}
    }, [scoresParam]);

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

    const handleSaveScores = () => {
        if(!result || !result?.[0].result) return alert('Please check your connection');
        let profile = result?.[0]?.result as Profile;
        !profile.haskey? setpath('generateuserkey') : setDrawer(true);
    }

    return(
        <MotionDisplayWrapper className="space-y-4 font-mono">
            <h3 className="text-center text-2xl ">Score card</h3>
            <div className="space-y-2">
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Total questions</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{questionSize}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Weight per question</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{weightPerQuestion}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Category</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{category}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Difficulty Level</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{difficultyLevel}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Correct answers</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{totalAnsweredCorrectly.length}</h3>
                </div>
                <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                    <h3 className="w-[60%]">Incorrect answers</h3>
                    <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{totalAnsweredIncorrectly}</h3>
                </div>
            </div>
            <div className="flex justify-center">
                <div className="flex flex-col justify-center items-center space-y-2 bg-cyan-500/50 h-[150px] w-[150px] rounded-full text-sm place-items-center">
                    <h3>Scores</h3>
                    <h3 className="text-4xl">{`${totalScores || 0}%`}</h3>
                </div>
            </div>
            <div className="flex justify-center items-center gap-1 w-full">
                <Button onClick={handleSaveScores} variant={'outline'} className="w-full bg-cyan-500 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Save My Scores</Button>
                <Button onClick={exit} variant={'outline'} className="w-full bg-orange-500/50 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Exit</Button>
            </div>
            <RecordPoints 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
            />
        </MotionDisplayWrapper>
    );
}