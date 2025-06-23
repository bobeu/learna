import React from "react";
import useStorage from "../hooks/useStorage";
import { MotionDisplayWrapper } from "./MotionDisplayWrapper";
import Image from "next/image";

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
    const { currentPath, messages, errorMessage, taskCompleted, setpath, getFunctions } = useStorage();
    const { clearData, setError, setmessage, toggleLoading } = getFunctions();

    const isError = errorMessage.length > 0;
    const display = messages.length > 0 || errorMessage.length > 0;
    const inclusiveNone = (message: string) => message.endsWith('.none');

    React.useEffect(() => {
        if(messages !== '') setmessage('');
        if(errorMessage !== '') setError('');
    }, []);

    React.useEffect(() => {
        if(taskCompleted === '') {
            toggleLoading(false);
            clearData();
            if(currentPath !== 'profile') setpath('profile');
        }
    }, [taskCompleted, currentPath, toggleLoading, clearData, setpath]);
    
    return(
        <React.Fragment>
            {
                display && 
                    <MotionDisplayWrapper transitionDelay={0.3} className={`border ${isError? 'border-red-400' : 'border-cyan-500/20'} rounded-lg p-4 text-xs space-y-2 `}>
                        {
                            taskCompleted === ''? 
                                <MotionDisplayWrapper className="bg-cyan-500/30 flex justify-center p-4 rounded-xl">
                                    <Image 
                                        src={'/thankYou.svg'}
                                        alt="Completed"
                                        width={150}
                                        height={150}
                                    />
                                </MotionDisplayWrapper> : 
                            
                                <div>
                                    <MotionDisplayWrapper className={`w-full flex justify-start gap-2 pl-1`}>
                                        { inclusiveNone(messages)? <h3>X</h3> : <h3 className="font-mono font-semibold">O</h3> }
                                        <h1 className="max-w-sm overflow-auto">{ inclusiveNone(messages)? messages.replace('.none', '') : messages }</h1>
                                    </MotionDisplayWrapper>
                                    {
                                        isError && <MotionDisplayWrapper className={`w-full flex justify-start items-center gap-2 text-red-500`}>
                                            <Error />
                                            <h1 className="max-w-sm overflow-auto">{ errorMessage.length > 50? 'Trasaction Failed' : errorMessage }</h1>
                                        </MotionDisplayWrapper>
                                    }
                                </div>
                        }
                    </MotionDisplayWrapper>
            }

        </React.Fragment>
    )
}