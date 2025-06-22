import { Address, FunctionName, HandleSelectAnswerProps, State, TransactionCallback, WeekData, Path, QuizDatum, SelectedData } from "../utilities";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { ReadContractsErrorType } from "wagmi/actions";

export interface NeynaDataContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: () => void;
};

export interface DataContextProps {
    messages: string;
    showFinishButton: boolean;
    errorMessage: string;
    currentPath: Path;
    taskCompleted: FunctionName;
    handleStart: () => void;
    questionIndex: number;
    selectedQuizData: {category: string, data: QuizDatum};
    data: SelectedData;
    loading: boolean;
    quizCompleted: boolean;
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
    setSelectedQuizData: (selected: string, level: string) => void;
    handleSelectAnswer: (arg: HandleSelectAnswerProps) => void;
    getFunctions: () => {
        closeQuizComplettion: () => void,
        setmessage: (arg: string) => void;
        clearData: () => void;
        callback: TransactionCallback;
        setError: (arg: string) => void;
        toggleLoading: (arg: boolean) => void;
        setcompletedTask: (arg: FunctionName) => void;
    },
    
}
