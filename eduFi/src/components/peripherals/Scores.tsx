import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components//ui/button";
import useStorage from "../StorageContextProvider/useStorage";
import RecordPoints from "../transactions/RecordPoints";
import { useAccount, useChainId, useConfig, useReadContracts } from "wagmi";
import { type Address, filterTransactionData, mockScoresParam, type Profile, ScoresParam } from "../utilities";
import GenerateUserKey from "./GenerateUserKey";

const TOTAL_WEIGHT = 100;

export default function Scores() {
    const [openDrawer, setDrawer] = React.useState<boolean>(false);
    const [showGenerateUserKey, setShowGenerateUserKey] = React.useState<boolean>(false);
    const [sc, setScores] = React.useState<ScoresParam>(mockScoresParam);

    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount().address as Address;
    const toggleDrawer = (arg:boolean) => setDrawer(arg);
    const backToScores = () => setShowGenerateUserKey(false);
    const { setpath, weekId, getFunctions, selectedQuizData } = useStorage();
    const { clearData, callback,  } = getFunctions();
    
    // Back to review page and clear the previously selected quiz data
    const exit = () => {
        clearData();
        setpath('selectcategory');
    }

    React.useEffect(() => {
        const { category, difficultyLevel, questions } = selectedQuizData.data;
        const questionSize = questions.length;
        const weightPerQuestion = Math.floor(TOTAL_WEIGHT / questionSize);
        const totalAnsweredCorrectly = questions.filter(({userAnswer, correctAnswer}) => userAnswer?.label === correctAnswer.label);
        const totalAnsweredIncorrectly = questionSize - totalAnsweredCorrectly.length;
        const totalScores = weightPerQuestion * totalAnsweredCorrectly.length;
        // console.log("tScor", totalScores)
        setScores({
            category,
            difficultyLevel,
            totalScores,
            questionSize,
            weightPerQuestion,
            totalAnsweredCorrectly,
            totalAnsweredIncorrectly,
        });
    }, [selectedQuizData, setScores]);


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
                showGenerateUserKey? <GenerateUserKey totalScore={sc.totalScores} exit={backToScores} /> : 
                    <MotionDisplayWrapper className="space-y-4 font-mono">
                        <h3 className="text-center text-2xl ">Score card</h3>
                        <div className="space-y-2">
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[60%]">Total questions</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{sc.questionSize}</h3>
                            </div>
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[60%]">Weight per question</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{sc.weightPerQuestion}</h3>
                            </div>
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[60%]">Category</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{sc.category}</h3>
                            </div>
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[60%]">Difficulty Level</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{sc.difficultyLevel}</h3>
                            </div>
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[60%]">Correct answers</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{sc.totalAnsweredCorrectly.length}</h3>
                            </div>
                            <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                                <h3 className="w-[60%]">Incorrect answers</h3>
                                <h3 className='bg-cyan-500/20 p-4 text-orange-600 w-[40%] text-center'>{sc.totalAnsweredIncorrectly}</h3>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <div className="flex flex-col justify-center items-center space-y-2 bg-cyan-500/50 h-[150px] w-[150px] rounded-full text-sm place-items-center">
                                <h3>Scores</h3>
                                <h3 className="text-4xl">{`${sc.totalScores || 0}%`}</h3>
                            </div>
                        </div>
                        <div className="w-full grid grid-cols-1">
                            <div className="flex justify-between items-center ">
                                <Button onClick={handleSaveScores} variant={'outline'} className="w-full bg-cyan-500 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Save My Scores</Button>
                                <Button onClick={exit} variant={'outline'} className="w-full bg-orange-500/50 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Exit</Button>
                            </div>
                            <div className="flex flex-cols justify-between items-center gap-2 border">
                                <h3>Celebrate your achievement</h3>
                                <Button onClick={handleSaveScores} variant={'outline'} className="w-full bg-cyan-500 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">
                                    Share with friends or in feed
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                        
                    </MotionDisplayWrapper>
            }
            <RecordPoints 
                totalScore={sc.totalScores}
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
            />
        </MotionDisplayWrapper>
    );
}