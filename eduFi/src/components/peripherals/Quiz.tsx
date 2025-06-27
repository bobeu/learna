"use-client"

import * as React from "react";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import useStorage from "../hooks/useStorage";
import { Button } from "../ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"

export function Quiz({ selectAnswer, disabled, hasAnsweredAll } : {selectAnswer: (arg : {label: string}) => void, disabled: boolean, hasAnsweredAll: boolean}) {
  const { questionIndex, dataRef, questionsId } = useStorage();

  const handleSelectAnswer = ({label} : {label: string}) => {
    selectAnswer({label});
  }
 
  return (
    <MotionDisplayWrapper className="w-full relative  p-4 rounded-lg font-mono">
      <Carousel className="w-full relative p-4 bg-cyan-500 rounded-lg">
        <CarouselContent className="">
          {dataRef.current.data && dataRef.current.data.map(({options, userAnswer, question, hash}, index) => (
            <CarouselItem key={index} className="">
              {/* hidden={questionIndex !== index} className={`${showFinishButton && 'opecity-1'}`} */}
              <MotionDisplayWrapper className=''> 
                <div className={`w-full h-fit`} hidden={questionIndex !== index}>
                  {
                    <div className='w-full space-y-4'> 
                        <h3 className=' bg-white p-4 rounded-lg max-w-full overflow-auto font-bold text-cyan-800'>{`${index + 1 }. ${question}`}</h3>
                        <div className='relative w-full max-w-full space-y-2 py-4 bg-white overflow-auto grid grid-cols-1 border border-opacity-10 rounded-lg'>
                          {
                            options.map(({label, value}, index) => (
                              <Button 
                                variant={"outline"}
                                disabled={disabled || questionsId.includes(hash)}
                                onClick={() => handleSelectAnswer({label})} 
                                key={index} 
                                className={`w-full border-none rounded-none p-5 flex justify-start items-center ${userAnswer === label? 'bg-cyan-500/30 font-semibold' : ''} gap-4 p-4 cursor-pointer text-cyan-900 text-sm hover:bg-cyan-500/20`}
                              >
                                <h3 className="font-semibold italic">{`(${label}). `}</h3>
                                <h3 className='max-w-full overflow-auto'>{value}</h3>
                                { !hasAnsweredAll && questionsId.includes(hash) && <h3 className='absolute right-2 text-xs text-cyan-700'>Answered</h3> }
                              </Button>
                            ))
                          }
                          { hasAnsweredAll && <h3 className='absolute -top-1 left-4 text-xs text-purple-500'>You already attempted these questions</h3> }
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
    </MotionDisplayWrapper>
  )
}