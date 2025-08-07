import type { Address, State, TransactionCallback, WeekData, Path, VoidFunc, Quiz, Campaign, QuizResultInput, CampaignDatum, Admin, CategoryType, GetFormattedCampaign, ProfilePerReqWk, ClaimResult, WeekProfileData, ProfileReturnType} from "../../../types/quiz";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { Hex } from "viem";
import { ReadContractsErrorType } from "wagmi/actions";

export interface NeynaDataContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: VoidFunc
};

export interface DataContextProps {
    messages: string;
    selectedCampaign: Campaign;
    errorMessage: string;
    currentPath: Path;
    isMenuOpen: boolean;
    admins: Admin[];
    toggleOpen: (arg: boolean) => void;
    handleStart: VoidFunc;
    setselectedCampaign: (arg: Campaign) => void;
    // campaignHashes: Hex[];
    campaignStrings: string[];
    loading: boolean;
    campaignData: CampaignDatum[];
    setpath: (arg: Path) => void;
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<({
        error?: undefined;
        result: unknown;
        status: "success";
    } | {
        error: Error;
        result?: undefined;
        status: "failure";
    })[], ReadContractsErrorType>>;
    state: State;
    owner: Address;
    weekData: WeekData[];
    weekId: bigint;
    userAdminStatus: boolean;
    userResults: QuizResultInput[];
    result: QuizResultInput;
    allCampaign: CampaignDatum[];
    quiz: Quiz;
    wkId: number;
    recordPoints: boolean;
    claimables: ClaimResult[];
    formattedData: ProfileReturnType;
    // weekProfileData: WeekProfileData[];
    toggleRecordPoints: (arg:boolean) => void;
    appData: {categories: CategoryType[], quizData: Quiz[] | null};
    onPlayAgain: () => void;
    setweekId: (arg: bigint) => void;
    sethash: (arg: string) => void;
    onBackToHome: (path: Path) => void;
    onQuizSelect: (quiz: Quiz) => void;
    onComplete: (result: QuizResultInput) => void;
    onBack: () => void;
    setmessage: (arg: string) => void;
    callback: TransactionCallback;
    setError: (arg: string) => void;
    toggleLoading: (arg: boolean) => void;
    // getFormattedCampaign: (weekId: number, setHash: (arg: string) => void) => {formattedCampaigns: GetFormattedCampaign[], formattedCampaign: GetFormattedCampaign};
    // getFormattedProfile: (weekId: number) => {
    //     formattedProfiles: ProfilePerReqWk[];
    //     formattedProfile: ProfilePerReqWk;
    // }
}
