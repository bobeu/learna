import React from "react";
import useStorage from "../hooks/useStorage";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import Image from "next/image";

const Error = () => {
    return (
        <h1 className="text-pink-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        </h1>
    );
}

export default function Message() {
    const { messages, errorMessage } = useStorage();
    const isError = errorMessage.length > 0;
    const display = messages.length > 0 || errorMessage.length > 0;
    const isEnded = messages.includes('ended') || errorMessage.includes('ended');
    const formattedMessage = isEnded? messages.replace('ended', '').replace('tip', '') : messages;
    return(
        <React.Fragment>
            {
                display && 
                    <MotionDisplayWrapper transitionDelay={0.3} className={`border ${isError? 'border-pink-500' : 'border-cyan-500/20'} rounded-lg p-4 text-xs space-y-2 `}>
                        {
                            isEnded && messages.includes('tip')?
                                <MotionDisplayWrapper className=" flex justify-center p-4 rounded-xl">
                                    <h3>Thank You</h3>
                                    <Image 
                                        src={'/thankYou.svg'}
                                        alt="Completed"
                                        width={100}
                                        height={100}

                                    />
                                </MotionDisplayWrapper> : <div>
                                    {
                                        isError?
                                            <MotionDisplayWrapper className={`w-full flex justify-start items-center gap-2 text-pink-500`}>
                                                <Error />
                                                <h1 className="max-w-sm overflow-auto">{ errorMessage.length > 50? 'Trasaction Failed' : errorMessage }</h1>
                                            </MotionDisplayWrapper> : 
                                            <MotionDisplayWrapper className={`w-full flex justify-start items-center gap-2 text-cyan-800`}>
                                                <h3>o</h3>
                                                <h1 className="max-w-sm overflow-auto">{ formattedMessage }</h1>
                                            </MotionDisplayWrapper>
                                    }
                                </div>
                        }
                    </MotionDisplayWrapper>
            }

        </React.Fragment>
    )
}