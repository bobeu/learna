import React, { useState, useEffect } from 'react';
import { Address, Category, Path, Quiz, QuizResult, ReadData, SelectedData, TransactionCallback, TrxState } from '../../types/quiz';
import { Dashboard } from '~/components/quizComponents/Dashboard';
import { QuizInterface } from '~/components/quizComponents/QuizInterface';
import { QuizResults } from '~/components/quizComponents/QuizResults';
import { useAccount, useChainId, useConfig, useReadContracts } from 'wagmi';
import { zeroAddress } from 'viem';
import { LayoutContext } from './LayoutContext';
import { StorageContextProvider } from './StorageContextProvider';
import { filterTransactionData, mockQuiz, mockQuizResult, mockReadData, mockSelectedData, loadQuizData } from './utilities';
import LandingPage from './landingPage';
import Profile from './peripherals/Profile';
import Stats from './peripherals/Stats';
import SendTip from './peripherals/SendTip';


const TOTAL_POINTS = 100;
const TIME_PER_QUESTION = 0.4;

export default function Home() {
    // const [appState, setAppState] = useState<AppState>('');
    const [appData, setAppData] = React.useState<{categories: Category[], quizData: Quiz[] | null}>({categories: [], quizData: null});
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(mockQuiz);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(mockQuizResult);
    const [userResults, setUserResults] = useState<QuizResult[]>([]);
    const [messages, setMessage] = React.useState<string>('');
    const [errorMessage, setErrorMessage] = React.useState<string>('');

    const dataRef = React.useRef<SelectedData>(mockSelectedData);
    const [currentPath, setPath] = React.useState<Path>('home');
    const [showFinishButton, setShowFinishButton] = React.useState<boolean>(false);
    const [questionIndex, setIndex] = React.useState<number>(0);
    const [questionsId, setQuestionId] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    
    const chainId = useChainId();
    const config = useConfig();
    const { isConnected, } = useAccount();
    // const { user } = useNeynarContext();

    React.useEffect(() => {
        if(!appData.quizData) {
            const appData_ = loadQuizData({timePerQuestion: TIME_PER_QUESTION, totalPoints: TOTAL_POINTS});
            setAppData(appData_);
        }
    }, []);

    React.useEffect(() => {
        if(isConnected && currentPath === 'home') setpath('dashboard');
        if(!isConnected && currentPath !== 'home') setpath('home');
    }, [isConnected]);

    // Load user results from localStorage on component mount
    useEffect(() => {
        const savedResults = localStorage.getItem('quizResults');
        if (savedResults) {
        try {
            const parsedResults = JSON.parse(savedResults).map((result: any) => ({
            ...result,
            completedAt: new Date(result.completedAt)
            }));
            setUserResults(parsedResults);
        } catch (error) {
            console.error('Error loading saved results:', error);
        }
        }
    }, []);

    // Save user results to localStorage whenever userResults changes
    useEffect(() => {
        if (userResults.length > 0) {
        localStorage.setItem('quizResults', JSON.stringify(userResults));
        }
    }, [userResults]);

    const handleQuizSelect = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setPath('quiz');
    };

    const handleQuizComplete = (result: Omit<QuizResult, 'id'>) => {
        const newResult: QuizResult = {
        ...result,
        id: Date.now().toString() // Simple ID generation
        };
        
        setQuizResult(newResult);
        setUserResults(prev => [newResult, ...prev]);
        setPath('results');
    };

    const setpath = (arg: Path) => {
        setPath(arg);
    }

    const handlePlayAgain = () => {
        setPath('quiz');
    };

    const handleBackToHome = () => {
        setSelectedQuiz(null);
        setQuizResult(null);
        setPath('dashboard');
    };

    const handleBackToDashboard = () => {
        setSelectedQuiz(null);
        setPath('dashboard');
    };

    const setmessage = (arg: string) => {
        setMessage(arg);
    }
    const setError = (arg:string) => {
        setErrorMessage(arg);
    }
    const toggleLoading = (arg: boolean) => {
        setLoading(arg);
    }

    const callback : TransactionCallback = (arg) => {
        if(arg.message) setMessage(arg.message);
        if(arg.errorMessage) setErrorMessage(arg.errorMessage);
    };

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
            weekData,
        }
    }, [result]);

    const renderedApp = React.useMemo(() => {
        let app = <></>;
        switch (currentPath) {
            case 'dashboard':
                app = <Dashboard />;
                break;

            case 'quiz':
                app = <QuizInterface />;
                break;

            case 'results':
                app = <QuizResults />;
                break;

            case 'home':
                app = <LandingPage />;
                break;

            case 'profile':
                app = <Profile />;
                break;

            case 'stats':
                app = <Stats />;
                break;

            case 'sendtip':
                app = <SendTip />;
                break;
        
            default:
                app = <Dashboard />;
                break;
        }

        return app;
    }, [currentPath]);

    return (  
        <StorageContextProvider
            value={{
                handleStart: () => setPath('quiz'),
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
                appData,
                setmessage,
                setError,
                result: quizResult? quizResult : mockQuizResult,
                quiz: selectedQuiz? selectedQuiz : mockQuiz,
                onPlayAgain: handlePlayAgain,
                onBackToHome: handleBackToHome,
                onQuizSelect: handleQuizSelect,
                onComplete: handleQuizComplete,
                onBack: handleBackToDashboard,
                userResults,
                // clearData,
                toggleLoading,
                callback,
                // handleSelectAnswer,
                errorMessage,
                // toggleShowFinishButton,
                // clearSelectedData,
                // resetQuestionIndex,
                showFinishButton
            }}
        >
            <LayoutContext> { renderedApp }</LayoutContext>
        </StorageContextProvider>
    )
}