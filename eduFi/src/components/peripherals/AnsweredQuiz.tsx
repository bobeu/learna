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

export function AnsweredQuiz() {
  const { questionsId, questionIndex, dataRef } = useStorage();

  return (
    <React.Fragment>
      {
        questionIndex > 0? 
          <Carousel className="w-full relative bg-cyan-500 p-4 rounded-lg">
            <CarouselContent className="">
              {dataRef.current.data && dataRef.current.data.map(({question, hash}, id) => (
                <CarouselItem key={id} className="">
                  <MotionDisplayWrapper> 
                    <div className={`w-full h-fit`}>
                      {
                        questionsId.includes(hash) &&
                          <div className='relative w-full font-semibold p-4  rounded-lg text-center text-sm text-cyan-700'>
                              <h3 className='font-mono bg-white p-4 rounded-lg max-w-full overflow-auto font-semibold text-cyan-800'>{`${id + 1} ${question.slice(0, 20)}...?`}</h3>
                              <h3 className='absolute top-0 text-xs text-white  italic '>Answered</h3>
                          </div>
                      }
                    </div>
                  </MotionDisplayWrapper>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 bg-cyan-900 text-cyan-50"/>
            <CarouselNext className="absolute right-0 bg-cyan-900 text-cyan-50"/>
          </Carousel> : null
      }
    </React.Fragment>
  )
}