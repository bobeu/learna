import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components//ui/button";
import useStorage from "../hooks/useStorage";
import RecordPoints from "../transactions/RecordPoints";
import { useAccount, useChainId, useConfig, useReadContracts } from "wagmi";
import { type Address, filterTransactionData, type Profile, } from "../utilities";
import GenerateUserKey from "./GenerateUserKey";
import Drawer from "./Confirmation/Drawer";

interface WarnBeforeClearScoresAndDataProps {
    openDrawer: boolean; 
    toggleDrawer: (arg: boolean) => void
    saveScore: () => void;
    exit: () => void;
}

function WarnBeforeClearScoresAndData({openDrawer, exit, toggleDrawer, saveScore}: WarnBeforeClearScoresAndDataProps) {
    const handleSaveScore = () => {
        toggleDrawer(false);
        saveScore();
    }

    const handleExit = () => {
        toggleDrawer(false);
        exit();
    }

    return(
        <Drawer
            openDrawer={openDrawer}
            toggleDrawer={toggleDrawer}
            title={"Are you sure want to exit?"}
        >
            <div 
                className="font-mono space-y-4 w md:flex flex-col justify-center md:w-[424px] md:h-[695px]"
            >
                <p>Exiting without saving your scores will clear your progress</p>

                <h3 className="w-full flex justify-start items-baseline gap-2 border p-3 bg-cyan-500/20 text-cyan-600 rounded-lg">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                    </span>
                    <small>You cannot retake a quiz twice. We recommend that you save your scores to be eligible for weekly payout</small>
                </h3>

                <div className="flex justify-between items-center gap-1">
                    <Button onClick={handleSaveScore} variant={'outline'} className="bg-cyan-500 w-full">Save my scores</Button>
                    <Button onClick={handleExit} variant={'outline'} className="bg-orange-500/30 w-full">Exit anyway</Button>
                </div>
            </div>
        </Drawer>
    );
}

export default function Scores() {
    const [openDrawer, setDrawer] = React.useState<boolean>(false);
    const [showWarningBeforeExit, setShowWarning] = React.useState<boolean>(false);
    const [showGenerateUserKey, setShowGenerateUserKey] = React.useState<boolean>(false);

    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount().address as Address;
    const toggleDrawer = (arg:boolean) => setDrawer(arg);
    const backToScores = () => setShowGenerateUserKey(false);
    const { setpath, weekId, getFunctions, data } = useStorage();
    const { clearData, callback,  } = getFunctions();
    const { 
        category,
        noAnswer,
        difficultyLevel,
        totalScores,
        questionSize,
        weightPerQuestion,
        totalAnsweredCorrectly,
        totalAnsweredIncorrectly,
    } = data.scoreParam;

    // Back to review page and clear the previously selected quiz data
    const exit = () => {
        clearData();
        setpath('selectcategory');
    }

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
        const profile = result?.[0]?.result as Profile;
        if(!profile.haskey) setShowGenerateUserKey(true);
        else setDrawer(true);
    }

    return(
        <MotionDisplayWrapper>
            {
                showGenerateUserKey? <GenerateUserKey exit={backToScores} /> : 
                    <MotionDisplayWrapper className="space-y-4 font-mono">
                        <h3 className="text-center text-2xl ">Score card</h3>
                        <div className="space-y-2">
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[50%] bg-pruple-500/10">Total questions</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-cyan-900 font-bold w-[50%] text-center'>{questionSize}</h3>
                            </div>
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[50%] bg-pruple-500/10">Weight per question</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-cyan-900 font-bold w-[50%] text-center'>{weightPerQuestion}</h3>
                            </div>
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[50%] bg-pruple-500/10">Category</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-cyan-900 font-bold w-[50%] text-center'>{category}</h3>
                            </div>
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[50%] bg-pruple-500/10">Difficulty Level</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-cyan-900 font-bold w-[50%] text-center'>{difficultyLevel}</h3>
                            </div>
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[50%] bg-pruple-500/10">Correct answers</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-cyan-900 font-bold w-[50%] text-center'>{totalAnsweredCorrectly.length}</h3>
                            </div>
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[50%] bg-pruple-500/10">Incorrect answers</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-cyan-900 font-bold w-[50%] text-center'>{totalAnsweredIncorrectly}</h3>
                            </div>
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[50%] bg-pruple-500/10">Missed</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-cyan-900 font-bold w-[50%] text-center'>{noAnswer}</h3>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <div className="flex flex-col justify-center items-center space-y-2 bg-cyan-500/50 h-[150px] w-[150px] rounded-full text-sm place-items-center">
                                <h3>Scores</h3>
                                <h3 className="text-4xl font-black">{`${totalScores || 0}%`}</h3>
                            </div>
                        </div>
                        <div className="w-full grid grid-cols-1 gap-2">
                            <div className="flex justify-between items-center ">
                                <Button onClick={handleSaveScores} variant={'outline'} className="flex justify-between items-center w-2/4 bg-cyan-500 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">
                                    <h3 className="w-full text-center">Share</h3> 
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                        </svg>
                                    </span>
                                </Button>
                                <Button onClick={() => setShowWarning(true)} variant={'outline'} className="w-2/4 bg-orange-500/50 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Exit</Button>
                            </div>
                            <div className="place-items-center">
                                <Button onClick={handleSaveScores} variant={'outline'} className="w-full bg-cyan-500 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Save My Scores</Button>
                            </div>
                        </div>
                        
                    </MotionDisplayWrapper>
            }
            <RecordPoints 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
            />
            <WarnBeforeClearScoresAndData 
                openDrawer={showWarningBeforeExit}
                toggleDrawer={(arg) => setShowWarning(arg)}
                exit={exit}
                saveScore={handleSaveScores}
            />
        </MotionDisplayWrapper>
    );
}