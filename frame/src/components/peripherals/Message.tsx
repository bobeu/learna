import React from "react";
import useStorage from "../StorageContextProvider/useStorage";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";

const Error = () => {
    return (
        <h1>
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
    const inclusiveNone = (message: string) => message.endsWith('.none');
    
    return(
        <React.Fragment>
            {
                display && 
                    <MotionDisplayWrapper transitionDelay={0.3} className={`border ${isError? 'border-red-400' : 'border-green1/20 dark:border-white1/10'} rounded-lg p-4 text-xs text-left font-semibold text-green1/90 dark:text-white1`}>
                        {
                            messages.length > 0 && messages.map((message, index) => (
                                <MotionDisplayWrapper key={index} className={`w-full flex justify-start gap-2`}>
                                    { inclusiveNone(message)? <h3>X</h3> : <h3>O</h3> }
                                    <h1 className="max-w-sm overflow-auto">{ inclusiveNone(message)? message.replace('.none', '') : message }</h1>
                                </MotionDisplayWrapper>
                            ))
                        }
                        {
                            isError && <MotionDisplayWrapper className={`w-full flex justify-start gap-2 text-red-400`}>
                                <Error />
                                <h1 className="max-w-sm overflow-auto">{ errorMessage }</h1>
                            </MotionDisplayWrapper>
                        }
                    </MotionDisplayWrapper>
            }

        </React.Fragment>
    )
}