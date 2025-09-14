import { formatEther, Hex,hexToString,keccak256, stringToBytes, stringToHex, zeroAddress } from "viem";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import globalContractData from "../../contractsArtifacts/global.json";
import assert from "assert";
import { getFunctionData } from "../../functionData";
import { getDataSuffix as getDivviDataSuffix, submitReferral } from "@divvi/referral-sdk";
import { CAST_MESSAGES } from "@/lib/constants";
import _d_ from "../../_d_.json";
import { Address, Admin, Campaign, CampaignHash, CampaignTemplateReadData, Eligibility, FilterTransactionDataProps, FilterTransactionReturnType, FormattedCampaignTemplate, FormattedData, FunctionName, mockCampaigns, Profile, ProofOfAssimilation, Question, Quiz, QuizData, QuizResultInput, ReadData, ReadProfile, StateData, TransactionData, WeekData, WeekProfileData } from "../../types";

export const TOTAL_WEIGHT = 100;

export const mockHash = keccak256(stringToBytes('solidity'), 'hex');
export const mockEncoded = stringToHex("solidity");
export const mockCampaign : Campaign = {
  creator: zeroAddress,
  identifier: zeroAddress
}

export const mockCData : CampaignHash[] = [
  {
    encoded:  mockEncoded,
    hash_: mockHash,
  }
];

export const mockProfile : Profile = {
  other: {
    passkey: "0x",
    haskey: false,
    totalQuizPerWeek: 0,
    amountMinted: 0n
  },
  quizResults: [
    {
      answers: [
        {
          isUserSelected: false,
          questionHash: '',
          selected: 0
        }
      ],
      other: {
        completedAt: '',
        id: '1',
        title: 'solidity',
        percentage: 0,
        quizId: '2',
        score: 0,
        timeSpent: 0,
        totalPoints: 0
      }
    }
  ]
}

export const mockEligibility : Eligibility = {
  isEligible: false,
  erc20Amount: 0n,
  nativeAmount: 0n,
  weekId: 0n,
  token: zeroAddress,
  hash_: mockHash,
  platform: 0n
}

export const mockReadProfile : ReadProfile = {
  eligibility: mockEligibility,
  hash_: mockHash,
  profile: mockProfile,
  isClaimed: false
}

export const mockWeekProfileData : WeekProfileData = {
  campaigns: [mockReadProfile],
  weekId: 0n
}

export const mockWeekData : WeekData[] = [{campaigns: [mockCampaign,], claimDeadline: 0n, weekId: 0n}];
export const mockReadData : ReadData = {
  approvalFactory: zeroAddress,
  creationFee: 0n,
  dev: zeroAddress,
  verifier: zeroAddress,
  feeTo: zeroAddress,
  campaigns: [{
    creator: zeroAddress,
    identifier: zeroAddress
  }]
}

export const mockAdmins : Admin = {
  id: zeroAddress,
  active: false
}

export const toHash = (arg: string) => {
  return keccak256(stringToHex(arg));
}

export const mockQuiz : Quiz = {
  id: "",
  title: "",
  description: "",
  questions: [
    {
      category: '',
      correctAnswer: 0,
      difficulty: '',
      hash: mockReadProfile.hash_,
      id: 0,
      options: [''],
      points: 0,
      question: '',
      explanation: ''
    }
  ],
  totalPoints: 0,
  timeLimit: 0,
  difficulty: 'easy',
  category: "",
  imageUrl: "",
  createdAt: new Date()
}

export const mockQuizResult : QuizResultInput = {
  answers: [
    {
      isUserSelected: false,
      questionHash: mockReadProfile.hash_,
      selected: 0
    }
  ],
  other: {
    quizId: "",
    score: 0,
    title: '',
    totalPoints: 0,
    percentage: 0,
    timeSpent: 0,
    completedAt: new Date().toString(),
  }
}

/**
 * @dev Converts an argument to a bigInt value
 * @param arg : Argument to convert;
 * @returns BigInt
*/
export const toBigInt = (x: string | number | ethers.BigNumberish | bigint | undefined) : bigint => {
  if(!x) return 0n;
  return BigInt(toBN(x).toString());
} 

/**
 * @dev Converts onchain timestamp to a date object
 * @param arg : onchain time in seconds;
 * @returns Date string object
*/
export function getTimeFromEpoch(onchainUnixTime: number | bigint) {
  const toNumber = toBN(onchainUnixTime.toString()).toNumber()
  const date = new Date(toNumber * 1000);
  return (toNumber === 0? 'Not Set' : `${date.toLocaleDateString("en-GB")} ${date.toLocaleTimeString("en-US")}`);
}


/**
 * @dev Converts an argument to a Big Number value
 * @param arg : Argument to convert;
 * @returns BigNumber
*/
export const toBN = (x: string | number | BigNumber | bigint | Hex) => {
  return new BigNumber(x);
}

// consumer is your Divvi Identifier
// providers are the addresses of the Rewards Campaigns that you signed up for on the previous page
export function getDivviReferralUtilities() {
  const getDataSuffix = () => {
    const consumer = process.env.NEXT_PUBLIC_DIVVI_IDENTIFIER as Address;
    const campaign1 = process.env.NEXT_PUBLIC_CAMPAIGN_1 as string;
    const campaign2 = process.env.NEXT_PUBLIC_CAMPAIGN_2 as string;
    const providers = Array.from([campaign1, campaign2]) as Address[];
    return getDivviDataSuffix({
      consumer,
      providers,
    }) as Address;
  }
  const submitReferralData = async(txHash:`0x${string}`, chainId: number) => {
    return await submitReferral({
      txHash,
      chainId,
    })
  }
  return {
    getDataSuffix,
    submitReferralData
  }
}

/**
 * Converts value of their string representation.
 * @param value : Value to convert.
 * @returns Formatted value.
 */
export const formatValue = (arg: string | number | ethers.BigNumberish | bigint | undefined) => {
  if(typeof arg === 'bigint') {
    const valueInBigNumber = toBN(formatEther(arg)).decimalPlaces(4);
    return {
      toStr: valueInBigNumber.toString(),
      toNum: valueInBigNumber.toNumber()
   };
  }
    
  const valueInBigNumber = toBN(formatEther(toBigInt(arg))).decimalPlaces(4)
  return {
    toStr: valueInBigNumber.toString(),
    toNum: valueInBigNumber.toNumber()
  }
}

/**
 * @dev Accept an array of string. The result is the hashed version of each content in the data object
 * @param data : An Array of string to hash
 * @returns Hashed values
*/
export function getCampaignHashes(data: string[]) {
  const result : Hex[] = [];
  data.forEach((item) => {
    const hash = keccak256(stringToBytes(item));
    result.push(hash);
  })
  return result;
}
  
/**
 * @dev Converts a string to a hexadecimal representation. If no parameter was parsed, the default return 
 * value is a hex with length 42 compatible with an Ethereum address type padded with zero value.
 * @param x : string or undefined;
 * @returns Address
 */
export const formatAddr = (x: string | undefined) : Address => {
    if(!x || x === "") return `0x${'0'.repeat(40)}`;
    return `0x${x.substring(2, x.length)}`;
};

/**
 * @dev Filter transaction data such as abis, contract addresses, inputs etc. If the filter parameter is true, it creates transaction data for 
 * the parsed function names. Default to false.
 * @param param0 : Parameters
 * @returns object containing array of transaction data and approved functions
 */
export function filterTransactionData({chainId, filter, functionNames = []}: FilterTransactionDataProps) : FilterTransactionReturnType {
  const { approvedFunctions, contractAddresses } = globalContractData;
  const transactionData : TransactionData[] = [];
  if(filter) {
    functionNames.forEach((functionName) => {
      transactionData.push(getFunctionData(functionName, chainId));
    })
  }
  return {
    transactionData,
    approvedFunctions,
    contractAddresses: contractAddresses[0],
  }
}

/**
 * @dev Fetch and format cast messages or text
 * @param task : This is the function name that was performed
 * @param weekId : WeekId, perhaps the current week
 * @returns 
 */
export function getCastText(task: FunctionName, weekId: number) {
  const filtered = CAST_MESSAGES.filter(({key}) => key === task);
  return filtered?.[0]?.handler(weekId) || '';
}

 // Normalize campaign data for UI
export const normalizeString = (val: string) => {
  if(!val) return '';
  return val.startsWith('0x') ? hexToString(val as Hex) : val;
};

export function normalizeImageSrc(val: string) {
  const s = normalizeString(val);
  if(!s) return '/learna-image4.png';
  if(s.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${s.replace('ipfs://','')}`;
  }
  if(s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s;
  return '/learna-image4.png';
};

/**
 * @dev Accepts blockchain data and format to convert the encoded data to readable formats
 * @param arg : Data to format
 * @returns Formatted data
 */
export function formatCampaignsTemplateReadData(arg: CampaignTemplateReadData, contractAddress: Address) : FormattedCampaignTemplate {
  const { epochData, metadata: mt, ...rest } = arg;
  return {
    contractAddress,
    epochData: epochData.map(({learners, setting, totalProofs}) => {
      return {
        totalProofs,
        setting: {
          ...setting,
          funds: {
            nativeAss: setting.funds.nativeAss,
            nativeInt: setting.funds.nativeInt,
            erc20Ass: setting.funds.erc20Ass.map((erc20Ass) => ({
              tokenName: normalizeString(erc20Ass.tokenName as Hex),
              tokenSymbol: normalizeString(erc20Ass.tokenSymbol as Hex),
              amount:erc20Ass.amount,
              token:erc20Ass.token  
            })),
            erc20Int: setting.funds.erc20Ass.map((erc20Int) => ({
              ...erc20Int,
              tokenName: normalizeString(erc20Int.tokenName as Hex),
              tokenSymbol: normalizeString(erc20Int.tokenSymbol as Hex),
            })),
          }
        },
        learners: learners.map(({id, ratings, poass, point: { link,approvedAt, score, submittedAt }}) => ({
          id,
          poass,
          ratings: ratings.map(({ratedAt, value}) => ({
            value,
            ratedAt: normalizeString(ratedAt as Hex)
          })),
          point: { approvedAt, score, submittedAt, link: normalizeString(link as Hex)}
        }))
      }
    }),
    metadata: {
      hash_: mt.hash_,
      name: normalizeString(mt.name as Hex),
      link: normalizeString(mt.link as Hex),
      description: normalizeString(mt.description as Hex),
      imageUrl: normalizeImageSrc(mt.imageUrl as Hex),
      endDate: mt.endDate
    },
    ...rest
  }
}

export const formattedMockCampaignsTemplate = mockCampaigns.map((campaign) => formatCampaignsTemplateReadData(campaign, zeroAddress));

export const formatTime = (seconds: number) => {
  const secondsInNumber = toBN(seconds).toNumber();
  const mins = Math.floor(secondsInNumber / 60);
  const hrs = Math.floor(mins / 60);
  const secs = secondsInNumber % 60;
  return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const calculateStreak = (results: ProofOfAssimilation[]): number => {
  // Simple streak calculation - consecutive quizzes with 70%+ score
  let streak = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].percentage >= 70) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

