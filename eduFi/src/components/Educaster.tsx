/* eslint-disable */
import React, { useState, useEffect } from 'react';
import type { 
    Address, 
    Campaign, 
    CampaignDatum, 
    Category, 
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

// Self///////////////////////////////
import { useRouter } from "next/navigation";
import { countries, getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcode,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";

// /////////////////////////////

import { 
    filterTransactionData, 
    mockQuiz, 
    mockQuizResult, 
    mockReadData, 
    loadQuizData, 
    formatAddr, 
    mockCampaign, 
    toBN
} from './utilities';

import LandingPage from './landingPage';
import Profile from './peripherals/Profile';
import Stats from './peripherals/Stats';
import SetupCampaign from './peripherals/SetupCampaign';

const TOTAL_POINTS = 100;
const TIME_PER_QUESTION = 0.4;

export default function Educaster() {
    const [appData, setAppData] = React.useState<{categories: Category[], quizData: Quiz[] | null}>({categories: [], quizData: null});
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

    // Self////////////////////////////////
    const router = useRouter();
    const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
    const [universalLink, setUniversalLink] = useState("");
    const [userId, setUserId] = useState(zeroAddress);
    const excludedCountries = React.useMemo(() => [countries.NORTH_KOREA], []);

     useEffect(() => {
        try {
        const app = new SelfAppBuilder({
            version: 2,
            appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Workshop",
            scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "self-workshop",
            endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
            logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
            userId: userId,
            endpointType: "staging_https",
            userIdType: "hex",
            userDefinedData: "Bonjour Cannes!",
            disclosures: {
            minimumAge: 18,
            nationality: true,
            gender: true,
            }
        }).build();

        setSelfApp(app);
        setUniversalLink(getUniversalLink(app));
        } catch (error) {
        console.error("Failed to initialize Self app:", error);
        }
    }, []);

    const handleSuccessfulVerification = () => {
        router.push("/verified");
    };

    ////////////////////////////////////////
    
    const chainId = useChainId();
    const config = useConfig();
    const { isConnected, address, connector } = useAccount();
    const { connect } = useConnect();
    const account = formatAddr(address);

    // Update quiz data
    React.useEffect(() => {
        if(!appData.quizData) {
            const appData_ = loadQuizData({timePerQuestion: TIME_PER_QUESTION, totalPoints: TOTAL_POINTS});
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

    // // Save user results to localStorage whenever userResults changes
    // useEffect(() => {
    //     if (userResults.length > 0) {
    //         localStorage.setItem('quizResults', JSON.stringify(userResults));
    //     }
    // }, [userResults]);

    const handleQuizSelect = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
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
        functionNames: ['owner', 'getData', 'getAdminStatus'],
        callback: (arg: TrxState) => {
            if(arg.message) setMessage(arg.message);
            if(arg.errorMessage) setErrorMessage(arg.errorMessage);
        }
    });
    const readArgs = [[], [], [account]];
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
    const data = result?.[1]?.result as ReadData || mockReadData;

    const { weekId, app, state, wkId, owner, weekData, userAdminStatus, campaignData, campaignHashes, campaignStrings } = React.useMemo(() => {
        const weekId = data.state.weekCounter; // Current week Id
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
        const owner = result?.[0]?.result as Address || zeroAddress;
        const weekData = [...data.wd];
        const userAdminStatus = result?.[2]?.result as boolean;

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
            owner,
            weekData,
            campaignData,
            campaignStrings,
            campaignHashes,
            userAdminStatus
        }
    }, [data, currentPath]);

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
            <LayoutContext>
                <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto">
                        <div className="flex justify-center mb-6">
                        {selfApp ? (
                            <SelfQRcode
                                selfApp={selfApp}
                                onSuccess={handleSuccessfulVerification}
                                onError={(error) => {
                                    const errorCode = error.error_code || 'Unknown';
                                    const reason = error.reason || 'Unknown error';
                                    console.error(`Error ${errorCode}: ${reason}`);
                                    console.error("Error: Failed to verify identity");
                                }}
                            />
                        ) : (
                            <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
                            <p className="text-gray-500 text-sm">Loading QR Code...</p>
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                { app }
            </LayoutContext>
        </StorageContextProvider>
    )
}