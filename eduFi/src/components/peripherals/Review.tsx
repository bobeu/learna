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

  return (
    <MotionDisplayWrapper className=" rounded-lg ">
        <h3>Your responses</h3>
        <Carousel className="w-full relative p-4 bg-cyan-500 rounded-lg">
            <CarouselContent className="">
                {dataRef.current.data.map(({options, userAnswer, question, answer}, id) => (
                <CarouselItem key={id} className="">
                    <MotionDisplayWrapper>
                        <div className='space-y-2 overflow-auto'> 
                            <MotionDisplayWrapper className="rounded-lg max-h-[400px] overflow-auto space-y-2">
                                {
                                    <div key={question}>
                                        <div className={`w-full place-items-center`}>
                                            <div className='w-full space-y-4'>
                                                <h1 className='font-mono bg-white p-4 rounded-lg max-w-full overflow-auto font-semibold text-cyan-800'>{`${id + 1}. ${question}`}</h1>
                                                <div className='w-full max-w-full bg-white overflow-auto grid grid-cols-1 border border-opacity-10 rounded-lg '>
                                                    {
                                                        options.map(({label, value}) => (
                                                            <div 
                                                                key={label} 
                                                                className={` 
                                                                    relative
                                                                      text-sm
                                                                    ${userAnswer === label && userAnswer === answer? 'bg-purple-500/20 text-md font-bold italic text-purple-700' : ''} 
                                                                    ${userAnswer === label && userAnswer !== answer && 'bg-red-500/20 text-red-700'}
                                                                    ${answer === label && 'bg-purple-500/20 text-md font-bold italic text-purple-700 p-4'}
                                                                    w-full flex justify-start items-baseline gap-4 p-3 cursor-not-allowed text-cyan-900 
                                                                    `
                                                                }
                                                            >
                                                                <h3 className={`${userAnswer === label && userAnswer=== answer? 'absolute right-0 top-0 text-purple-900 ' : 'hidden'}`}>Correct</h3>
                                                                <h3 className={`${(!userAnswer || (userAnswer=== label && userAnswer!== answer ))? 'absolute right-0 top-0 text-red-500 ' : 'hidden'}`}>Wrong</h3>
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
            <CarouselPrevious className="absolute -left-0 bg-cyan-900 text-cyan-50"/>
            <CarouselNext className="absolute right-0 bg-cyan-900 text-cyan-50"/>
        </Carousel>
    </MotionDisplayWrapper>
  )
}