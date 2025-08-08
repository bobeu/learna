/* eslint-disable---d */
import React, { useState, useEffect } from 'react';
import type { 
    Address, 
    Admin, 
    Campaign, 
    CampaignDatum, 
    CategoryType, 
    Path, 
    ProfilePerReqWk, 
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
import AddressWrapper from './peripherals/AddressFormatter/AddressWrapper';
import { SelectComponent } from './peripherals/SelectComponent';
import assert from 'assert';
import { mockFormattedCampaign } from './StorageContextProvider/AppContext';

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
    const [verificationStatus, setVerificationStatus] = React.useState<[boolean, boolean]>([false, false]); //
    const [admins, setAdmins] = React.useState<Admin[]>([mockAdmins]);
    const [requestedWkId, setWeekId] = React.useState<number>(0);
    const [requestedHash, setHash] = React.useState<Hex>(mockHash);
    // const [requestedProfileHash, setHashProfile] = React.useState<Hex>(mockHash);

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
        functionNames: ['owner', 'getData', 'getAdmins', 'getVerificationStatus'],
        callback: (arg: TrxState) => {
            if(arg.message) setMessage(arg.message);
            if(arg.errorMessage) setErrorMessage(arg.errorMessage);
        }
    });
    const readArgs = [[], [account], [], [account]];
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
        let verificationStatus_ : [boolean, boolean] = [false, false];
        if(result && result.length > 0) {
            owner_ = result[0].result as Address;
            stateData_ = result[1].result as ReadData;
            admins_ = result[2].result as Admin[];
            verificationStatus_ = result[3].result as [boolean, boolean];
        }
        setOwner(owner_);
        setStateData(stateData_);
        setAdmins(admins_);
        setVerificationStatus(verificationStatus_);
    }, [result]);

    const { weekId, state, wkId, weekData, app, formattedData, userAdminStatus, campaignData, allCampaign, campaignStrings } = React.useMemo(() => {
        const data = stateData?? mockReadData;
        const weekId = data.state.weekId; // Current week Id
        const state = data.state;
        const weekProfileData = data.profileData;

        // Return all approved campaigns
        const allCampaign : CampaignDatum[] = data.approved.map(({hash_, encoded}) => {
            const campaign = hexToString(encoded);
            return{
                campaign,
                hash_
            }
        }) 
        const wkId = toBN(weekId.toString()).toNumber();

        // Will always return the campaign for the current week
        const campaignData : CampaignDatum[] = data.wd[wkId].campaigns.map(({data: { data: { hash_, encoded }}}) => {
            const campaign = hexToString(encoded);
            return {hash_, campaign}
        });
        
        // const campaignHashes = allCampaign.map(({hash_}) => hash_);
        const campaignStrings = allCampaign.map(({campaign}) => hexToString(campaign as Hex));
        
        const weekData = [...data.wd];
        const admins = result?.[2]?.result as Admin[] || [mockAdmins];

        let userAdminStatus = false;
        const found = admins.filter(({id}) => id.toLowerCase() === account.toLowerCase());
        if(found && found.length > 0) userAdminStatus = found[0].active;

        const formattedData = formatData(
            {weekProfileData, verificationStatus},
            weekData,
            requestedWkId,
            requestedHash
        );

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
            allCampaign,
            formattedData,
            // campaignHashes,
            userAdminStatus,
            // weekProfileData
        }
    }, [currentPath, stateData, requestedWkId, requestedHash]);

    const sethash = (arg: string) => {
        const filtered = allCampaign.filter(({campaign}) => arg.toLowerCase() === campaign.toLowerCase());
        if(filtered.length > 0){
            setHash(filtered[0]?.hash_);
        } else {
            alert("Can't find corresponding campaign");
        }
    }

    const setweekId = (arg: bigint) => {
        setWeekId(toBN(arg).toNumber());
        // const filtered = allCampaign.filter(({campaign}) => arg.toLowerCase() === campaign.toLowerCase());
        // if(filtered.length > 0){
        //     setWeekId(arg);
        // } else {
        //     alert("Can't find corresponding campaign");
        // }
    }

    // const getFormattedProfile = React.useCallback((weekId: number) => {
    //     // Search the data corresponding to the weekId
    //     const fWeek = weekProfileData.filter(({weekId: wk}) => toBN(wk.toString()).toNumber() === weekId);
    //     const found = fWeek[0];
    //     const profilesPerReqWk : ProfilePerReqWk[] = found.campaigns.map(({eligibility: elg, hash_, profile: pf}) => {
    //         const erc20 = toBN(elg.erc20Amount);
    //         const native = toBN(elg.nativeAmount);
    //         const platform = toBN(elg.platform);
    //         const showVerificationButton = elg.protocolVerified && (erc20.gt(0) || native.gt(0) || platform.gt(0));
    //         const wkClaimables = claimables.filter(({weekId: wk}) => toBN(wk.toString()).toNumber() === weekId); 
    //         // const campaignClaimable = wkClaimables[0].elgs.filter(({hash_}) => hash_.toLowerCase() === requestedProfileHash.toLowerCase());
    //         // const eligibility = campaignClaimable[0]?? mockClaimResult;
    //         // const { platform } = eligibility;
    //         const { elgs, barred, isVerified, claimed} = wkClaimables[0]?? mockClaimResult;
    //         let showWithdrawalButton = false;
    //         elgs.forEach(({erc20Amount, nativeAmount, protocolVerified}) => {
    //             if((erc20Amount > 0n || nativeAmount > 0n) && protocolVerified  && !barred && isVerified && !claimed) {
    //                 showWithdrawalButton = true;
    //             }
    //         });

    //         return {
    //             hash: hash_,
    //             showWithdrawalButton,
    //             eligibility: {
    //                 showVerificationButton,
    //                 erc20: formatValue(elg.erc20Amount),
    //                 native: formatValue(elg.nativeAmount),
    //                 platform: formatValue(elg.platform),
    //                 protocolVerified: elg.protocolVerified,
    //                 token: <AddressWrapper display={true} account={elg.token} size={3} />,
    //             },
    //             profile: {
    //                 quizResults:  pf.quizResults,
    //                 erc20Claimed: formatValue(pf.other.amountClaimedInERC20),
    //                 nativeClaimed: formatValue(pf.other.amountClaimedInNative),
    //                 amountMinted: formatValue(pf.other.amountMinted),
    //                 haskey: pf.other.haskey,
    //                 passkey: pf.other.passkey as Hex,
    //                 totalQuizTaken: pf.other.totalQuizPerWeek
    //             },
    //             selector: <SelectComponent 
    //                 setHash={sethashProfile}
    //                 campaigns={campaignStrings}
    //                 placeHolder="Learners"
    //                 width="w-"
    //             />
    //         }
    //     });
    //     const filteredWkData = weekData.filter(({weekId: wId}) => toBN(wId).toNumber() === weekId);
    //     const deadline = toBN(filteredWkData[0].claimDeadline).toNumber();
    //     const filteredCampaign = filteredWkData[0].campaigns.filter(({data: { data: { hash_ } }}) => hash_.toLowerCase() === requestedProfileHash.toLowerCase());
    //     const totalPoints = filteredCampaign[0].data.totalPoints;
    //     const formattedProfile = profilesPerReqWk.filter(({hash}) => hash.toLowerCase() === requestedProfileHash.toLowerCase());
    //     return {
    //         formattedProfiles: profilesPerReqWk,
    //         formattedProfile: formattedProfile[0],
    //         deadline: {
    //             toDate: getTimeFromEpoch(deadline),
    //             toNum: deadline
    //         },
    //         totalPoints: {
    //             toStr: totalPoints.toString(),
    //             toNum: toBN(totalPoints).toNumber()
    //         }
    //     }
    // }, [weekProfileData, requestedProfileHash]);

    /**
     * @dev Fetches all the campaigns from a particular week and return the formatted version
     * @param weekId: The week Id to pull from
     * @param setHash A function that is used to update the state somewhere when a child from a mapped string is selected   
     */
    // const getFormattedCampaign  = React.useCallback((weekId: number) => {
    //     assert(weekId < weekData.length, "Week Id exceeds the weekData length");
    //     const formattedCampaigns = weekData[weekId].campaigns.map(({data: { data: { hash_, encoded }, ...rest}, users}) => {
    //         return {
    //             hash_,
    //             campaignName: hexToString(encoded),
    //             totalLearners: users.length,
    //             fundsNative: formatValue(rest.fundsNative),
    //             fundsERC20: formatValue(rest.fundsERC20),
    //             platform: formatValue(rest.platformToken),
    //             lastUpdated: getTimeFromEpoch(rest.lastUpdated),
    //             totalPoints: {
    //                 toStr: rest.totalPoints.toString(),
    //                 toNum: toBN(rest.totalPoints).toNumber()
    //             },
    //             operator: <AddressWrapper display={true} account={rest.operator} size={3} />,
    //             token: <AddressWrapper display={true} account={rest.token} size={3} />,
    //             users,
    //             campaignSelector: <SelectComponent 
    //                 setHash={sethashStat}
    //                 campaigns={campaignStrings}
    //                 placeHolder="Learners"
    //                 width="w-"
    //             />
    //         }
    //     });
    //     const filteredDeadline = weekData.filter(({weekId: wId}) => toBN(wId).toNumber() === weekId);
    //     const deadline = toBN(filteredDeadline[0].claimDeadline).toNumber();
    //     const formattedCampaign = formattedCampaigns.filter(({hash_}) => hash_.toLowerCase() === requestedHashStat.toLowerCase());
    //     return {
    //         formattedCampaign: formattedCampaign[0]?? mockFormattedCampaign,
    //         formattedCampaigns,
    //         deadline: {
    //             toDate: getTimeFromEpoch(deadline),
    //             toNum: deadline
    //         }
    //     }
    // }, [weekData, requestedHashStat]);

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
                campaignStrings,
                recordPoints,
                isMenuOpen,
                requestedHash,
                requestedWkId,
                formattedData,
                toggleRecordPoints,
                appData,
                setmessage,
                setselectedCampaign,
                setError,
                setweekId,
                sethash,
                toggleOpen,
                // getFormattedCampaign,
                // getFormattedProfile,
                result: quizResult? quizResult : mockQuizResult,
                quiz: selectedQuiz? selectedQuiz : mockQuiz,
                onPlayAgain: handlePlayAgain,
                onBackToHome: handleBackToHome,
                onQuizSelect: handleQuizSelect,
                onComplete: handleQuizComplete,
                onBack: handleBackToDashboard,
                userResults,
                campaignData,
                allCampaign,
                // weekProfileData,
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