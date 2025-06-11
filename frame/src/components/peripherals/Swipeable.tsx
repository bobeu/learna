"use-client"

import * as React from "react";
import Image from "next/image";

import { Card, CardContent } from "~/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"

export function Swipeable() {
  return (
    <Carousel 
        className="w-full max-w-xs relative"
    >
      <CarouselContent>
        {carouselContent.map(({id, imageName, imageUrl, text}) => (
          <CarouselItem key={id}>
            <div className="h-[310px] place-items-center text-center">
                <h3 className="text-sm h-[160px] pt-4 px-4 rounded-t-xl bg-cyan-500/20">{ text }</h3>
                <div className="bg-cyan-500/50 w-full h-[150px] flex justify-center p-4 rounded-b-xl">
                    <Image 
                        src={imageUrl}
                        alt={imageName}
                        width={100}
                        height={100}
                        style={{width: 'auto', height: 'auto'}}
                    />
                </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute -left-4 bg-cyan-900 text-cyan-50"/>
      <CarouselNext className="absolute -right-4 bg-cyan-900 text-cyan-50"/>
    </Carousel>
  )
}

const carouselContent = [
    {
        id: 0,
        text: "The first step is to generate a user key. Generating a key is weekly action, and is optional, however, we recommend it as you will need it to save your scores and secure a spot to unlock and claim your reward for the week.",
        imageUrl: './key.svg',
        imageName: 'key'
    },
    {
        id: 1,
        text: "Select a category of your choice. Ex. Solidity. Pick your experience from the difficulty level. Ex. Beginner. You will receive questions based on the level you have selected.",
        imageUrl: './selectCategory.svg',
        imageName: 'selectCategory'
    },
    {
        id: 2,
        text: "Each question has a time duration. When the time elapses, it moves to the next question automatically. Be sure of the answer you're selecting as questions cannot be roll back",
        imageUrl: './timing.svg',
        imageName: 'timing'
    },
    {
        id: 3,
        text: "When you're done, you can review your answers and see your scores. If you intend to ratake the quiz, you will be required to pay a token",
        imageUrl: '/review.svg',
        imageName: 'review'
    },
    {
        id: 4,
        text: "After reviewing your scores, save it onchain using the key you generated in the first step. Each saved scores qualifies you to be eligible for weekly reward",
        imageUrl: './save.svg',
        imageName: 'save'
    },
    {
        id: 5,
        text: "Every weekend, check your dashboard to claim rewards and achievements. Note: you need your key for this step",
        imageUrl: './claim.svg',
        imageName: 'claim'
    },
];


{/* <Carousel
  opts={{
    align: "start",
    loop: true,
  }}
></Carousel> */}
