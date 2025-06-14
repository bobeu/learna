import { Path, QuizDatum } from "~/dummyData";
import { Address, ScoresParam, State, TransactionCallback, WeekData } from "../utilities";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { ReadContractsErrorType } from "wagmi/actions";

export interface DataContextProps {
    messages: string;
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
    setTransactionDone: (arg: boolean) => void;
    firstTransactionDone: boolean;
    state: State;
    owner: Address;
    weekData: WeekData[];
    weekId: bigint;
    scoresParam: ScoresParam;
}
