import type { Address, State, TransactionCallback, WeekData, Path, SelectedData, Category, DifficultyLevel, VoidFunc} from "../utilities";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { ReadContractsErrorType } from "wagmi/actions";

export interface NeynaDataContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: VoidFunc
};

export interface DataContextProps {
    messages: string;
    showFinishButton: boolean;
    errorMessage: string;
    currentPath: Path;
    handleStart: VoidFunc
    questionIndex: number;
    loading: boolean;
    // quizCompleted: boolean;
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
    questionsId: string[];
    dataRef: React.RefObject<SelectedData>
    setSelectedQuizData: (selectedCategory: Category, level: DifficultyLevel) => void;
    clearSelectedData: VoidFunc
    finalizeQuiz: () => void,
    resetQuestionIndex: () => void,
    setmessage: (arg: string) => void;
    clearData: VoidFunc
    callback: TransactionCallback;
    setError: (arg: string) => void;
    toggleLoading: (arg: boolean) => void;
    handleSelectAnswer: ({label} : {label: string}) => void;
}
