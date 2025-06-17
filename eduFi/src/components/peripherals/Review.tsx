import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../StorageContextProvider/useStorage";

export default function Review() {
    const { data: { questions }, } = useStorage();
    return(
        <MotionDisplayWrapper>
            <div className='space-y-4 max-w-[300px] overflow-auto'> 
                <h3 className="font-semibold text-purple-700">Quiz preview</h3>
                <MotionDisplayWrapper className="rounded-lg max-h-[400px] overflow-auto space-y-2">
                    {
                        questions
                            .map(({options, quest, userAnswer, correctAnswer}, i) => (
                                <div key={quest}>
                                    <div className={`w-full place-items-center`}>
                                        <div className='w-full space-y-4'>
                                            <h1 className='font-mono border-b pb-2 bg-cyan-500/20 p-4 rounded-lg max-w-full overflow-auto text-purple-900/90 font-semibold'>{`${i + 1}. ${quest}`}</h1>
                                            <div className='w-full max-w-full overflow-auto grid grid-cols-1 border border-opacity-10 rounded-lg'>
                                                {
                                                    options.map(({label, value}) => (
                                                        <div 
                                                            key={value} 
                                                            className={` 
                                                                text-sm
                                                                ${userAnswer?.label === label && userAnswer?.label === correctAnswer.label? 'bg-purple-500/20 text-md font-bold italic text-purple-700' : ''} 
                                                                ${userAnswer?.label === label && userAnswer?.label !== correctAnswer.label && 'bg-red-500/20 text-red-700'}
                                                                ${correctAnswer.label === label && 'bg-purple-500/20 text-md font-bold italic text-purple-700'}
                                                                w-full flex justify-start items-baseline gap-4 p-3 cursor-not-allowed text-cyan-900 
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
                {/* <div className=" space-y-2">
                    <Button onClick={backToQuiz} variant={'outline'} className="w-full bg-orange-500/30">Back</Button>
                    <Button onClick={viewScores} variant={'outline'} className="w-full bg-cyan-500/30">View Scores</Button>
                </div> */}
            </div>
        </MotionDisplayWrapper>
    );
}