import { Path, QuizDatum } from "~/dummyData";
import { Address, ScoresParam, State, TransactionCallback, WeekData } from "../utilities";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { ReadContractsErrorType } from "wagmi/actions";

export interface DataContextProps {
    messages: string;
    showFinishButton: boolean;
    errorMessage: string;
    currentPath: Path;
    handleStart: () => void;
    questionIndex: number;
    selectedQuizData: {category: string, data: QuizDatum};
    data: QuizDatum;
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
    // firstTransactionDone: boolean;
    state: State;
    owner: Address;
    weekData: WeekData[];
    weekId: bigint;
    setSelectedQuizData: (selected: string, level: string) => void;
    handleSelectAnswer: ({ label, value }: {
        label: string;
        value: string;
    }) => void;
    getFunctions: () => {
        closeQuizComplettion: () => void,
        setmessage: (arg: string) => void;
        clearData: () => void;
        callback: TransactionCallback;
        setError: (arg: string) => void;
        // setTransactionDone: (arg: boolean) => void;
        
    },
    
}
