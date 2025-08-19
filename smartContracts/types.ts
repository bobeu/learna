import { Hex } from "viem";
export type CategoryType  = 'defi' | 'reactjs' | 'solidity' | 'wagmi' | string;
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | '';
export type Address = `0x${string}`;

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

export interface AnswerInput {
  questionHash: Address;
  selected: number;
  isUserSelected: boolean;
}
export interface QuizResultOtherOutput extends QuizResultOtherInput{}


export interface AnswerOutput {
  questionHash: string;
  selected: number;
  isUserSelected: boolean;
}

export interface QuizResultOuput {
  answers: AnswerOutput[];
  other: QuizResultOtherOutput;
}

export interface Answer {
  label: string;
  value: string;
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
  passkey: string;
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
  isClaimed: boolean;
  hash_: `0x${string}`;
}

export interface WeekProfileData {
  weekId: bigint;
  campaigns: Readonly<ReadProfile[]>;
}

export interface CampaignHash {
  hash_: Hex;
  encoded: Hex;
}

export interface Campaign {
  data: CampaignData;
  users: Address[];
}

export interface CampaignData {
  platformToken: bigint;
  fundsNative: bigint;
  fundsERC20: bigint;
  totalPoints: bigint;
  lastUpdated: number;
  activeLearners: bigint; 
  operator: Address;
  token: Address;
  data: CampaignHash;
}

export interface CampaignHashFormatted {
  hash_: Hex;
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
  approved: CampaignHash[];
  profileData: WeekProfileData[];
}

export interface Eligibility {
  isEligible: boolean;
  erc20Amount: bigint;
  nativeAmount: bigint;
  platform: bigint;
  weekId: bigint;
  token: Address;
  hash_: Hex;
}

export interface Admin {
  id: Address;
  active: boolean;
}

export interface QuestionObj {
  id: string | number;
  explanation?: string;
  question: string;
  options: string[];
  answer: number | string;
  userAnswer: string;
  hash: string;
};

export interface Level {
  difficulty: string;
  id: string;
  questions: QuestionObj[];
}

export interface Blob {
  title: string;
  content: string;
}

export interface CategoryData {
  category: string;
  id: string;
  description: string;
  levels: Level[];
  blobs?: Blob[];
}

export interface QuizData {
  categories: string;
  difficulties: string;
  categoryData: CategoryData[];
}

