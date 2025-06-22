import React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";

export default function Review() {
    const { data: selectedData, } = useStorage();
    return(
        <MotionDisplayWrapper className="font-mono">
            <div className='space-y-2 overflow-auto'> 
                <h3>Your responses</h3>
                <MotionDisplayWrapper className="rounded-lg max-h-[400px] overflow-auto space-y-2">
                    {
                        selectedData.data?.map(({correctAnswer, question, userAnswer, options }, i) => (
                                <div key={question}>
                                    <div className={`w-full place-items-center`}>
                                        <div className='w-full space-y-4 border border-opacity-10 rounded-lg'>
                                            <h1 className='font-mono p-4 bg-cyan-500/50 rounded-t-lg max-w-full overflow-auto '>{`${i + 1}. ${question}`}</h1>
                                            <div className='w-full max-w-full overflow-auto grid grid-cols-1 '>
                                                {
                                                    options.map(({label, value}) => (
                                                        <div 
                                                            key={value} 
                                                            className={` 
                                                                relative
                                                                text-sm
                                                                ${userAnswer?.label === label && userAnswer?.label === correctAnswer.label? 'bg-purple-500/20 text-md font-bold italic text-purple-700' : ''} 
                                                                ${userAnswer?.label === label && userAnswer?.label !== correctAnswer.label && 'bg-red-500/20 text-red-700'}
                                                                ${correctAnswer.label === label && 'bg-purple-500/20 text-md font-bold italic text-purple-700'}
                                                                w-full flex justify-start items-baseline gap-4 p-3 cursor-not-allowed text-cyan-900 
                                                                `
                                                            }
                                                        >
                                                            <h3 className={`${userAnswer?.label === label && userAnswer?.label === correctAnswer.label? 'absolute right-0 top-0 text-cyan-500 ' : 'hidden'}`}>Correct</h3>
                                                            <h3 className={`${(!userAnswer || (userAnswer?.label === label && userAnswer?.label !== correctAnswer.label))? 'absolute right-0 top-0 text-red-500 ' : 'hidden'}`}>Wrong</h3>
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
            </div>
        </MotionDisplayWrapper>
    );
}