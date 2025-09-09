/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { 
    CampaignTemplateReadData,
    mockCampaignTemplateReadData,
    // mockFilterTransactionData,
    type Address, 
    // type Admin, 
    // type Campaign, 
    // type CampaignHashFormatted, 
    // type CategoryType, 
    // type FilterTransactionReturnType, 
    // type Path, 
    // type Quiz, 
    type QuizResultInput, 
    // type QuizResultOtherInput, 
    type ReadData, 
    // type TransactionCallback, 
    // type TrxState 
} from '../../types';

// import Dashboard from '@/components/quizComponents/Dashboard';
// import { QuizInterface } from '@/components/quizComponents/QuizInterface';
// import { QuizResults } from '@/components/quizComponents/QuizResults';
import { useAccount, useChainId, useConfig, useReadContracts } from 'wagmi';
import { Hex, zeroAddress } from 'viem';
import { LayoutContext } from './LayoutContext';
import { StorageContextProvider } from './StorageContextProvider';
import { 
    filterTransactionData, 
    // mockQuiz, 
    // mockQuizResult, 
    mockReadData, 
    // load_d_, 
    formatAddr, 
    // mockCampaign, 
    // toBN,
    // mockAdmins,
    // mockHash,
    // formatData,
    formatCampaignsTemplateReadData
} from './utilities';

// import LandingPage from './landingPage';
// import Profile from './peripherals/Profile';
// import Stats from './peripherals/Stats';
// import SetupCampaign from './peripherals/SetupCampaign';
import NewLandingPage from './landingPage/NewLandingPage';
import campaignTemplateArtifacts from "../../contractsArtifacts/template.json";

// const TOTAL_POINTS = 100;
// const TIME_PER_QUESTION = 0.4;

export default function LearnaApp() {
    // const [appData, setAppData] = React.useState<{categories: CategoryType[], quizData: Quiz[] | null}>({categories: [], quizData: null});
    // const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    // const [quizResult, setQuizResult] = useState<QuizResultInput | null>(null);
    const [userResults, setUserResults] = useState<QuizResultInput[]>([]);
    // const [messages, setMessage] = React.useState<string>('');
    // const [errorMessage, setErrorMessage] = React.useState<string>('');
    // const [currentPath, setPath] = React.useState<Path>('home');
    // const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign>(mockCampaign);
    // const [loading, setLoading] = React.useState<boolean>(false);
    // const [isMenuOpen, setMenu] = React.useState<boolean>(false);
    // const [recordPoints, setRecordPoints] = React.useState<boolean>(false);
    // const [statUser, setStatUser] = React.useState<Address>(zeroAddress);
    // const [requestedWkId, setWeekId] = React.useState<number>(0);
    // const [requestedHash, setHash] = React.useState<Hex>(mockHash);
    const [factoryData, setData] = React.useState<ReadData>(mockReadData);
    const [hasApproval, setHasApproval] = React.useState<boolean>(false);
    const [owner, setOwner] = React.useState<Address>(zeroAddress);
    const [verificationStatus, setVerificationStatus] = React.useState<boolean>(false);
    const [campaignsData, setCampaignsData] = React.useState<CampaignTemplateReadData[]>([mockCampaignTemplateReadData]);

    const chainId = useChainId();
    const config = useConfig();
    const { isConnected, address } = useAccount();
    // const { connect } = useConnect();
    const account = formatAddr(address);

    // Update quiz data
    // React.useEffect(() => {
    //     if(!appData.quizData) {
    //         const appData_ = load_d_({timePerQuestion: TIME_PER_QUESTION, totalPoints: TOTAL_POINTS});
    //         setAppData(appData_);
    //     }
    // }, [appData.quizData]);

    // Update current page based on connection state
    // React.useEffect(() => {
    //     if(!isConnected && connector) connect({connector, chainId});
    //     if(isConnected && currentPath === 'home') setpath('dashboard');
    //     if(!isConnected && currentPath !== 'home') setpath('home');
    // }, [isConnected, connector, chainId, currentPath, connect]);

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

    // const handleQuizSelect = (quiz: Quiz) => {
    //     // const admin = formatAddr(process.env.NEXT_PUBLIC_DIVVI_IDENTIFIER).toLowerCase();
    //     // const divviAdmin = formatAddr(process.env.NEXT_PUBLIC_DIVVI_ADMIN).toLowerCase();
    //     // if(quiz.title === 'divvi'){
    //     //     if(account.toLowerCase() === divviAdmin || account.toLowerCase() === admin){
    //     //         setSelectedQuiz(quiz);
    //     //     }
    //     // } else {
    //     //     setSelectedQuiz(quiz);
    //     // }
    //     setSelectedQuiz(quiz);
    //     setPath('quiz');
    // };

    // const toggleOpen = (arg: boolean) => {
    //     setMenu(arg);
    // }

    // const handleQuizComplete = (result: QuizResultInput) => {
    //     const resultOtherInput : QuizResultOtherInput = {
    //         ...result.other,
    //         id: Date.now().toString()
    //     }
        
    //     const newResult: QuizResultInput= {
    //         answers: result.answers,
    //         other: resultOtherInput
    //     };
        
    //     setQuizResult(newResult);
    //     setUserResults(prev => [newResult, ...prev]);
    //     setPath('results');
    //     // setTimeout(() => setRecordPoints(true), 3000);
    //     clearTimeout(3000);
        
    // };

    // const setpath = (arg: Path) => {
    //     setPath(arg);
    // }

    // const toggleRecordPoints = (arg: boolean) => {
    //     setRecordPoints(arg);
    // }

    // const handlePlayAgain = () => {
    //     setPath('quiz');
    // };

    // const handleBackToHome = (path: Path) => {
    //     setSelectedQuiz(null);
    //     setQuizResult(null);
    //     setPath(path);
    // };

    // const handleBackToDashboard = () => {
    //     setSelectedQuiz(null);
    //     setPath('dashboard');
    // };

    // const setmessage = (arg: string) => {
    //     setMessage(arg);
    // }
    // const setError = (arg:string) => {
    //     setErrorMessage(arg);
    // }
    // const toggleLoading = (arg: boolean) => {
    //     setLoading(arg);
    // }

    // const setselectedCampaign = (arg: Campaign) => {
    //     setSelectedCampaign(arg);
    //     if(currentPath !== 'profile') setPath('profile');
    // };

    // const callback : TransactionCallback = (arg) => {
    //     if(arg.message) setMessage(arg.message);
    //     if(arg.errorMessage) setErrorMessage(arg.errorMessage);
    // };
    
    // Build read transactions data
    const { transactionData: td, contractAddresses: ca } = filterTransactionData({
        chainId,
        filter: true,
        functionNames: ['owner', 'getData', 'hasApproval', 'getVerificationStatus'],
        // callback: (arg: TrxState) => {
        //     if(arg.message) setMessage(arg.message);
        //     if(arg.errorMessage) setErrorMessage(arg.errorMessage);
        // }
    });
    const readArgs = [[], [], [account], [account]];
    const contractAddresses = [
        td[0].contractAddress as Address,
        ca.CampaignFactory as Address,
        ca.ApprovalFactory as Address,
        ca.VerifierV2 as Address,
    ];
    const readTxObject = td.map((item, i) => {
        return{
            abi: item.abi,
            functionName: item.functionName,
            address: contractAddresses[i],
            args: readArgs[i]
        }
    });

    // Read data from the CampaignFactory contact 
    const { data: factoryReadData, refetch } = useReadContracts({
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

    // Update the state with the result  of the read action
    React.useEffect(() => {
        let data : ReadData = mockReadData;
        let owner_ : Address = zeroAddress;
        let hasApproval_ : boolean = false;
        let verificationStatus_ : boolean = false;

        if(factoryReadData && factoryReadData[0].status === 'success' && factoryReadData[0].result !== undefined) {
            owner_ = factoryReadData[0].result as Address;
        }
        if(factoryReadData && factoryReadData[1].status === 'success' && factoryReadData[1].result !== undefined) {
            data = factoryReadData[1].result as ReadData;
        }
        if(factoryReadData && factoryReadData[2].status === 'success' && factoryReadData[2].result !== undefined) {
            hasApproval_ = factoryReadData[2].result as boolean;
        }
        if(factoryReadData && factoryReadData[3].status === 'success' && factoryReadData[3].result !== undefined) {
            verificationStatus_ = factoryReadData[3].result as boolean;
        }
        
        setOwner(owner_);
        setData(data);
        setVerificationStatus(verificationStatus_);
        setHasApproval(hasApproval_);
    }, [factoryReadData]);

    // Prepare to read data from the CampaignTemplate with the results fetched from the CampaignFatcory
    const { campaignDataTrxns, rest } = React.useMemo(() => {
        const { campaigns, ...rest } = factoryData;
        const campaignDataTrxns = campaigns.map(({identifier}) => {
            return {
                abi: campaignTemplateArtifacts.abi as any,
                functionName: 'getData',
                address: identifier as Address,
                args: []
            }
        });

        return { campaignDataTrxns, rest }
    }, [factoryData]);

    // Read data from the campaign addresses
    const { data: campaignsReadData } = useReadContracts({
        config,
        account,
        contracts: campaignDataTrxns,
        allowFailure: true,
        query: {
            enabled: !!isConnected,
            refetchOnReconnect: 'always', 
            refetchInterval: 5000,
        }
    });

    // Update the state with the result  of the read action
    React.useEffect(() => {
        let campaignsData_ : CampaignTemplateReadData[] = [mockCampaignTemplateReadData];
        if(campaignsReadData && campaignsReadData.length > 0) {
            campaignsData_ = campaignsReadData.map(({result, status}, i) => {
                let campaignData_ : CampaignTemplateReadData = mockCampaignTemplateReadData;
                if(status === 'success') {
                    campaignData_ = result as CampaignTemplateReadData;
                }
                return formatCampaignsTemplateReadData(campaignData_);
            });
        }
        
        setCampaignsData(campaignsData_);
    }, [campaignsReadData]);

    // const app = React.useMemo(() => {
        
    //     return ;
    // }, [currentPath]);

    // const sethash = React.useCallback((arg: string) => {
    //     const filtered = stateData.allCampaign.filter(({campaign}) => arg.toLowerCase() === campaign.toLowerCase());
    //     if(filtered.length > 0){
    //         setHash(filtered[0]?.hash_);
    //     }
        
    //     // else {
    //     //     setHash(mockHash);
    //     // }
    // }, [stateData.allCampaign]);

    // const setweekId = React.useCallback((arg: string) => {
    //     setWeekId(Number(arg));
    // }, []);

    // const setstatUser = React.useCallback((arg: string) => {
    //     setStatUser(arg as Address);
    // }, []);

    return (  
        <StorageContextProvider
            value={{
                ...rest,
                // handleStart: () => setPath('quiz'),
                // loading,
                // setpath,
                // currentPath,
                // messages,
                hasApproval,
                owner,
                campaignsData,
                verificationStatus,
                // ...stateData,
                // refetch,
                // recordPoints,
                // isMenuOpen,
                // requestedHash,
                // requestedWkId,
                // toggleRecordPoints,
                // setstatUser,
                // appData,
                // setmessage,
                // setselectedCampaign,
                // setError,
                // setweekId,
                // sethash,
                // toggleOpen,
                // result: quizResult? quizResult : mockQuizResult,
                // quiz: selectedQuiz? selectedQuiz : mockQuiz,
                // onPlayAgain: handlePlayAgain,
                // onBackToHome: handleBackToHome,
                // onQuizSelect: handleQuizSelect,
                // onComplete: handleQuizComplete,
                // onBack: handleBackToDashboard,
                // userResults,
                // toggleLoading,
                // callback,
                // errorMessage,
                // selectedCampaign
            }}
        >
            <LayoutContext> 
                <NewLandingPage />
            </LayoutContext>
        </StorageContextProvider>
    )
}