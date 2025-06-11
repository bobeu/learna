import { Path, QuizDatum } from "~/dummyData";
import { Claims, State, TransactionCallback } from "../utilities";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { ReadContractsErrorType } from "wagmi/actions";

export interface DataContextProps {
    messages: string[];
    setmessage: (arg: string) => void;
    showFinishButton: boolean;
    errorMessage: string;
    currentPath: Path;
    setError: (arg: string) => void;
    handleStart: () => void;
    callback: TransactionCallback;
    setSelectedQuizData: (category:string, level: string) => void;
    indexedAnswer: number;
    selectedQuizData: {category: string, data: QuizDatum};
    data: QuizDatum;
    setpath: (arg: Path) => void;
    handleSelectAnswer: (arg: {label: string, value: string}) => void;
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<({
        error?: undefined;
        result: unknown;
        status: "success";
    } | {
        error: Error;
        result?: undefined;
        status: "failure";
    })[], ReadContractsErrorType>>;
    clearData: () => void;
    setscores: (arg: number) => void;
    setTransactionDone: (arg: boolean) => void;
    firstTransactionDone: boolean;
    state: State;
    totalScore: number;
    pastClaims: Claims[];
    weekId: bigint;
}
