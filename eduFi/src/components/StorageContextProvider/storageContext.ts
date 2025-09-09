import type { Address, VoidFunc, CampaignTemplateReadData } from "../../../types";
// import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
// import { Hex } from "viem";
// import { ReadContractsErrorType } from "wagmi/actions";

export interface NeynaDataContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: VoidFunc
};

export interface DataContextProps {
    // messages: string;
    // selectedCampaign: Campaign;
    // errorMessage: string;
    // currentPath: Path;
    // isMenuOpen: boolean;
    // // admins: Admin[];
    // toggleOpen: (arg: boolean) => void;
    // handleStart: VoidFunc;
    // setselectedCampaign: (arg: Campaign) => void;
    // campaignStrings: string[];
    // loading: boolean;
    // campaignData: CampaignHashFormatted[];
    // setpath: (arg: Path) => void;
    // refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<({
    //     error?: undefined;
    //     result: unknown;
    //     status: "success";
    // } | {
    //     error: Error;
    //     result?: undefined;
    //     status: "failure";
    // })[], ReadContractsErrorType>>;
    // state: State;
    // weekData: WeekData[];
    // weekId: bigint;
    // userAdminStatus: boolean;
    // userResults: QuizResultInput[];
    // result: QuizResultInput;
    // allCampaign: CampaignHashFormatted[];
    // quiz: Quiz;
    // wkId: number;
    // recordPoints: boolean;
    // formattedData: FormattedData;
    // requestedHash: Hex;
    // requestedWkId: number;
    // setstatUser: (arg: string) => void;
    // toggleRecordPoints: (arg:boolean) => void;
    // appData: {categories: CategoryType[], quizData: Quiz[] | null};
    // onPlayAgain: () => void;
    // setweekId: (arg: string) => void;
    // sethash: (arg: string) => void;
    // onBackToHome: (path: Path) => void;
    // onQuizSelect: (quiz: Quiz) => void;
    // onComplete: (result: QuizResultInput) => void;
    // onBack: () => void;
    // setmessage: (arg: string) => void;
    // callback: TransactionCallback;
    // setError: (arg: string) => void;
    // toggleLoading: (arg: boolean) => void;
    
    owner: Address;
    campaignsData: CampaignTemplateReadData[];
    verificationStatus: boolean;
    hasApproval: boolean;
    dev: Address;
    feeTo: Address;
    creationFee: bigint;
    verifier: Address;
    approvalFactory: Address;
}
