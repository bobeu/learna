import React from 'react';
import { Path, quizData, QuizDatum } from '~/dummyData';
import { MotionDisplayWrapper } from './peripherals/MotionDisplayWrapper';
import Review from './peripherals/Review';
import Scores from './peripherals/Scores';
import DisplayCategories from './peripherals/DisplayCategory';
import DisplayQuiz from './peripherals/DisplayQuiz';
// import { useFrame } from './providers/FrameProvider';
import { StorageContextProvider } from './StorageContextProvider';
// import { sdk } from '@farcaster/frame-sdk';
import Home from './peripherals/Home';
import { 
    type Address, 
    filterTransactionData, 
    mockReadData, 
    type ReadData, 
    type TransactionCallback, 
    emptyQuizData, 
    TrxState
} from './utilities';
import { useAccount, useChainId, useConfig, useReadContracts } from 'wagmi';
import Profile from './peripherals/Profile';
import Stats from './peripherals/Stats';
import { zeroAddress } from 'viem';
import SendTip from './peripherals/SendTip';
// import { Spinner } from './peripherals/Spinner';
// import { ContextWrapper } from './LayoutContext';
// import { NeynarContextProvider, Theme } from '@neynar/react';
// import AppContext from './StorageContextProvider/AppContext';
import { useNeynarContext } from '@neynar/react';
import Image from 'next/image';
import { LayoutContext } from './LayoutContext';
// import NeynaAppContext from './StorageContextProvider/AppContext';

export default function Educaster() {
    // const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [currentPath, setPath] = React.useState<Path>('home');
    const [currentUser, setUser] = React.useState<Address>(zeroAddress);
    const [showFinishButton, setShowFinishButton] = React.useState<boolean>(false);
    const [questionIndex, setIndex] = React.useState<number>(0);
    const [messages, setMessage] = React.useState<string>('');
    const [quizCompleted, setQuizCompletion] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const [selectedQuizData, setQuizData] = React.useState<{category: string, data: QuizDatum}>(emptyQuizData);
    // const [sendNotificationResult, setSendNotificationResult] = React.useState<string>("");
    
    // const { isSDKLoaded, context, added, notificationDetails, lastEvent, addFrame, addFrameResult, openUrl, close } = useFrame();
    const chainId = useChainId();
    const config = useConfig();
    const { isConnected, address } = useAccount();
    const { user } = useNeynarContext();
    const setpath = (arg: Path) => setPath(arg);


    // Update quiz data whenever an update to category is received
    const setSelectedQuizData = (selected: string, level: string) => {
        const filtered = quizData.filter(({category, difficultyLevel}) => category === selected && level === difficultyLevel);
        if(filtered.length > 0) {
            if(selected !== selectedQuizData.category && level !== selectedQuizData.data.difficultyLevel) {
                setQuizData({category: selected, data: filtered[0]});
                setpath('quiz');
            } else {
                // setPath('selectcategory');
                alert(`You have completed ${selected} category with ${level} level. Please choose different parameters`);
            }
            
        }
    };

    // Update the quiz data each time an user selects an answer
    const handleSelectAnswer = ({label, value, userSelect} : {label?: string, value?: string, userSelect: boolean}) => {
        const data = selectedQuizData;
        const questionSize = data.data.questions.length;
        if(userSelect) {
            setQuizData(({data, category}) => {
                data.questions[questionIndex].userAnswer = {label: label!, value: value!};
                if(!data.taken) data.taken = true;
                return {
                    category,
                    data
                }
            });
        }
        setIndex((prev) => {
            let newIndex = prev + 1;
            if(newIndex === questionSize) {
                // newIndex = prev;
                newIndex = 0;
                setQuizCompletion(true);
                setShowFinishButton(true);
            }
            return newIndex;
        });
        
    };

    //Prepare utility functions to be used across child components
    const getFunctions = React.useCallback(() => {
        const setmessage = (arg: string) => setMessage(arg);
        const setError = (arg:string) => setErrorMessage(arg);
        const clearData = () => {
            setQuizData(emptyQuizData);
            setIndex(0);
        }
        const closeQuizComplettion = () => setQuizCompletion(false);
        // const setTransactionDone = (arg: boolean) => setFirstTransactionDone(arg);
        const callback : TransactionCallback = (arg) => {
            if(arg.message) setMessage(arg.message);
            if(arg.errorMessage) setErrorMessage(arg.errorMessage);
        };

        return {
            // setTransactionDone,
            closeQuizComplettion,
            setmessage,
            clearData,
            callback,
            setError,
        }
    }, [setQuizData, setQuizCompletion, setIndex, setErrorMessage, setMessage]);

    // Build read transactions data
    const { readTxObject } = React.useMemo(() => {
        const { contractAddresses: ca, transactionData: td } = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['getData', 'owner'],
            callback: (arg: TrxState) => {
                if(arg.message) setMessage(arg.message);
                if(arg.errorMessage) setErrorMessage(arg.errorMessage);
            }
        });

        const learna = ca.Learna as Address;
        const readArgs = [[], []];
        const addresses = [learna, learna];

        // console.log("Abi", td);
        const readTxObject = td.map((item, i) => {
            return{
                abi: item.abi,
                functionName: item.functionName,
                address: addresses[i],
                args: readArgs[i]
            }
        });

        return { readTxObject };
    }, [chainId, setMessage,setErrorMessage]);

    // Read smart contract state 
    const { data: result, refetch } = useReadContracts({
        config,
        contracts: readTxObject,
        allowFailure: true,
        query: {
            enabled: !!isConnected,
            refetchOnReconnect: 'always', 
            refetchInterval: 5000,
        }
    });

    const { weekId, state, owner, weekData } = React.useMemo(() => {
        const data = result?.[0]?.result as ReadData || mockReadData;
        const weekId = data.state.weekCounter; // Current week Id
        const state = data.state;
        const owner = result?.[1]?.result as Address || zeroAddress;
        const weekData = [...data.wd];

        return {
            weekId,
            state,
            owner,
            weekData
        }
    }, [result]);

    const node = React.useMemo(() => {
        let node = <></>
        switch (currentPath) {
            case 'selectcategory':
                node = <DisplayCategories />;
                break;
            case 'review':
                node = <Review />;
                break;
            case 'scores':
                node = <Scores />;
                break;
            case 'quiz':
                node = <DisplayQuiz />;
                break;
            case 'home':
                node = <Home />;
                break;
            case 'profile':
                node = <Profile />;
                break;
            case 'stats':
                node = <Stats />;
                break;
            case 'sendtip':
                node = <SendTip />;
                break;
            default:
                break;
        }
        return node;
    }, [currentPath]);

    // Update the state whenever user's connected address changes
    React.useEffect(() => {
        if(address && address !== zeroAddress && address !== currentUser) {
            console.log("Ueer address changed to: ", address, 'from', currentUser);
            setUser(address); 
        }
        if(currentPath === 'selectcategory') setQuizData(emptyQuizData);
    }, [address, currentPath, currentUser, setUser, setQuizData]);

    // // Add Educaster to miniApp when the app is mounted
    // React.useEffect(() => {
    //     const add = async () => {
    //       try {
    //         await sdk.actions.addMiniApp();
    //       } catch (err) {
    //         console.error("Failed to add mini app:", err);
    //       }
    //     };
    //     add();
    //   }, []);
    
    return(
        <StorageContextProvider
            value={{
                handleStart: () => setpath('quiz'),
                data: selectedQuizData.data,
                questionIndex,
                selectedQuizData,
                setpath,
                quizCompleted,
                currentPath,
                messages,
                state,
                weekData,
                weekId,
                owner,
                refetch,
                getFunctions,
                setSelectedQuizData, 
                handleSelectAnswer,
                // sendNotification,
                errorMessage,
                showFinishButton
            }}
        >
            <LayoutContext>
                <main>
                    <MotionDisplayWrapper className='w-full flex justify-between items-baseline uppercase text-sm text-center space-y-4 border bg-cyan-500 p-2 mb-2 rounded-xl '>
                        <h1 className='relative h-[60px] w-[60px] flex justify-center items-center bg-white rounded-full font-mono italic text-2xl'><span className='absolute left-[19px] font-black text-purple-700 rotate-180'>E</span><span className='font-mono absolute right-[21px] bottom-4'>C</span></h1>
                        <div className=''>
                            <button onClick={() => setPath('sendtip')} className={`absolute top-8 right-[110px] h-[40px] w-[40px] flex justify-center items-center ${currentPath === 'sendtip'? 'bg-white/70 text-purple-700' : 'bg-white '} rounded-full font-mono`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                            </button>
                            <button onClick={() => setPath('stats')} className={` absolute top-8 right-[65px] h-[40px] w-[40px] flex justify-center items-center ${currentPath === 'stats'? 'bg-white/70 text-purple-700' : 'bg-white '} rounded-full font-mono`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                                </svg>
                            </button>
                            <button onClick={() => setPath('profile')} className={`absolute top-8 right-[20px] h-[40px] w-[40px] flex justify-center items-center ${currentPath === 'profile'? 'bg-white/70 text-purple-700' : 'bg-white '} rounded-full font-mono`}>
                                {
                                    user? 
                                        <Image 
                                            src={`${user.pfp_url!}`}
                                            alt={`${user.display_name}`}
                                            width={40}
                                            height={40}
                                            className='rounded-full'
                                        /> : 
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                }
                            </button>
                        </div>
                    </MotionDisplayWrapper>
                    <MotionDisplayWrapper>{ node }</MotionDisplayWrapper>
                </main>
            </LayoutContext>
        </StorageContextProvider>
    );
}
