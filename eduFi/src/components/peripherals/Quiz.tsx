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

export function Quiz({ selectAnswer } : {selectAnswer: (arg : {label: string}) => void}) {
  const { questionIndex, dataRef, showFinishButton } = useStorage();

  return (
    <Carousel className="w-full relative bg-cyan-500 p-4 rounded-lg ">
      <CarouselContent defaultValue={questionIndex}>
        {dataRef.current.data && dataRef.current.data.map(({options, userAnswer, question}, index) => (
          <CarouselItem key={index} className={`${showFinishButton && 'opecity-0'}`}>
            <MotionDisplayWrapper className=''> 
              <div className={`w-full h-fit`}>
                {
                  <div hidden={index !== questionIndex} className='w-full space-y-4'>
                      <h3 className='font-mono bg-white p-4 rounded-lg max-w-full overflow-auto font-semibold text-cyan-800'>{`${questionIndex + 1}. ${question}`}</h3>
                      <div className='w-full max-w-full bg-white overflow-auto grid grid-cols-1 border border-opacity-10 rounded-lg'>
                        {
                          options.map(({label, value}, index) => (
                            <div 
                              onClick={() => selectAnswer({label})} 
                              key={index} 
                              className={`w-full flex justify-start items-baseline ${userAnswer === label? 'bg-cyan-500/30 font-semibold' : ''} gap-4 p-4 cursor-pointer text-cyan-900 text-sm hover:bg-cyan-500/20`}
                            >
                              <h3 className="font-semibold italic">{`(${label}). `}</h3>
                              <h3 className='font-mono max-w-full overflow-auto'>{value}</h3>
                            </div>
                          ))
                        }
                      </div>
                  </div>
                }
              </div>
            </MotionDisplayWrapper>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-0 bg-cyan-900 text-cyan-50"/>
      <CarouselNext className="absolute bottom-0 right-0 bg-cyan-900 text-cyan-50"/>
    </Carousel>
  )
}