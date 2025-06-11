import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import { Button } from "~/components/ui/button";
import useStorage from "../StorageContextProvider/useStorage";

export default function Review() {
    const { data: {category, questions, difficultyLevel }, setpath } = useStorage();
    const backToQuiz = () => setpath('quiz');
    const viewScores = () => setpath('scores');

    return(
        <MotionDisplayWrapper>
            <div className='space-y-4 max-w-[300px] overflow-auto'>
                <div className='space-y-4'>
                    {/* <Button variant={'outline'} className='font-mono text-xs py-2'>Back</Button> */}
                    <div className='space-y-2'>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3>Category</h3>
                            <h3 className='bg-cyan-500/20 p-4 text-cyan-700'>{category}</h3>
                        </div>
                        <div className='border pl-4 rounded-lg flex justify-between items-center text-xs font-mono'>
                            <h3>Difficulty level</h3>
                            <h3 className='bg-cyan-500/20 p-4 text-orange-600'>{difficultyLevel}</h3>
                        </div>
                    </div>
                </div>
 
                <MotionDisplayWrapper className="rounded-lg max-h-[400px] overflow-auto space-y-2">
                    {
                        questions
                            .map(({options, quest, userAnswer, correctAnswer}, i) => (
                                <div key={quest}>
                                    <div className={`w-full place-items-center`}>
                                        <div className='w-full space-y-4'>
                                            <h1 className='font-mono border-b pb-2 bg-cyan-500/20 p-4 rounded-lg max-w-full overflow-auto text-stone-900'>{`${i + 1}. ${quest}`}</h1>
                                            <div className='w-full max-w-full overflow-auto grid grid-cols-1 border border-opacity-10 rounded-lg'>
                                                {
                                                    options.map(({label, value}) => (
                                                        <div 
                                                            key={value} 
                                                            className={` 
                                                                ${userAnswer?.label === label && userAnswer?.label === correctAnswer.label? 'bg-green-500/50' : ''} 
                                                                ${userAnswer?.label === label && userAnswer?.label !== correctAnswer.label && 'bg-red-500/50'}
                                                                ${correctAnswer.label === label && 'bg-green-500/50'}
                                                                w-full flex justify-start items-baseline gap-4 p-4 cursor-not-allowed text-cyan-900 text-sm
                                                                `
                                                            }
                                                        >
                                                            <h3 className="font-semibold italic">{`(${label}). `}</h3>
                                                            <h3 className='font-mono max-w-full overflow-auto'>{value}</h3>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )
                    }
                </MotionDisplayWrapper>
                <div className="place-items-center space-y-2">
                    <Button onClick={backToQuiz} variant={'outline'} className="w-full bg-orange-500/30">Back</Button>
                    <Button onClick={viewScores} variant={'outline'} className="w-full bg-cyan-500/30">View Scores</Button>
                </div>
            </div>
        </MotionDisplayWrapper>
    );
}