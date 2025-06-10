import { Path, QuizDatum } from "~/dummyData";

export interface DataContextProps {
    messages: string[];
    setmessage: (arg: string) => void;
    // activePath: Path;
    // setActivepath: (arg: Path) => void;
    // // prevPaths: Path[];
    errorMessage: string;
    setError: (arg: string) => void;
    handleStart: () => void;
    setSelectedQuizData: (category:string, level: string) => void;
    indexedAnswer: number;
    selectedQuizData: {category: string, data: QuizDatum};
    data: QuizDatum;
    setpath: (arg: Path) => void;
    handleSelectAnswer: (arg: {label: string, value: string}) => void;
}
