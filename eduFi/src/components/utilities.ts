import { formatEther, Hex,keccak256, stringToBytes, stringToHex, zeroAddress } from "viem";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import globalContractData from "../../contractsArtifacts/global.json";
import assert from "assert";
import { getFunctionData } from "../../functionData";
import { getDataSuffix as getDivviDataSuffix, submitReferral } from "@divvi/referral-sdk";
import { CAST_MESSAGES } from "~/lib/constants";
import _d_ from "../../_d_.json";
import { Address, Admin, Campaign, CampaignHash, CategoryType, DifficultyLevel, Eligibility, FilterTransactionDataProps, FormattedData, FunctionName, Profile, Question, Quiz, QuizData, QuizResultInput, ReadData, ReadProfile, StateData, TransactionData, WeekData, WeekProfileData } from "../../types/quiz";

export const TOTAL_WEIGHT = 100;

export const mockHash = keccak256(stringToBytes('solidity'), 'hex');
export const mockEncoded = stringToHex("solidity");
export const mockCampaign : Campaign = {
  users: [zeroAddress],
  data: {
    platformToken: 0n,
    fundsNative: 0n,
    fundsERC20: 0n,
    totalPoints: 0n, 
    lastUpdated: 0,
    activeLearners: 0n,
    operator: zeroAddress,
    token: zeroAddress,
    data: {
      hash_: mockHash,
      encoded: mockEncoded
    }
  }
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
  state: {
    minimumToken: 0n,
    weekId: 0n,
    transitionInterval: 0,
    transitionDate: 0
  },
  wd: mockWeekData,
  approved: mockCData,
  profileData: [mockWeekProfileData]
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
export function filterTransactionData({chainId, filter, functionNames = []}: FilterTransactionDataProps) {
  const { approvedFunctions, contractAddresses } = globalContractData;
  const transactionData : TransactionData[] = [];
  // const index = chainIds.indexOf(chainId || chainIds[1]);
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

/**
 * @dev Load and prepare data from the JSON API
 * @returns : Formatted data and categories
 */
export function load_d_({totalPoints, timePerQuestion}: {totalPoints: number, timePerQuestion: number}) : {categories: CategoryType[], quizData: Quiz[] | null} {
  const d : QuizData = { categories: _d_.categories, difficulties: _d_.difficulties, categoryData: _d_.categoryData } ;
  const categories : CategoryType[] = d.categories.split(',') as CategoryType[];
  const quizData : Quiz[] = [];

  // Loop through the categories
  d.categoryData.forEach(({category, levels, description}) => {
    // Loop through the levels
    levels.forEach(({questions, difficulty,}) => {
      const qs : Question[] = [];
      const questionSize = questions.length;
      assert(totalPoints >= questionSize, "Totalpoints is invalid");
      const points = totalPoints / questionSize;
      const timeLimit = Math.ceil(timePerQuestion * questionSize);

      // Run through the questions
      questions.forEach(({answer, options, hash, question, explanation}, id) => {
        const correctAnswer = 0;
        qs.push({
          id,
          question,
          options,
          hash: `0x${hash}`,
          correctAnswer: typeof answer === "number"? answer : options.indexOf(answer),
          difficulty: difficulty as DifficultyLevel,
          category,
          points,
          explanation:explanation === ""? `The answer to ${question} is ${options[correctAnswer]}` : explanation
        })
      });

      quizData.push(
        {
          category,
          description,
          difficulty: difficulty as DifficultyLevel,
          id: keccak256(stringToBytes(category)),
          createdAt: new Date(),
          questions:qs,
          title: category,
          totalPoints,
          imageUrl: `/assets/${category}-${difficulty}.png`,
          timeLimit
        }
      );

    });
  });
  return {
    quizData,
    categories
  };
}

// Encode multiple values in binary format
export function encodeUserData(campaignSlot: number): string {
  const buffer = Buffer.alloc(64);
  buffer.writeUInt8(campaignSlot, 0);        // 1 byte for action
  // console.log("'0x' + buffer.toString('hex')", "0x" + buffer.toString('hex'));
  return "0x" + buffer.toString('hex');
  
}

/**
 * @dev Search for a campaign with the corresponding weekId and campaign hash
 * @param weekData : Week data list i.e Data from the backend or blockchain data
 * @param requestedWkId : Week Id.
 * @param requestedHash : Requested campaign hash
 * @returns Found campaign
 */
export function filterWeekData(weekData: WeekData[], requestedWkId: number, requestedHash: Hex) {
  const wcp = weekData[requestedWkId] || mockWeekData; 
  const filteredCampaign = wcp?.campaigns?.filter(({data: { data: { hash_ } }}) => hash_.toLowerCase() === requestedHash.toLowerCase());
  const found = filteredCampaign?.[0] || mockCampaign;
  return {
    campaign: found,
    claimDeadline: toBN(wcp?.claimDeadline?.toString()).toNumber(),
    totalPoints: toBN(found?.data.totalPoints?.toString()).toNumber()
  }
}

export function formatData(stateData: StateData, weekData: WeekData[], requestedWkId: number, requestedHash: Hex): FormattedData {
  const [isVerified, isBlacklisted] = stateData.verificationStatus;
  const weekProfileData = stateData.weekProfileData;
  const filteredWPD = weekProfileData.filter(({weekId}) => toBN(weekId).toNumber() === requestedWkId);
  const wpd = filteredWPD?.[0] || mockWeekProfileData;
  const userCampaigns = wpd.campaigns.filter(({hash_, }) => hash_.toLowerCase() == requestedHash.toLowerCase());
  const userCampaign = userCampaigns?.[0] || mockReadProfile;
  const isClaimed = userCampaign.isClaimed;
  const eligibility = userCampaign.eligibility;
  const profileOther = userCampaign.profile.other;
  const profileQuizzes = userCampaign.profile.quizResults;
  const showVerificationButton = !isVerified && !isClaimed && eligibility.isEligible;
  const showWithdrawalButton = isVerified && eligibility.isEligible && !isClaimed && !isBlacklisted;
  const totalUserPointsForACampaign = profileQuizzes.reduce((total, quizResult) => total + quizResult.other.score, 0);
  const statData = filterWeekData(weekData, requestedWkId, requestedHash);

  return {
    statData,
    isClaimed,
    profile: profileOther,
    eligibility,
    profileQuizzes,
    requestedWeekId: BigInt(requestedWkId),
    showWithdrawalButton,
    showVerificationButton,
    totalPointsForACampaign: totalUserPointsForACampaign
  };
};

export const formatTime = (seconds: number) => {
  const secondsInNumber = toBN(seconds).toNumber();
  const mins = Math.floor(secondsInNumber / 60);
  const hrs = Math.floor(mins / 60);
  const secs = secondsInNumber % 60;
  return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};