"use-client"

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";

export default function Review() {
    const { dataRef } = useStorage();

  // Scrutinize the questions for ones already answered by the user.
    const didNotAttemptAllQuestions = () => {
        type N = 'yes' | 'no';
        const isEmptyAllThrough : N[] = [];
        dataRef.current.data.forEach(({userAnswer}) => {
            if(userAnswer === '') {
                isEmptyAllThrough.push('yes');
            } else {
                isEmptyAllThrough.push('no');
            }
        });
        return !isEmptyAllThrough.includes('no');
    };

  return (
    <MotionDisplayWrapper className=" rounded-lg space-y-3">
        <div className="flex justify-between items-center border rounded-lg">
            <h3 className="w-2/4 p-3">Your responses</h3>
            {didNotAttemptAllQuestions() && <h3 className={`text-red-900 text-center bg-red-500/20 p-3 text-xs w-2/4`}>Taken but no answer was selected</h3>}
        </div>
        <Carousel className="w-full relative">
            <CarouselContent className="">
                {dataRef.current.data.map(({options, userAnswer, question, answer}, id) => (
                <CarouselItem key={id}>
                    <MotionDisplayWrapper>
                        {/* { didNotAttemptAllQuestions() && <h3 className="top-40 left-40">Please select another question</h3>} */}
                        {/* <div className={`space-y-2 overflow-auto ${didNotAttemptAllQuestions() && "opacity-10"}`}>  */}
                        <div className={`space-y-2 overflow-auto`}> 
                            <MotionDisplayWrapper className="rounded-lg max-h-[400px] overflow-auto space-y-2">
                                {
                                    <div key={question}>
                                        <div className={`w-full place-items-center`}>
                                            <div className='w-full space-y-4'>
                                                <h1 className='font-mono bg-cyan-500/60 p-4 rounded-lg max-w-full overflow-auto font-semibold text-cyan-800'>{`${id + 1}. ${question}`}</h1>
                                                <div className='w-full max-w-full bg-cyan-500/10 overflow-auto grid grid-cols-1 border rounded-lg py-4'>
                                                    {
                                                        options.map(({label, value}) => (
                                                            <div 
                                                                key={label} 
                                                                className={` 
                                                                    relative
                                                                      text-sm
                                                                    ${userAnswer === label && userAnswer === answer? 'bg-purple-500/20 text-md font-bold italic text-purple-700' : ''} 
                                                                    ${userAnswer === label && userAnswer !== answer && 'bg-red-500/20 text-red-700'}
                                                                    ${answer === label && (userAnswer !== '') && 'bg-purple-500/20 text-md font-bold italic text-purple-700 p-4'}
                                                                    w-full flex justify-start items-baseline gap-4 p-4 cursor-not-allowed text-cyan-900 
                                                                    `
                                                                }
                                                            >
                                                                <h3 className={`${userAnswer === label && userAnswer=== answer? 'absolute right-0 top-0 text-purple-900 ' : 'hidden'}`}>Correct</h3>
                                                                <h3 className={`${(userAnswer !== '') && (answer === label) && (userAnswer!== answer)? 'absolute right-0 top-0 text-red-500 ' : 'hidden'}`}>Wrong</h3>
                                                                <h3 className="font-semibold italic">{`(${label}). `}</h3>
                                                                <h3 className='font-mono max-w-full overflow-auto'>{value}</h3>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </MotionDisplayWrapper>
                        </div>
                    </MotionDisplayWrapper>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-2  bg-cyan-900 text-cyan-50"/>
            <CarouselNext className="absolute -right-2 bg-cyan-900 text-cyan-50"/>
        </Carousel>
    </MotionDisplayWrapper>
  )
}