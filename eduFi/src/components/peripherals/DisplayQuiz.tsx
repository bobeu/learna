import React from 'react';
import { MotionDisplayWrapper } from './MotionDisplayWrapper';
import { Button } from '~/components/ui/button';
import useStorage from '../hooks/useStorage';
import Review from './Review';

const MAX_TIME_PER_QUESTION_IN_SECS = 30;

export default function DisplayQuiz() {
    const intervalId = React.useRef<string | number | NodeJS.Timeout | undefined>(undefined)
    const { setpath, quizCompleted, handleSelectAnswer, questionIndex, showFinishButton, currentPath, selectedQuizData, getFunctions } = useStorage();
    const [timeLeft, setTimeLeft] = React.useState<number>(MAX_TIME_PER_QUESTION_IN_SECS * selectedQuizData.data.questions.length);
    const [count, setCount] = React.useState<boolean>(true);
    // let intervalId: NodeJS.Timeout; 

    const { closeQuizComplettion, clearData } = getFunctions();
    const handleViewScores = () => {
        closeQuizComplettion();
        setpath('scores');
    }
    const cancel = () => {
        clearData();
        setCount(true);
        setpath('selectcategory');
    };

    const selectAnswer = ({label, value} : {label?:string, value?:string}) => {
        setCount(false); 
        handleSelectAnswer({label, value, userSelect: true});
    }

    const {questions, fiftyPercent, twentyFivePercent } = React.useMemo(() => {
        const twentyFivePercent = Math.floor(timeLeft / 4);
        const fiftyPercent = Math.floor(timeLeft / 2);
        const questions = selectedQuizData.data.questions.filter((_, index) => index === questionIndex);
        return { questions, fiftyPercent, twentyFivePercent }
    }, [questionIndex, selectedQuizData, timeLeft]);

    // Update the timer
    React.useEffect(() => {
        intervalId.current = setInterval(() => {
            if(count) setTimeLeft(timeLeft > 0? timeLeft - 1 : timeLeft);
            if(timeLeft === 0) {
                setCount(false);
            }
        }, 1000);

        return () => clearInterval(intervalId.current);
    }, [count, timeLeft, setTimeLeft]);

    return(
        <MotionDisplayWrapper>
            <div className='space-y-4'>
                <div className=''>
                    <div className='space-y-2'>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3 className="w-[50%] ">Category</h3>
                            <h3 className='w-[50%] bg-cyan-500/20 p-4 text-cyan-900 font-bold text-center'>{selectedQuizData.category}</h3>
                        </div>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3 className="w-[50%]">Difficulty level</h3>
                            <h3 className='w-[50%] bg-cyan-500/20 p-4 text-cyan-900 font-bold text-center'>{selectedQuizData.data.difficultyLevel}</h3>
                        </div>
                    </div>
                </div>

                <MotionDisplayWrapper className="rounded-lg max-h-[400px] overflow-auto space-y-2">
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
                    {
                        !quizCompleted && questions && questions.length > 0 && questions
                            .map(({options, quest: question, userAnswer}, index) => (
                                <MotionDisplayWrapper key={index}> 
                                    <div className={`w-full place-items-center`}>
                                        <div className='w-full space-y-4'>
                                            <h3 className='font-mono bg-cyan-500/50 p-4 rounded-lg max-w-full overflow-auto font-semibold text-cyan-800'>{`${index + 1}. ${question}`}</h3>
                                            <div className='w-full max-w-full overflow-auto grid grid-cols-1 border border-opacity-10 rounded-lg'>
                                                {
                                                    options.map(({label, value}) => (
                                                        <div 
                                                            onClick={() => selectAnswer({label, value})} 
                                                            key={value} 
                                                            className={`w-full flex justify-start items-baseline ${userAnswer?.label === label? 'bg-cyan-500/30 font-semibold' : ''} gap-4 p-4 cursor-pointer text-cyan-900 text-sm hover:bg-cyan-500/20`}
                                                        >
                                                            <h3 className="font-semibold italic">{`(${label}). `}</h3>
                                                            <h3 className='font-mono max-w-full overflow-auto'>{value}</h3>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </MotionDisplayWrapper>
                            ))
                    }
                    { quizCompleted && <Review /> }
                </MotionDisplayWrapper>
                <MotionDisplayWrapper className='flex flex-col gap-2 justify-center items-center'>
                    <Button onClick={cancel} variant={'outline'} className="w-full bg-orange-500/50 hover:bg-opacity-70 active:bg-cyan-500/50 active:shadow-sm active:shadow-gray-500/30">Cancel</Button>
                    {
                        showFinishButton && 
                            <div hidden={currentPath === 'scores' || currentPath === 'selectcategory'} className='w-full place-items-center space-y-2'>
                                {/* { currentPath !== 'review' && <Button variant={'outline'} onClick={() => setpath('review') } className='w-full font-mono bg-gray-300/30'>Review</Button> } */}
                                { currentPath !== 'scores' && <Button variant={'outline'} onClick={handleViewScores} className='w-full font-mono bg-cyan-500/50'>View my scores</Button> }
                            </div>
                    }
                </MotionDisplayWrapper>
            </div>
        </MotionDisplayWrapper>
    );
}
