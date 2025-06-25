import React from 'react';
// import { quizData } from '~/dummyData';
import { MotionDisplayWrapper } from './peripherals/MotionDisplayWrapper';
import Review from './peripherals/Review';
import Scores from './peripherals/Scores';
import DisplayCategories from './peripherals/DisplayCategory';
import DisplayQuiz from './peripherals/DisplayQuiz';
import { StorageContextProvider } from './StorageContextProvider';
import Home from './peripherals/Home';
import { loadQuizData, mockScoresParam } from './utilities';
import { 
    type Address, 
    filterTransactionData, 
    mockReadData, 
    type ReadData, 
    type TransactionCallback, 
    type TrxState,
    mockSelectedData,
    TOTAL_WEIGHT,
    type Path, 
    type SelectedData,
    Category,
    DifficultyLevel
} from './utilities';
import { useAccount, useChainId, useConfig, useReadContracts } from 'wagmi';
import Profile from './peripherals/Profile';
import Stats from './peripherals/Stats';
import { zeroAddress } from 'viem';
import SendTip from './peripherals/SendTip';
import { useNeynarContext } from '@neynar/react';
import Image from 'next/image';
import { LayoutContext } from './LayoutContext';

export default function Educaster() {
    const dataRef = React.useRef<SelectedData>(mockSelectedData);
    const [currentPath, setPath] = React.useState<Path>('home');
    const [showFinishButton, setShowFinishButton] = React.useState<boolean>(false);
    const [questionIndex, setIndex] = React.useState<number>(0);
    const [messages, setMessage] = React.useState<string>('');
    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const [questionsId, setQuestionId] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    const chainId = useChainId();
    const config = useConfig();
    const { quizData } = loadQuizData();
    const { isConnected } = useAccount();
    const { user } = useNeynarContext();
    const setpath = (arg: Path) => {
        setPath(arg);
    }
    const setmessage = (arg: string) => {
        setMessage(arg);
    }
    const setError = (arg:string) => {
        setErrorMessage(arg);
    }
    const toggleLoading = (arg: boolean) => {
        setLoading(arg);
    }
    const resetQuestionIndex = () => {
        setIndex(0);
    }
    const clearSelectedData = () => {
        dataRef.current = mockSelectedData;
    };
    const finalizeQuiz = () => { 
        setShowFinishButton(true);
    }
    const clearData = () => {
        setIndex(0);
        setMessage('');
        setErrorMessage('');
    }
    const callback : TransactionCallback = (arg) => {
        if(arg.message) setMessage(arg.message);
        if(arg.errorMessage) setErrorMessage(arg.errorMessage);
    };
    const handleSelectAnswer = ({label} : {label: string}) => {
        dataRef.current.data[questionIndex].userAnswer = label;
        const questionSize = dataRef.current.data.length;
        setQuestionId((prev) => [...prev, dataRef.current.data[questionIndex].hash]);
        setIndex((prev) => {
            const next = prev + 1;
            if(next === questionSize) setShowFinishButton(true);
            return next;
        });
    };

    //Prepare utility functions to be used across child components
    const setSelectedQuizData = React.useCallback((selectedCategory: Category, level: DifficultyLevel) => {
        const filteredCategory = quizData.filter(({category}) => category === selectedCategory);
        const found = filteredCategory.map(({id, category, data}) => {
            let k: SelectedData = {id: 0,category: '',selectedLevel: '', data: [], scoreParam: mockScoresParam};
    
            switch (level) {
                case 'beginner':
                    k = {id, category, selectedLevel:level, data: data.beginner.questions, scoreParam: mockScoresParam};
                    break;
                case 'intermediate':
                    k = {id, category, selectedLevel:level, data: data.intermediate.questions, scoreParam: mockScoresParam};
                    break;
                case 'advanced':
                    k = {id, category, selectedLevel:level, data: data.advanced.questions, scoreParam: mockScoresParam};
                    break;
                default:
                    break;
            }
            return k;
        });
        if(found && found.length > 0){
            dataRef.current = found[0];
            setpath('quiz');
        } else {
            return alert(`No quiz found for ${selectedCategory} with ${level} level`);
        }
    }, [dataRef, quizData, setpath]);

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

    // Update the sccores everytime a question is selected
    React.useEffect(() => {
        const { category, selectedLevel, data: questionsAtempted, } = dataRef.current;
        const totalQuestions = questionsAtempted.length;
        const weightPerQuestion = Math.floor(TOTAL_WEIGHT / totalQuestions);
        const totalAnsweredCorrectly = questionsAtempted.filter(({userAnswer, answer}) => userAnswer === answer);
        const totalAnsweredIncorrectly = totalQuestions - totalAnsweredCorrectly.length;
        const totalScores = weightPerQuestion * totalAnsweredCorrectly.length;
        const noAnswer = questionsAtempted.filter(({userAnswer,}) => (!userAnswer || userAnswer === ''));
        dataRef.current.scoreParam = {
            category,
            noAnswer: noAnswer.length,
            difficultyLevel: selectedLevel,
            totalScores,
            questionSize: totalQuestions,
            weightPerQuestion,
            totalAnsweredCorrectly,
            totalAnsweredIncorrectly,
        };

    }, [questionIndex, dataRef]);
    
    return(
        <StorageContextProvider
            value={{
                handleStart: () => setpath('quiz'),
                dataRef,
                questionIndex,
                loading,
                setpath,
                currentPath,
                messages,
                state,
                weekData,
                weekId,
                owner,
                refetch,
                questionsId,
                setSelectedQuizData,
                setmessage,
                setError,
                clearData,
                toggleLoading,
                callback,
                handleSelectAnswer,
                errorMessage,
                finalizeQuiz,
                clearSelectedData,
                resetQuestionIndex,
                showFinishButton
            }}
        >
            <LayoutContext>
                <main>
                    <MotionDisplayWrapper className='w-full flex justify-between items-baseline uppercase text-sm text-center space-y-4 border bg-cyan-500 p-2 mb-2 rounded-xl '>
                        <Image 
                            src={'/icon4.png'}
                            alt={'Educaster logo'}
                            width={70}
                            height={70}
                            className="rounded-xl"
                        />
                        {/* <h1 className='relative h-[60px] w-[60px] flex justify-center items-center bg-white rounded-full font-mono italic text-2xl'><span className='absolute left-[19px] font-black text-purple-700 rotate-180'>E</span><span className='font-mono absolute right-[21px] bottom-4'>C</span></h1> */}
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
