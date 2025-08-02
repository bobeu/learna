/* eslint-disable */
import React, { useState, useEffect } from 'react';
import type { 
    Address, 
    Admin, 
    Campaign, 
    CampaignDatum, 
    CategoryType, 
    Path, 
    Quiz, 
    QuizResultInput, 
    QuizResultOtherInput, 
    ReadData, 
    TransactionCallback, 
    TrxState 
} from '../../types/quiz';

import Dashboard from '~/components/quizComponents/Dashboard';
import { QuizInterface } from '~/components/quizComponents/QuizInterface';
import { QuizResults } from '~/components/quizComponents/QuizResults';
import { useAccount, useChainId, useConfig, useConnect, useReadContracts } from 'wagmi';
import { hexToString, zeroAddress } from 'viem';
import { LayoutContext } from './LayoutContext';
import { StorageContextProvider } from './StorageContextProvider';

import { 
    filterTransactionData, 
    mockQuiz, 
    mockQuizResult, 
    mockReadData, 
    load_d_, 
    formatAddr, 
    mockCampaign, 
    toBN,
    mockAdmins
} from './utilities';

import LandingPage from './landingPage';
import Profile from './peripherals/Profile';
import Stats from './peripherals/Stats';
import SetupCampaign from './peripherals/SetupCampaign';

const TOTAL_POINTS = 100;
const TIME_PER_QUESTION = 0.4;

export default function Educaster() {
    const [appData, setAppData] = React.useState<{categories: CategoryType[], quizData: Quiz[] | null}>({categories: [], quizData: null});
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [quizResult, setQuizResult] = useState<QuizResultInput | null>(null);
    const [userResults, setUserResults] = useState<QuizResultInput[]>([]);
    const [messages, setMessage] = React.useState<string>('');
    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const [currentPath, setPath] = React.useState<Path>('home');
    const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign>(mockCampaign);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [isMenuOpen, setMenu] = React.useState<boolean>(false);
    const [recordPoints, setRecordPoints] = React.useState<boolean>(false);
    const [stateData, setStateData] = React.useState<ReadData>(mockReadData);
    const [owner, setOwner] = React.useState<Address>(zeroAddress);
    const [admins, setAdmins] = React.useState<Admin[]>([mockAdmins]);

    const chainId = useChainId();
    const config = useConfig();
    const { isConnected, address, connector } = useAccount();
    const { connect } = useConnect();
    const account = formatAddr(address);

    // Update quiz data
    React.useEffect(() => {
        if(!appData.quizData) {
            const appData_ = load_d_({timePerQuestion: TIME_PER_QUESTION, totalPoints: TOTAL_POINTS});
            setAppData(appData_);
        }
    }, [appData.quizData]);

    // Update current page based on connection state
    React.useEffect(() => {
        if(!isConnected && connector) connect({connector, chainId});
        if(isConnected && currentPath === 'home') setpath('dashboard');
        if(!isConnected && currentPath !== 'home') setpath('home');
    }, [isConnected, connector, chainId, currentPath]);

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

    const handleQuizSelect = (quiz: Quiz) => {
        const admin = formatAddr(process.env.NEXT_PUBLIC_DIVVI_IDENTIFIER).toLowerCase();
        const divviAdmin = formatAddr(process.env.NEXT_PUBLIC_DIVVI_ADMIN).toLowerCase();
        if(quiz.title === 'divvi'){
            if(account.toLowerCase() === divviAdmin || account.toLowerCase() === admin){
                setSelectedQuiz(quiz);
            }
        } else {
            setSelectedQuiz(quiz);
        }
        setPath('quiz');
    };

    const toggleOpen = (arg: boolean) => {
        setMenu(arg);
    }

    const handleQuizComplete = (result: QuizResultInput) => {
        const resultOtherInput : QuizResultOtherInput = {
            ...result.other,
            id: Date.now().toString()
        }
        
        const newResult: QuizResultInput= {
            answers: result.answers,
            other: resultOtherInput
        };
        
        setQuizResult(newResult);
        setUserResults(prev => [newResult, ...prev]);
        setPath('results');
        setTimeout(() => setRecordPoints(true), 3000);
        clearTimeout(3000);
        
    };

    const setpath = (arg: Path) => {
        setPath(arg);
    }

    const toggleRecordPoints = (arg: boolean) => {
        setRecordPoints(arg);
    }

    const handlePlayAgain = () => {
        setPath('quiz');
    };

    const handleBackToHome = (path: Path) => {
        setSelectedQuiz(null);
        setQuizResult(null);
        setPath(path);
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

    const setselectedCampaign = (arg: Campaign) => {
        setSelectedCampaign(arg);
        if(currentPath !== 'profile') setPath('profile');
    };

    const callback : TransactionCallback = (arg) => {
        if(arg.message) setMessage(arg.message);
        if(arg.errorMessage) setErrorMessage(arg.errorMessage);
    };
    
    // Build read transactions data
    const { transactionData: td } = filterTransactionData({
        chainId,
        filter: true,
        functionNames: ['owner', 'getData', 'getAdmins'],
        callback: (arg: TrxState) => {
            if(arg.message) setMessage(arg.message);
            if(arg.errorMessage) setErrorMessage(arg.errorMessage);
        }
    });
    const readArgs = [[], [], []];
    const readTxObject = td.map((item, i) => {
        return{
            abi: item.abi,
            functionName: item.functionName,
            address: item.contractAddress as Address,
            args: readArgs[i]
        }
    });

    // Read smart contract state 
    const { data: result, refetch } = useReadContracts({
        config,
        account,
        contracts: readTxObject,
        allowFailure: true,
        query: {
            enabled: !!isConnected,
            refetchOnReconnect: 'always', 
            refetchInterval: 5000,
        }
    });

         // Update quiz data
    React.useEffect(() => {
        let stateData_ : ReadData = mockReadData;
        let owner_ : Address = zeroAddress;
        let admins_ : Admin[] = [mockAdmins];
        if(result && result.length > 0) {
            stateData_ = result[1].result as ReadData;
            admins_ = result[2].result as Admin[];
            owner_ = result[0].result as Address;
        }
        setStateData(stateData_);
        setAdmins(admins_);
        setOwner(owner_);
    }, [result]);

    const { weekId, state, wkId, weekData, app, userAdminStatus, campaignData, campaignHashes, campaignStrings } = React.useMemo(() => {
        const data = stateData?? mockReadData;
        const weekId = data.state.weekId; // Current week Id
        const state = data.state;
        const wkId = toBN(weekId.toString()).toNumber();
        const campaignData : CampaignDatum[] = data.wd[wkId].campaigns.map(({data: { campaignHash, encoded }}) => {
            const campaign = hexToString(encoded);
            return {campaignHash, campaign}
        });
        
        const campaignHashes = campaignData.map(({campaignHash}) => campaignHash);
        const campaignStrings = campaignData.map(({campaign}) => {
            return campaign;
        });
        // const owner = result?.[0]?.result as Address || zeroAddress;
        const weekData = [...data.wd];
        const admins = result?.[2]?.result as Admin[] || [mockAdmins];
        // console.log("Admins: ", admins);
        let userAdminStatus = false;
        const found = admins.filter(({id}) => id.toLowerCase() === account.toLowerCase());
        if(found && found.length > 0) userAdminStatus = found[0].active;

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

            case 'setupcampaign':
                app = <SetupCampaign />;
                break;
        
            default:
                app = <Dashboard />;
                break;
        }

        return {
            app,
            wkId,
            weekId,
            state,
            weekData,
            campaignData,
            campaignStrings,
            campaignHashes,
            userAdminStatus
        }
    }, [currentPath, stateData]);

    return (  
        <StorageContextProvider
            value={{
                handleStart: () => setPath('quiz'),
                loading,
                setpath,
                currentPath,
                messages,
                state,
                weekData,
                weekId,
                owner,
                admins,
                wkId,
                refetch,
                campaignHashes,
                campaignStrings,
                recordPoints,
                isMenuOpen,
                toggleRecordPoints,
                appData,
                setmessage,
                setselectedCampaign,
                setError,
                toggleOpen,
                result: quizResult? quizResult : mockQuizResult,
                quiz: selectedQuiz? selectedQuiz : mockQuiz,
                onPlayAgain: handlePlayAgain,
                onBackToHome: handleBackToHome,
                onQuizSelect: handleQuizSelect,
                onComplete: handleQuizComplete,
                onBack: handleBackToDashboard,
                userResults,
                campaignData,
                userAdminStatus,
                toggleLoading,
                callback,
                errorMessage,
                selectedCampaign
            }}
        >
            <LayoutContext> { app }</LayoutContext>
        </StorageContextProvider>
    )
}