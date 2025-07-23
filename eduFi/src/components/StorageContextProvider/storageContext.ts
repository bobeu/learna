import type { Address, State, TransactionCallback, WeekData, Path, Category, VoidFunc, Quiz, Campaign, QuizResultInput, CampaignDatum, Admin} from "../../../types/quiz";
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
    campaignHashes: Hex[];
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
    quiz: Quiz;
    wkId: number;
    recordPoints: boolean;
    toggleRecordPoints: (arg:boolean) => void;
    appData: {categories: Category[], quizData: Quiz[] | null};
    onPlayAgain: () => void;
    onBackToHome: (path: Path) => void;
    onQuizSelect: (quiz: Quiz) => void;
    onComplete: (result: QuizResultInput) => void;
    onBack: () => void;
    setmessage: (arg: string) => void;
    callback: TransactionCallback;
    setError: (arg: string) => void;
    toggleLoading: (arg: boolean) => void;
}
