import type { Address, State, TransactionCallback, WeekData, Path, SelectedData, Category, VoidFunc, QuizResult, Quiz, CampaignData, Campaign} from "../../../types/quiz";
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
    handleStart: VoidFunc;
    setselectedCampaign: (arg: Campaign) => void;
    questionIndex: number;
    campaignHashes: Hex[];
    campaignStrings: string[];
    loading: boolean;
    campaignData: {
        campaignHash: `0x${string}`;
        campaign: string;
    }[];
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
    questionsId: string[];
    dataRef: React.RefObject<SelectedData>;
    userResults: QuizResult[];
    result: QuizResult;
    quiz: Quiz;
    appData: {categories: Category[], quizData: Quiz[] | null};
    onPlayAgain: () => void;
    onBackToHome: () => void;
    onQuizSelect: (quiz: Quiz) => void;
    onComplete: (result: Omit<QuizResult, 'id'>) => void;
    onBack: () => void;
    setmessage: (arg: string) => void;
    callback: TransactionCallback;
    setError: (arg: string) => void;
    toggleLoading: (arg: boolean) => void;
}
