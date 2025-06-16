import React from 'react';
import { MotionDisplayWrapper } from './MotionDisplayWrapper';
import { Button } from '~/components/ui/button';
import useStorage from '../StorageContextProvider/useStorage';
import Review from './Review';

export default function DisplayQuiz() {
    const { setpath, handleSelectAnswer, quizCompleted, questionIndex, showFinishButton, currentPath, selectedQuizData, getFunctions } = useStorage();
    const { closeQuizComplettion, clearData } = getFunctions();
    const handleViewScores = () => {
        closeQuizComplettion();
        setpath('scores');
    }
    const cancel = () => {
        clearData();
        setpath('selectcategory');
    };

    return(
        <MotionDisplayWrapper>
            <div className='space-y-4'>
                <div className=''>
                    <div className='space-y-2'>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3>Category</h3>
                            <h3 className='bg-cyan-500/20 p-4 text-cyan-700'>{selectedQuizData.category}</h3>
                        </div>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3>Difficulty level</h3>
                            <h3 className='bg-cyan-500/20 p-4 text-orange-600'>{selectedQuizData.data.difficultyLevel}</h3>
                        </div>
                    </div>
                </div>

                <MotionDisplayWrapper className="rounded-lg max-h-[400px] overflow-auto space-y-2">
                    {
                        !quizCompleted && selectedQuizData.data.questions
                            .map(({options, quest, userAnswer}, i) => (
                                <MotionDisplayWrapper key={quest}>
                                    <div className={`${i === questionIndex? 'block' : 'hidden'} w-full place-items-center`}>
                                        <div className='w-full space-y-4'>
                                            <h1 className='font-mono border-b pb-2 bg-cyan-500/20 p-4 rounded-lg max-w-full overflow-auto text-stone-900'>{`${i + 1}. ${quest}`}</h1>
                                            <div className='w-full max-w-full overflow-auto grid grid-cols-1 border border-opacity-10 rounded-lg'>
                                                {
                                                    options.map(({label, value}) => (
                                                        <div 
                                                            onClick={() => handleSelectAnswer({label, value})} 
                                                            key={value} 
                                                            className={`w-full flex justify-start items-baseline ${userAnswer?.label === label? 'bg-cyan-500/80' : ''} gap-4 p-4 cursor-pointer text-cyan-900 text-sm hover:bg-cyan-500/40`}
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
                            )
                        )
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