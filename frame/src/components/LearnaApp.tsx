import React from 'react';
import { Path, quizData, QuizDatum } from '~/dummyData';
import { MotionDisplayWrapper } from './peripherals/MotionDisplayWrapper';
import Review from './peripherals/Review';
import Scores from './peripherals/Scores';
import DisplayCategories from './peripherals/DisplayCategory';
import DisplayQuiz from './peripherals/DisplayQuiz';
import GenerateUserKey from './peripherals/GenerateUserKey';
import { useFrame } from './providers/FrameProvider';
import { StorageContextProvider } from './StorageContextProvider';
import Home from './peripherals/Home';
import { 
    type Address, 
    filterTransactionData, 
    mockReadData, 
    type ReadData, 
    type TransactionCallback, 
    emptyQuizData, 
    ScoresReturn,
    ScoresParam,
    mockScoresParam
} from './utilities';
import { useAccount, useChainId, useConfig, useReadContracts } from 'wagmi';
import Profile from './peripherals/Profile';
import Stats from './peripherals/Stats';
import { zeroAddress } from 'viem';
import SendTip from './peripherals/SendTip';

const TOTAL_WEIGHT = 100;

export default function LearnaApp() {
    const [currentPath, setPath] = React.useState<Path>('home');
    const [currentUser, setUser] = React.useState<Address>(zeroAddress);
    const [showFinishButton, setShowFinishButton] = React.useState<boolean>(false);
    const [firstTransactionDone, setFirstTransactionDone] = React.useState<boolean>(false);
    const [indexedAnswer, setIndex] = React.useState<number>(0);
    const [messages, setMessage] = React.useState<string>('');
    const [scoresParam, setScoresParam] = React.useState<ScoresParam>(mockScoresParam);
    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const [selectedQuizData, setQuizData] = React.useState<{category: string, data: QuizDatum}>(emptyQuizData);
    
    const { context } = useFrame();
    const chainId = useChainId();
    const config = useConfig();
    const { isConnected, address } = useAccount();
    const setmessage = (arg: string) => setMessage(arg);
    const setError = (arg:string) => setErrorMessage(arg);
    const goToProfile = () => setPath('profile');
    const goToStats = () => setPath('stats');
    const goToTip = () => setPath('sendtip');

    const callback : TransactionCallback = (arg) => {
        if(arg.message) setMessage(arg.message);
        if(arg.errorMessage) setError(arg.errorMessage);
    }

    // Build the transactions to run
    const { readTxObject } = React.useMemo(() => {
        const { contractAddresses: ca, transactionData: td } = filterTransactionData({
            chainId,
            filter: true,
            functionNames: ['getData', 'owner'],
            callback
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
    }, [chainId, callback]);

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

    // Memoize the fetched data to avoid unneccessary re-rendering
    const { weekId, state, weekData, owner } = React.useMemo(() => {
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

    // Clear selected quiz data
    const clearData = React.useCallback(() => {
        setQuizData(emptyQuizData);
    }, [setQuizData, emptyQuizData]);

    // Update quiz data whenever an update to category is received
    const setSelectedQuizData = React.useCallback(
        (selected: string, level: string) => {
            const filtered = quizData.filter(({category, difficultyLevel}) => category === selected && level === difficultyLevel);
            console.log("selectedQuizData", filtered)
            if(filtered.length > 0) {
                setQuizData({category: selected, data: filtered[0]});
            }
    }, [quizData, setQuizData]);
    
    // Transaction done is updated when the confirmation component is done with the first set of transaction
    const setTransactionDone = React.useCallback((arg: boolean) => {
        setFirstTransactionDone(arg);
    }, [setFirstTransactionDone]);

    const calculateAndSaveScores = () => {
        const { category, difficultyLevel, questions } = selectedQuizData.data;
        const questionSize = questions.length;
        const weightPerQuestion = Math.floor(TOTAL_WEIGHT / questionSize);
        const totalAnsweredCorrectly = questions.filter(({userAnswer, correctAnswer}) => userAnswer?.label === correctAnswer.label);
        const totalAnsweredIncorrectly = questionSize - totalAnsweredCorrectly.length;
        const totalScores = weightPerQuestion * totalAnsweredCorrectly.length;
        const param = {
            category,
            difficultyLevel,
            totalScores,
            questionSize,
            weightPerQuestion,
            totalAnsweredCorrectly,
            totalAnsweredIncorrectly,
        }
        setScoresParam(param);

    };
    
    // Update the quiz data each time an user selects an answer
    const handleSelectAnswer = React.useCallback(({label, value} : {label: string, value: string}) => {
        const questionSize = selectedQuizData.data.questions.length;
        setQuizData(({data, category}) => {
            data.questions[indexedAnswer].userAnswer = {label, value};
            return {
                category,
                data
            }
        });
        setIndex((prev) => {
            let newIndex = prev + 1;
            if(newIndex === questionSize) {
                newIndex = prev;
                calculateAndSaveScores();
                setShowFinishButton(true);
            }
            return newIndex;
        });
    }, [setQuizData, setIndex, setShowFinishButton, selectedQuizData]);

    // set the node to display
    const {setpath, renderChildren} = React.useMemo(() => {
        const setpath = (arg: Path) => setPath(arg);
        const renderChildren = () => {
            let result = <></>
            switch (currentPath) {
                case 'selectcategory':
                    result = <DisplayCategories />;
                    break;
                case 'review':
                    result = <Review />;
                    break;
                case 'scores':
                    result = <Scores />;
                    break;
                case 'quiz':
                    result = <DisplayQuiz />;
                    break;
                case 'home':
                    result = <Home />;
                    break;
                case 'generateuserkey':
                    result = <GenerateUserKey />;
                    break;
                case 'profile':
                    result = <Profile />;
                    break;
                case 'stats':
                    result = <Stats />;
                    break;
                case 'sendtip':
                    result = <SendTip />;
                    break;
                default:
                    break;
            }
            return result;
        }

        return {
            setpath,
            renderChildren
        }
    }, [setPath, currentPath]);

    React.useEffect(() => {
        if(address && address !== zeroAddress && address !== currentUser) {
            console.log("Ueer address changed to: ", address, 'from', currentUser);
            setUser(address); 
        }
        if(currentPath === 'scores' || currentPath === 'selectcategory') setQuizData(emptyQuizData);
    }, [address, currentPath, currentUser, setUser, setQuizData]);

    return(
        <StorageContextProvider
            value={{
                handleStart: () => setpath('quiz'),
                setSelectedQuizData,
                data: selectedQuizData.data,
                handleSelectAnswer,
                setTransactionDone,
                indexedAnswer,
                selectedQuizData,
                setpath,
                clearData,
                currentPath,
                messages,
                state,
                // totalScore,
                weekData,
                weekId,
                owner,
                refetch,
                setError,
                callback,
                // setscores,
                setmessage,
                errorMessage,
                scoresParam,
                // calculateScores,
                firstTransactionDone,
                showFinishButton
            }}
        >
            <div 
                style={{
                    paddingTop: context?.client.safeAreaInsets?.top ?? 10,
                    paddingBottom: context?.client.safeAreaInsets?.bottom ?? 10,
                    paddingLeft: context?.client.safeAreaInsets?.left ?? 10,
                    paddingRight: context?.client.safeAreaInsets?.right ?? 10,
                }}
                className="relative w-[300px] mx-auto"
            >
                <MotionDisplayWrapper className='w-full flex justify-between items-baseline uppercase text-sm text-center space-y-4 border bg-cyan-400/10 p-2 mb-2 rounded-xl '>
                    <h1 className='h-[60px] w-[60px] flex justify-center items-center bg-cyan-500/30 rounded-full font-mono'><span className='italic text-2xl font-black text-cyan-800'>L</span><span className='font-mono text-xs'>earna</span></h1>
                    <div className='flex justify-between items-center gap-1'>
                        <button onClick={goToTip} className='h-[40px] w-[40px] flex justify-center items-center bg-cyan-500/30 rounded-full font-mono'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
                        </button>
                        <button onClick={goToStats} className='h-[40px] w-[40px] flex justify-center items-center bg-cyan-500/30 rounded-full font-mono'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                            </svg>
                        </button>
                        <button onClick={goToProfile} className='h-[40px] w-[40px] flex justify-center items-center bg-cyan-500/30 rounded-full font-mono'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </button>
                    </div>
                </MotionDisplayWrapper>
                <MotionDisplayWrapper className='space-y-4 font-mono'>
                    { renderChildren() }
                </MotionDisplayWrapper>
            </div>
        </StorageContextProvider>
    );
}
