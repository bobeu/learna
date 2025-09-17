import { Hex, hexToString, stringToHex, zeroAddress } from "viem";
export type CategoryType  = 'defi' | 'reactjs' | 'solidity' | 'wagmi' | string;
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | '';
export type Address = `0x${string}`;
export type FunctionName = 
  '' | 
  'claimReward'|
  'getData'|
  'owner'|
  'allowance'|
  'approve'|
  'pause' | 
  'unpause' |
  'getFactory' |
  'getUserCampaigns' |
  'panicWithdraw' |
  'removeApproval' |
  'setApproval' |
  'setApprovalFactory' |
  'setCreationFee' |
  'setFactory' |
  'setFeeTo' |
  'toggleUseWalletVerification' |
  'setVerifier' |
  'configId' |
  'setConfigId' |
  'setScope' |
  'verify' |
  'verifyByApproved'|
  'setPermission' |
  'banOrUnbanUser'|
  'getCampaingData' |
  'getVerificationStatus' |
  'createCampaign' |
  'hasApproval' |
  'withdraw' |
  'setMinimumToken';

export enum RewardType { POASS, POINT }
export type VoidFunc = () => void;
export type ToggleDrawer = (value: number, setState: (value: number) => void) => (event: React.KeyboardEvent | React.MouseEvent) => void;
export type Path = 'dashboard' | 'results' | 'review' | 'admin' | 'scores' | 'stats' | 'quiz' | 'home' | 'generateuserkey' | 'profile' | 'setupcampaign';

export interface UserStats {
  totalQuizzes: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  streak: number;
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

export interface FormattedValue {
  toStr: string;
  toNum: number;
}

export interface GetFormattedCampaign {
  hash_: Hex;
  campaignName: string;
  totalLearners: number;
  fundsNative: FormattedValue;
  fundsERC20: FormattedValue;
  platform: FormattedValue;
  lastUpdated: string;
  totalPoints: {
    toStr: string;
    toNum: number;
  };
  operator: React.JSX.Element;
  token: React.JSX.Element;
  campaignSelector: React.JSX.Element;
  users: Address[];
}

export interface Admin {
  id: Address;
  active: boolean;
}

///////////////////////////// V3 ///////////////////////////////

export interface Campaign {
  creator: Address;
  identifier: Address;
}

export interface ReadData {
  dev: Address;
  feeTo: Address;
  creationFee: bigint;
  verifier: Address;
  approvalFactory: Address;
  campaigns: Campaign[];
}

export interface FilterTransactionReturnType {
  transactionData: TransactionData[];
  approvedFunctions: string[];
  contractAddresses: {
    stablecoin: string;
    ApprovalFactory: string;
    CampaignFactory: string;
    FeeManager: string;
    VerifierV2: string;
  };
}

export interface ProofOfAssimilation {
  questionSize: number;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  completedAt: Hex | string; // Time the quiz was completed
}

export interface ProofOfIntegration {
  link: string | Hex; // Can be any link to learner's portfolio e.g Githuh, figma etc
  submittedAt: number; 
  approvedAt: number; // Time the proof was approved
  score: number;
}


export interface Performance {
  value: number; 
  ratedAt: Hex | string;
}

export interface Learner {
  id: Address;
  ratings: Performance[];
  point: ProofOfIntegration;
  poass: ProofOfAssimilation[];
}
    
export interface ERC20Token {
  token: Address;
  tokenName: string;
  tokenSymbol: string;
  amount: bigint;
}

export interface Funds {
  erc20Ass: ERC20Token[];
  erc20Int: ERC20Token[];
  nativeAss: bigint; 
  nativeInt: bigint;
}

export interface EpochSetting {
  maxProof: number; // Max number of assimilation that builders can prove in a day
  endDate: number;
  funds: Funds;
}

export interface EpochSettingInput {
  maxProof: number; // Maximum assimilation learners can prove in a day
  endInHr: number; // When this is specified, the campaign's end date will be updated with the new value.
  tokens: Address[]; // Addresses of the tokens to use as funding token.
  newOperator: Address; // If specified, the operator address will be replaced. 
}


export interface EpochData {
  totalProofs: number;
  setting: EpochSetting;
  learners: Learner[];
}

export interface Metadata {
  hash_: Hex; // Keccack256 value of the campaign name with the 
  name: string; // Campaign name e.g Divvi
  link: string; // Any other relevant link e.g link to documentation
  description: string; // Max length is 300
  imageUrl: string;
  startDate: number;
  endDate: number;
}

export interface CreateCampaignInput {
  name: string; 
  link: string;
  description: string;
  imageUrl: string;
  endDateInHr: number;
}

export interface FormattedCampaignTemplate {
  contractAddress: Address;
  epochData: EpochData[];
  metadata: Metadata;
  verifier: Address,
  approvalFactory: Address;
  epoches: bigint;
  owner: Address;
  isPoassClaimed: boolean[]; // Array that shows whether a builder has claimed ERC20 reward for proof of assimilation for a specified epoch
  isPointClaimed: boolean[]; // Array that shows whether a builder has claimed ERC20 reward for proof of integration for a specified epoch
}

export type CampaignTemplateReadData = Omit<FormattedCampaignTemplate, 'contractAddress'>;

export const mockFilterTransactionData : FilterTransactionReturnType = {
  transactionData: [{
    contractAddress: zeroAddress,
    inputCount: 0,
    functionName: "",
    abi: [],
    requireArgUpdate: false
  }],
  approvedFunctions: [],
  contractAddresses: {
    stablecoin: zeroAddress,
    ApprovalFactory: zeroAddress,
    CampaignFactory: zeroAddress,
    FeeManager: zeroAddress,
    VerifierV2: zeroAddress
  }
}

export const mockLearners : Learner[] = ["https://github..com/bobeu", "https://github..com/oliseh", "https://github..com/jake"].map((link) => {
  return {
    id: zeroAddress,
    ratings: [{value: 0, ratedAt: stringToHex(new Date().toString())}],
    point: {link: stringToHex(link),  submittedAt: 0, approvedAt: 0, score: 0},
    poass: [{questionSize: 0, score: 0, totalPoints: 0, percentage: 0, timeSpent: 0, completedAt: stringToHex(new Date().toString())}]
  }
});

export const formattedMockLearners : Learner[] = mockLearners.map((m) => {
  return {
    id: m.id,
    poass: m.poass,
    ratings: m.ratings.map((r) => { return {value: r.value, ratedAt: hexToString(r.ratedAt as Hex)}}),
    point: { ...m.point, link: hexToString(m.point.link as Hex)}
  } 
})

export interface CampaignStateProps {
  id: number;
  link?: string;
  name: string;
  description: string;
  image: string;
  status: string;
  endDate: Date;
  fundingAmount: string;
  participants: number;
  __raw: FormattedCampaignTemplate;
}

export const mockCampaignTemplateReadData : FormattedCampaignTemplate = {
  contractAddress: zeroAddress,
  epochData: [{
    totalProofs: 0,
    setting: {
      maxProof: 0,
      endDate: 0,
      funds: {
        erc20Ass: [{
          token: zeroAddress,
          tokenName: stringToHex("Celo Dollar"),
          tokenSymbol: stringToHex("CUSD"),
          amount: 0n
        }],
        erc20Int: [{
          token: zeroAddress,
          tokenName: stringToHex("Celo Dollar"),
          tokenSymbol: stringToHex("CUSD"),
          amount: 0n
        }],
        nativeAss: 0n,
        nativeInt: 0n
      }
    },
    learners: mockLearners
  }],
  metadata: {
    hash_: `0x`,
    name: stringToHex("divvi"),
    link: stringToHex("https://docs.divvi.xyz"),
    description: stringToHex("Some description"),
    imageUrl: stringToHex("ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme-original.png"),
    startDate: 0,
    endDate: 0,
  },
  verifier: zeroAddress,
  approvalFactory: zeroAddress,
  epoches: 0n,
  owner: zeroAddress + '1' as Address,
  isPoassClaimed: [false],
  isPointClaimed: [false]
}

export const mockCampaigns : CampaignTemplateReadData[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => mockCampaignTemplateReadData);
export const mockCampaignState = {
  id: 0,
  name: 'Some name',
  description: 'Some description',
  image: 'Campaign image',
  status: 'Status',
  endDate: new Date(),
  fundingAmount: '0',
  participants: 0,
  __raw: mockCampaignTemplateReadData
}
