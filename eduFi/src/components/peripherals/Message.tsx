import React from "react";
import useStorage from "../StorageContextProvider/useStorage";
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

export default function Message({completed, parentMessage, parentErrorMessage, setCompletion, closeDrawer} : {completed: boolean, parentMessage: string, parentErrorMessage: string, closeDrawer: () => void, setCompletion: () => void}) {
    const { currentPath, setpath, getFunctions } = useStorage();
    const { clearData } = getFunctions();
    const [message, setMessage] = React.useState<string>(parentMessage);
    const [error, setError] = React.useState<string>(parentErrorMessage);

    const isError = error.length > 0;
    const display = message.length > 0 || error.length > 0;
    const inclusiveNone = (message: string) => message.endsWith('.none');

    React.useEffect(() => {
        if(completed) {
            closeDrawer();
            if(message !== '') setMessage('');
            if(error) setError('');
            clearData();
            if(currentPath !== 'profile') setpath('profile');
            const timeoutObj = setTimeout(() => {
                setCompletion();
            }, 4000);
            clearTimeout(timeoutObj);
        } else {
            setMessage(parentMessage);
            setError(parentErrorMessage);
        }
    }, [completed, currentPath, error, message, setCompletion, parentMessage, parentErrorMessage, closeDrawer, clearData, setpath]);
    
    return(
        <React.Fragment>
            {
                display && 
                    <MotionDisplayWrapper transitionDelay={0.3} className={`border ${isError? 'border-red-400' : 'border-cyan-500/20'} rounded-lg p-4 text-xs space-y-2 `}>
                        {
                            completed? 
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
                                        { inclusiveNone(message)? <h3>X</h3> : <h3 className="font-mono font-semibold">O</h3> }
                                        <h1 className="max-w-sm overflow-auto">{ inclusiveNone(message)? message.replace('.none', '') : message }</h1>
                                    </MotionDisplayWrapper>
                                    {
                                        isError && <MotionDisplayWrapper className={`w-full flex justify-start items-center gap-2 text-red-500`}>
                                            <Error />
                                            <h1 className="max-w-sm overflow-auto">{ error.length > 50? 'Trasaction Failed' : error }</h1>
                                        </MotionDisplayWrapper>
                                    }
                                </div>
                        }
                    </MotionDisplayWrapper>
            }

        </React.Fragment>
    )
}