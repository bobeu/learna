import { Hex } from "viem";
export type Category  = 'defi' | 'reactjs' | 'solidity' | 'wagmi' | '';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | '';
export type Address = `0x${string}`;
export type FunctionName = 
  '' | 
  'runall' | 
  "checkEligibility"|
  'recordPoints'|
  'setAdmin'|
  'getAdmins'|
  'hasPassKey'|
  'setTransitionInterval'|
  'claimReward'|
  'sortWeeklyReward'|
  'adjustCampaignValues'|
  'setUpCampaign'|
  'getProfile'|
  'generateKey'|
  'getData'|
  'owner'|
  'allowance'|
  'approve'|
  'pause' | 
  'unpause' |
  'configId' |
  'setConfigId' |
  'getClaimable' |
  'setScope' |
  'setPermission' |
  'banOrUnbanUser'|
  'getCampaingData' |
  'setMinimumToken';

export type VoidFunc = () => void;
export type ToggleDrawer = (value: number, setState: (value: number) => void) => (event: React.KeyboardEvent | React.MouseEvent) => void;
export type Path = 'dashboard' | 'results' | 'review' | 'admin' | 'scores' | 'stats' | 'quiz' | 'home' | 'generateuserkey' | 'profile' | 'setupcampaign';
export type CData = CampaignData[];

export interface Question {
  id: number;
  hash: Hex;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: DifficultyLevel;
  category: string;
  points: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  totalPoints: number;
  timeLimit?: number;
  difficulty: DifficultyLevel;
  category: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface QuizResultInput {
  answers: AnswerInput[];
  other: Omit<QuizResultOtherInput, 'id'> ;
}

export interface QuizResultOtherInput {
  id: string;
  quizId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  title: string;
}

export interface QuizResultOtherOutput extends QuizResultOtherInput{}

export interface AnswerInput {
  questionHash: Address;
  selected: number;
  isUserSelected: boolean;
}

export interface AnswerOutput {
  questionHash: string;
  selected: number;
  isUserSelected: boolean;
}

export interface QuizResultOuput {
  answers: AnswerOutput[];
  other: QuizResultOtherOutput;
}

export interface UserStats {
  totalQuizzes: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  streak: number;
}

////////////////////////////////////////////////

export interface QuestionObj {
  question: string;
  options: {label: string, value: string}[];
  answer: string;
  userAnswer: string;
  hash: string;
};

export interface SelectedData {
    id: number;
    category: Category;
    selectedLevel: DifficultyLevel;
    data: QuestionObj[];
    scoreParam: ScoresParam;
}

export interface QuizCategory {
  easy: {
    questions: QuestionObj[];
  };
  medium: {
    questions: QuestionObj[];
  };
  hard: {
    questions: QuestionObj[];
  };
};

export interface SelectedQuizData {
  category: Category, 
  level: DifficultyLevel, 
  questions: QuestionObj[];
 
};
export type QuizReturnData = QuizCategory[]; 

export interface QuizDatum {
  category: string;
  id: number,
  difficultyLevel: string;
  identifier: string;
  taken: boolean;
  questions: Array<{
    quest: string;
    options: Array<{
      label: string;
      value: string;
    }>;
    correctAnswer: {
      label: string;
      value: string;
    };
    userAnswer?: {
      label: string;
      value: string;
    };
  }>;
};

export interface Answer {
  label: string;
  value: string;
}

export interface Data {
  question: string;
  userAnswer: Answer;
  correctAnswer: Answer;
  quizHash?: string;
  userSelect: boolean;
  isCorrect: boolean;
  options: Array<Answer>;
};

export type DisplayQuizProps = {
  indexedAnswer: number;
  selectedQuizData: {category: string, data: QuizDatum};
  setpath: (arg: Path) => void;
  handleSelectAnswer: (arg: {label: string, value: string}) => void;
}

interface Values {
  totalAllocated: bigint;
  totalClaimed: bigint;
}

export interface Claim {
  native: Values;
  erc20: Values;
  erc20Addr: Address;
  claimActiveUntil: number;
  transitionDate: number;
}

export interface ProfileOther {
  amountMinted: bigint;
  amountClaimedInNative: bigint;
  amountClaimedInERC20: bigint;
  claimed: boolean;
  passKey: string;
  haskey: boolean;
  totalQuizPerWeek: number;
}

export interface Profile {
  quizResults: QuizResultOuput[];
  other: ProfileOther;
}

export interface ReadProfile {
  eligibility: Eligibility;
  profile: Profile;
  campaignHash: `0x${string}`;
}

export interface WeekProfileData {
  weekId: bigint;
  campaigns: Readonly<ReadProfile[]>;
}

export interface CampaignData {
  campaignHash: Hex;
  encoded: Hex;
}

export interface Campaign {
  fundsNative: bigint;
  fundsERC20: bigint;
  totalPoints: bigint;
  lastUpdated: number;
  activeLearners: bigint; 
  operator: Address;
  token: Address;
  hash_: Hex
  canClaim: boolean;
  data: CampaignData;
}

export interface CampaignDataFormatted {
  campaignHash: `0x${string}`;
  campaign: string;
};

export interface State {
  minimumToken: bigint;
  weekId: bigint;
  transitionInterval: number; 
  transitionDate: number;
}

export interface WeekData {
  weekId: bigint;
  campaigns: Readonly<Campaign[]>;
  claimDeadline: bigint;
} 

export interface ReadData {
  state: State;
  wd: Readonly<WeekData[]>;
}

export type TransactionCallback = (arg: TrxState) => void;
export type TransactionData = {
  contractAddress: string;
  inputCount: number;
  functionName: string;
  abi: any;
  requireArgUpdate: boolean;
};

export interface TrxState {
  message?: string;
  errorMessage?: any;
}

export type FilterTransactionDataProps = {
  chainId: number | undefined;
  functionNames?: FunctionName[];
  callback?: TransactionCallback;
  filter: boolean;
}

export interface HandleSelectAnswerProps {
  userAnswer?: Answer; 
  correctAnswer: Answer; 
  question: string;
  userSelect: boolean;
  options: Array<Answer>;
}

export interface ScoresParam {
  category: string;
  difficultyLevel: string;
  totalScores: number;
  questionSize: number;
  weightPerQuestion: number;
  totalAnsweredCorrectly: QuestionObj[];
  noAnswer: number;
  totalAnsweredIncorrectly: number;
}

export type ScoresReturn = () => ScoresParam;
export interface CampaignDatum {
  campaignHash: Address;
  campaign: string;
}

export interface Eligibility {
  canClaim: boolean;
  erc20Amount: bigint;
  nativeAmount: bigint;
  weekId: bigint;
  token: Address;
  campaignHash: Hex;
  isVerified: boolean;
  isClaimed: boolean;
}

export interface Admin {
  id: Address;
  active: boolean;
}