/* eslint-disable */
import React, { useState, useEffect } from 'react';
import type { 
    Address, 
    Admin, 
    Campaign, 
    CampaignHashFormatted, 
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
import { Hex, hexToString, zeroAddress } from 'viem';
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
    mockAdmins,
    mockHash,
    formatData
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
    const [statUser, setStatUser] = React.useState<Address>(zeroAddress);
    const [requestedWkId, setWeekId] = React.useState<number>(0);
    const [requestedHash, setHash] = React.useState<Hex>(mockHash);
    const [storage, setStorage] = React.useState<ReadData>(mockReadData);
    const [admins, setAdmins] = React.useState<Admin[]>([mockAdmins]);
    const [owner, setOwner] = React.useState<Address>(zeroAddress);
    const [verificationStatus, setVerificationStatus] = React.useState<[boolean, boolean]>([false, false]);

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
    }, [isConnected, connector, chainId, currentPath, connect]);

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
        // setTimeout(() => setRecordPoints(true), 3000);
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
        functionNames: ['owner', 'getData', 'getAdmins', 'getVerificationStatus'],
        callback: (arg: TrxState) => {
            if(arg.message) setMessage(arg.message);
            if(arg.errorMessage) setErrorMessage(arg.errorMessage);
        }
    });
    const readArgs = [[], [currentPath === 'stats'? statUser : account], [], [account]];
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
        let data : ReadData = mockReadData;
        let owner_ : Address = zeroAddress;
        let admins_ : Admin[] = [mockAdmins];
        let verificationStatus_ : [boolean, boolean] = [false, false];
        if(result && result[0].status === 'success' && result[0].result !== undefined) {
            owner_ = result[0].result as Address;
        }
        if(result && result[1].status === 'success' && result[1].result !== undefined) {
            data = result[1].result as ReadData;
        }
        if(result && result[2].status === 'success' && result[2].result !== undefined) {
            admins_ = result[2].result as Admin[];
        }
        if(result && result[3].status === 'success' && result[3].result !== undefined) {
            verificationStatus_ = result[3].result as [boolean, boolean];
        }

        setOwner(owner_);
        setStorage(data);
        setVerificationStatus(verificationStatus_);
        setAdmins(admins_);
    }, [result]);

    const stateData = React.useMemo(() => {
        // const data = stateData;
        const weekId = storage.state.weekId; // Current week Id
        const state = storage.state;
        const weekProfileData = storage.profileData;

        let userAdminStatus = false;
        const found = admins.filter(({id}) => id.toLowerCase() === account.toLowerCase());
        if(found && found.length > 0) userAdminStatus = found[0].active;

        // Return all approved campaigns
        const allCampaign : CampaignHashFormatted[] = storage.approved.map(({hash_, encoded}) => {
            const campaign = hexToString(encoded);
            return{
                campaign,
                hash_
            }
        }) 
        const wkId = toBN(weekId.toString()).toNumber();

        // Will always return the campaign for the current week
        const campaignData : CampaignHashFormatted[] = storage.wd[wkId].campaigns.map(({data: { data: { hash_, encoded }}}) => {
            const campaign = hexToString(encoded);
            return {hash_, campaign}
        });
        
        // const campaignHashes = allCampaign.map(({hash_}) => hash_);
        const campaignStrings = allCampaign.map(({campaign}) => campaign);
        
        const weekData = [...storage.wd];
        const formattedData = formatData(
            {weekProfileData, verificationStatus},
            weekData,
            requestedWkId,
            requestedHash
        );

        return {
            wkId,
            weekId,
            state,
            weekData,
            campaignData,
            campaignStrings,
            allCampaign,
            formattedData,
            userAdminStatus,
        }
    }, [storage, verificationStatus, admins, requestedWkId, requestedHash, account]);

    const app = React.useMemo(() => {
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

        return app;
    }, [currentPath]);

    const sethash = React.useCallback((arg: string) => {
        const filtered = stateData.allCampaign.filter(({campaign}) => arg.toLowerCase() === campaign.toLowerCase());
        if(filtered.length > 0){
            setHash(filtered[0]?.hash_);
        } else {
            setHash(mockHash);
        }
    }, [stateData.allCampaign]);

    const setweekId = React.useCallback((arg: string) => {
        setWeekId(Number(arg));
    }, []);

    const setstatUser = React.useCallback((arg: string) => {
        setStatUser(arg as Address);
    }, []);

    return (  
        <StorageContextProvider
            value={{
                handleStart: () => setPath('quiz'),
                loading,
                setpath,
                currentPath,
                messages,
                owner,
                admins,
                ...stateData,
                refetch,
                recordPoints,
                isMenuOpen,
                requestedHash,
                requestedWkId,
                toggleRecordPoints,
                setstatUser,
                appData,
                setmessage,
                setselectedCampaign,
                setError,
                setweekId,
                sethash,
                toggleOpen,
                result: quizResult? quizResult : mockQuizResult,
                quiz: selectedQuiz? selectedQuiz : mockQuiz,
                onPlayAgain: handlePlayAgain,
                onBackToHome: handleBackToHome,
                onQuizSelect: handleQuizSelect,
                onComplete: handleQuizComplete,
                onBack: handleBackToDashboard,
                userResults,
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