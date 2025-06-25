import React from 'react';
import { MotionDisplayWrapper } from './MotionDisplayWrapper';
import { Button } from '~/components/ui/button';
import useStorage from '../hooks/useStorage';
import Review from './Review';
import { Quiz } from './Quiz';
import { AnsweredQuiz } from './AnsweredQuiz';

const MAX_TIME_PER_QUESTION_IN_SECS = 30;

export default function DisplayQuiz() {
    const intervalId = React.useRef<string | number | NodeJS.Timeout | undefined>(undefined)
    const { 
        setpath, 
        questionIndex, 
        showFinishButton, 
        currentPath,
        clearData, 
        finalizeQuiz,
        handleSelectAnswer, 
        clearSelectedData, 
        dataRef,  } = useStorage();
    const [timeLeft, setTimeLeft] = React.useState<number>(MAX_TIME_PER_QUESTION_IN_SECS * dataRef.current.data.length);
    const [count, setCount] = React.useState<boolean>(false);
    const noQuestionLeft = questionIndex === dataRef.current.data.length;

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

    const { fiftyPercent, twentyFivePercent } = React.useMemo(() => {
        const twentyFivePercent = Math.floor(timeLeft / 4);
        const fiftyPercent = Math.floor(timeLeft / 2);
        console.log("twentyFivePercent", twentyFivePercent)
        console.log("fiftyPercent", fiftyPercent)
        return { fiftyPercent, twentyFivePercent }
    }, [timeLeft]);

    React.useEffect(() => {
        setCount(true);
    }, [clearSelectedData]);

    // Update the timer
    React.useEffect(() => {
        intervalId.current = setInterval(() => {
            if(count) setTimeLeft(timeLeft > 0? timeLeft - 1 : timeLeft);
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
                <div className=''>
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

                <MotionDisplayWrapper className="rounded-lg max-h-[400px] font-mono overflow-auto space-y-2">
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
                            {timeLeft === 0? 'Timeup' : `Time Left: ${timeLeft}`}
                        </h3>
                    </div>
                    { noQuestionLeft? <Review /> : <Quiz selectAnswer={selectAnswer} /> }
                    <AnsweredQuiz />
                </MotionDisplayWrapper>
                <MotionDisplayWrapper className='flex flex-col gap-2 justify-center items-center'>
                    <Button onClick={cancel} variant={'outline'} className="w-full bg-orange-500/50 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Cancel</Button>
                    {
                        showFinishButton && 
                            <div hidden={currentPath === 'scores' || currentPath === 'selectcategory'} className='w-full place-items-center space-y-2'>
                                { currentPath !== 'scores' && <Button variant={'outline'} onClick={handleViewScores} className='w-full font-mono bg-cyan-500/50'>View my scores</Button> }
                            </div>
                    }
                </MotionDisplayWrapper>

            </div>
        </MotionDisplayWrapper>
    );
}
