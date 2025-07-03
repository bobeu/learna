export type Category  = 'defi' | 'reactjs' | 'solidity' | 'wagmi' | '';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | '';
export type Address = `0x${string}`;
export type FunctionName = '' | 'runall' | 'checkligibility' | 'recordPoints' | 'removeUsersForWeeklyEarning' | 'approve' | 'claimWeeklyReward' | 'sortWeeklyReward' | 'tip' | 'getTippers' | 'getUserData' | 'generateKey' | 'getData' | 'owner' ;
export type VoidFunc = () => void;
export type ToggleDrawer = (value: number, setState: (value: number) => void) => (event: React.KeyboardEvent | React.MouseEvent) => void;
export type QuizData = Array<QuizDatum>;
export type Path = 'dashboard' | 'quiz' | 'results' | 'selectcategory' | 'review' | 'sendtip' | 'scores' | 'stats' | 'quiz' | 'home' | 'generateuserkey' | 'profile';
// export type Label = 'a' | 'b' | 'c' | 'd';

export interface Question {
  id: string;
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

export interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  answers: Record<string, number>;
  completedAt: Date;
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

// export interface SelectedData {
//   category: string;
//   difficultyLevel: string;
//   data: Array<Data>;
//   totalQuestions: number;
//   scoreParam: ScoresParam;
// }

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

export interface Profile {
  amountClaimedInNative: bigint;
  amountClaimedInERC20: bigint;
  claimed: boolean;
  points: number;
  passKey: string;
  haskey: boolean;
  totalQuizPerWeek: number;
}

interface Tipper {
  totalTipped: bigint;
  points: number;
  lastTippedDate: bigint;
  id: Address;
}

export interface State {
  minimumToken: bigint;
  weekCounter: bigint;
  transitionInterval: number; 
}

export interface WeekData {
  tippers: Readonly<Tipper[]>;
  claim: Claim;
  activeLearners: bigint; 
  totalPoints: bigint;
  transitionInterval: number;
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


















// I am running a quiz project. I want to generate images based on the TypeScript with a difficulty: "Hard". I prefer a light theme with a cyan and purple blend.
// // It should be a 3D isometric illustration of a simple, friendly social network icon representing 'TypeScript', with clear, smooth lines. The scene features a bright blend of cyan and purple gradient colors. The text 'TypeScript' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banners. High resolution, 16:9 aspect ratio. 

// EthersJs
// difficulty: Easy

// Create a 3D isometric illustration of a simple, glowing 'E' symbol connecting to a blockchain link, representing 'EthersJs' ease of use. The scene features a bright blend of cyan and purple gradient colors. The text 'EthersJs' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Medium

// Create a 3D isometric illustration of a developer's hand interacting with abstract code snippets and a blockchain node, symbolizing 'EthersJs' functionality. The scene features a balanced blend of cyan and purple gradient colors. The text 'EthersJs' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Hard

// Create a 3D isometric illustration of complex API calls and transaction signing processes, with abstract representations of providers, signers, and contract interactions for 'EthersJs'. The scene features a dynamic blend of deep cyan and vibrant purple gradient colors. The text 'EthersJs' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// Wagmi
// difficulty: Easy

// Create a 3D isometric illustration of a simple, friendly wallet icon connecting to a blockchain, representing 'Wagmi' ease of use. The scene features a bright blend of cyan and purple gradient colors. The text 'Wagmi' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Medium

// Create a 3D isometric illustration of a developer's hands interacting with abstract web3 hooks and a dApp interface, symbolizing 'Wagmi' integration. The scene features a balanced blend of cyan and purple gradient colors. The text 'Wagmi' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Hard

// Create a 3D isometric illustration of complex web3 interactions, showing wallet connections, contract writes, and event listeners, with abstract representations of 'Wagmi' hooks and providers. The scene features a dynamic blend of deep cyan and vibrant purple gradient colors. The text 'Wagmi' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// Celo
// difficulty: Easy

// Create a 3D isometric illustration of a mobile phone icon with a subtle currency symbol, representing 'Celo's mobile-first approach. The scene features a bright blend of cyan and purple gradient colors. The text 'Celo' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Medium

// Create a 3D isometric illustration of a network of interconnected mobile devices and stablecoin symbols, symbolizing 'Celo's financial inclusion mission. The scene features a balanced blend of cyan and purple gradient colors. The text 'Celo' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Hard

// Create a 3D isometric illustration of the Celo blockchain architecture, showing validators, the Celo Reserve, and stablecoin mechanisms, with abstract representations of governance and ReFi. The scene features a dynamic blend of deep cyan and vibrant purple gradient colors. The text 'Celo' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// Typescript
// difficulty: Easy

// Create a 3D isometric illustration of a simple, clear 'TS' logo with subtle type annotations, representing 'Typescript' for easy understanding. The scene features a bright blend of cyan and purple gradient colors. The text 'Typescript' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Medium

// Create a 3D isometric illustration of code snippets with type definitions and interfaces, showing how 'Typescript' adds structure to JavaScript. The scene features a balanced blend of cyan and purple gradient colors. The text 'Typescript' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Hard

// Create a 3D isometric illustration of complex type inference, generics, and advanced decorators in a structured code environment, symbolizing 'Typescript's powerful features. The scene features a dynamic blend of deep cyan and vibrant purple gradient colors. The text 'Typescript' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// Javascript
// difficulty: Easy

// Create a 3D isometric illustration of a simple, glowing 'JS' logo, representing 'Javascript' as a fundamental web language. The scene features a bright blend of cyan and purple gradient colors. The text 'Javascript' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Medium

// Create a 3D isometric illustration of a web browser window with interactive elements and simple code execution, symbolizing 'Javascript's role in web development. The scene features a balanced blend of cyan and purple gradient colors. The text 'Javascript' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Hard

// Create a 3D isometric illustration of asynchronous operations, event loops, and complex object-oriented or functional programming concepts in a dynamic code environment, symbolizing 'Javascript's advanced capabilities. The scene features a dynamic blend of deep cyan and vibrant purple gradient colors. The text 'Javascript' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// Web3JS
// difficulty: Easy

// Create a 3D isometric illustration of a simple blockchain link connecting to a web browser icon, representing 'Web3JS' basic interaction. The scene features a bright blend of cyan and purple gradient colors. The text 'Web3JS' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Medium

// Create a 3D isometric illustration of a dApp interface showing a wallet connection and a simple transaction, symbolizing 'Web3JS' functionality. The scene features a balanced blend of cyan and purple gradient colors. The text 'Web3JS' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Hard

// Create a 3D isometric illustration of complex smart contract interactions, event subscriptions, and provider management, with abstract representations of 'Web3JS' API methods and data structures. The scene features a dynamic blend of deep cyan and vibrant purple gradient colors. The text 'Web3JS' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// Hardhat
// difficulty: Easy

// Create a 3D isometric illustration of a simple construction helmet with a blockchain symbol, representing 'Hardhat' for basic development. The scene features a bright blend of cyan and purple gradient colors. The text 'Hardhat' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banner. High resolution, 16:9 aspect ratio.

// difficulty: Medium

// I am running a quiz project. I want to generate images based on the Hardhat with a difficulty: "Medium". I prefer a light theme with a cyan and purple blend.
// It should be a 3D isometric illustration of a simple, friendly social network icon representing 'Hardhat', with clear, smooth lines. The scene features a bright blend of cyan and purple gradient colors. The text 'Hardhat' is prominently displayed on the banner. Include a subtle, fading watermark 'Educaster'. Clean, modern, minimalist design, perfect for web and mobile banners. High resolution, 16:9 aspect ratio.

