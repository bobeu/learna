import React from 'react';
import { MotionDisplayWrapper } from './MotionDisplayWrapper';
import { Button } from '~/components/ui/button';
import useStorage from '../hooks/useStorage';
import Review from './Review';
import { Quiz } from './Quiz';
import { AnsweredQuiz } from './AnsweredQuiz';
import { WarnBeforeClearScoresAndData } from './Scores';
import RecordPoints from "../transactions/RecordPoints";
import { useAccount, useChainId, useConfig, useReadContracts } from "wagmi";
import { type Address, filterTransactionData, type Profile, } from "../utilities";
import GenerateUserKey from "./GenerateUserKey";

const MAX_TIME_PER_QUESTION_IN_SECS = 20;

export default function DisplayQuiz() {
    const intervalId = React.useRef<string | number | NodeJS.Timeout | undefined>(undefined)
    const [openDrawer, setDrawer] = React.useState<number>(0);
    const [showWarningBeforeExit, setShowWarning] = React.useState<number>(0);
    const [showGenerateUserKey, setShowGenerateUserKey] = React.useState<boolean>(false);
    
    const { 
        setpath, 
        questionIndex, 
        showFinishButton, 
        currentPath,
        questionsId,
        clearData, 
        callback,
        finalizeQuiz,
        handleSelectAnswer, 
        clearSelectedData,
        weekId, 
        dataRef,  } = useStorage();
    
    const totalQuizDuration = MAX_TIME_PER_QUESTION_IN_SECS * dataRef.current.data.length;
    const [timeLeft, setTimeLeft] = React.useState<number>(totalQuizDuration);
    const [count, setCount] = React.useState<boolean>(false);
    const noQuestionLeft = questionIndex === dataRef.current.data.length;
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount().address as Address;
    const twentyFivePercent = Math.floor(totalQuizDuration / 4);
    const fiftyPercent = Math.floor(totalQuizDuration / 2);
    const toggleDrawer = (arg:number) => setDrawer(arg);
    const backToScores = () => setShowGenerateUserKey(false);

    // Scrutinize the questions for ones already answered by the user.
    const hasAnsweredAll = React.useMemo(() => {
        type N = 1 | 0;
        let result : N[] = [];
        dataRef.current.data.forEach(({hash}) => {
            if(questionsId.includes(hash)) result.push(1);
        });
        return result.includes(1)? true : false;
    }, [dataRef]);

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

    const handleViewScores = () => {
        setpath('scores');
    }
    const cancel = () => {
        clearData();
        setpath('selectcategory');
    };

    const selectAnswer = (arg : {label: string}) => {
        if(count === false) return alert('Time Up');
        handleSelectAnswer(arg);
    }

    const handleSaveScores = () => {
        if(!result || !result?.[0].result) return alert('Please check your connection');
        const profile = result?.[0]?.result as Profile;
        if(!profile.haskey) setShowGenerateUserKey(true);
        else setDrawer(1);
    }

    React.useEffect(() => {
        setCount(true);
    }, [clearSelectedData]);

    // Update the timer
    React.useEffect(() => {
        intervalId.current = setInterval(() => {
            if(count && !hasAnsweredAll) setTimeLeft(timeLeft > 0? timeLeft - 1 : timeLeft);
            if(timeLeft === 0 || noQuestionLeft) {
                setCount(false);
                finalizeQuiz();
            }
        }, 1000);
        return () => clearInterval(intervalId.current);
    }, [count, noQuestionLeft, timeLeft, setTimeLeft, setCount, finalizeQuiz]);

    return(
        <MotionDisplayWrapper>
            <div className='space-y-4'>
                <div className='pt-4'>
                    <div className='space-y-2'>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3 className="w-[50%] ">Category</h3>
                            <h3 className='w-[50%] bg-cyan-500/20 p-4 text-cyan-900 font-bold text-center'>{dataRef.current.category}</h3>
                        </div>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3 className="w-[50%]">Difficulty level</h3>
                            <h3 className='w-[50%] bg-cyan-500/20 p-4 text-cyan-900 font-bold text-center'>{dataRef.current.selectedLevel}</h3>
                        </div>
                    </div>
                </div>

                {
                    showGenerateUserKey? <GenerateUserKey exit={backToScores} /> : 
                        <MotionDisplayWrapper className="rounded-lg max-h-fit font-mono overflow-auto space-y-2">
                            <div className="flex justify-center items-center">
                                <h3 
                                    className={
                                        `
                                            w-full text-center rounded-xl p-4
                                            ${timeLeft < twentyFivePercent && 'bg-red-500/10 text-red-700'} 
                                            ${(timeLeft > twentyFivePercent && timeLeft < fiftyPercent) && 'bg-purple-500/10 text-purple-700'} 
                                            ${timeLeft > fiftyPercent && 'bg-cyan-500/10 text-cyan-700'} 
                                            ${timeLeft === 0 && 'bg-red-500/10 text-red-700'}
                                        `
                                    }
                                >
                                    {timeLeft === 0? 'Timeup' : `Time Left: ${timeLeft} sec`}
                                </h3>
                            </div>
                            { (noQuestionLeft || !showFinishButton || timeLeft === 0)? <Review /> : <Quiz selectAnswer={selectAnswer} disabled={hasAnsweredAll || timeLeft === 0} hasAnsweredAll={hasAnsweredAll} /> }
                            <AnsweredQuiz />
                        </MotionDisplayWrapper>
                }
                <MotionDisplayWrapper className='flex flex-col gap-2 justify-center items-center'>
                    <Button onClick={hasAnsweredAll? cancel : () => setShowWarning(1)} variant={'outline'} className="w-full bg-orange-500/50 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Cancel</Button>
                    {
                        showFinishButton && 
                            <div hidden={currentPath === 'scores' || currentPath === 'selectcategory'} className='w-full place-items-center space-y-2'>
                                { currentPath !== 'scores' && <Button variant={'outline'} onClick={handleViewScores} className='w-full font-mono bg-cyan-500/50'>View my scores</Button> }
                            </div>
                    }
                </MotionDisplayWrapper>
            
            <RecordPoints 
                openDrawer={openDrawer}
                toggleDrawer={toggleDrawer}
            />
            </div><WarnBeforeClearScoresAndData 
                openDrawer={showWarningBeforeExit}
                toggleDrawer={(arg) => setShowWarning(arg)}
                exit={cancel}
                saveScore={handleSaveScores}
            />

        </MotionDisplayWrapper>
    );
}
