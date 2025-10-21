/* eslint-disable */
import { formatEther, Hex,hexToString,keccak256, stringToBytes, stringToHex, zeroAddress } from "viem";
import BigNumber from "bignumber.js";
// @ts-ignore: Missing type declarations for 'ethers' in this environment
import { ethers } from "ethers";
import globalContractData from "../../contractsArtifacts/global.json";
import { getFunctionData } from "../../functionData";
import { getDataSuffix as getDivviDataSuffix, submitReferral } from "@divvi/referral-sdk";
import { Address, Admin, Campaign, CampaignTemplateReadData, FilterTransactionDataProps, FilterTransactionReturnType, FormattedCampaignTemplate, FunctionName, mockCampaigns, ProofOfAssimilation, ReadData, TransactionData } from "../../types";
import campaigntemplate from "../../contractsArtifacts/template.json";
import assert from "assert";
import { PinataSDK } from "pinata";

export type UserType = 'builder' | 'campaignOwner';
export interface BuildUserTransactionDataProps {
  userType?: UserType;
  chainId?: number;
  functionName: FunctionName;
  contractAddress?: Address;
  args: any[];
}

export interface TrxnData {
  contractAddress: Address;
  abi: any;
  functionName: FunctionName;
  args: any[];
}

export const mockHash = keccak256(stringToBytes('solidity'), 'hex');
export const mockEncoded = stringToHex("solidity");
export const mockCampaign : Campaign = {
  creator: zeroAddress,
  identifier: zeroAddress
}

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
  const { approvedFunctions, contractAddresses, chainIds } = globalContractData;
  const transactionData : TransactionData[] = [];
  let chainid = chainId || chainIds[0];
  const chainIndex = chainIds.indexOf(chainid);
  if(filter && functionNames.length > 0) {
    functionNames.forEach((functionName) => {
      transactionData.push(getFunctionData(functionName, chainIndex));
    })
  }
  
  return {
    transactionData,
    approvedFunctions,
    contractAddresses: contractAddresses[chainIndex],
  }
}

 // Normalize campaign data for UI
export const normalizeString = (val: string) => {
  if(!val) return '';
  return val.startsWith('0x') ? hexToString(val as Hex) : val;
};

export function normalizeImageSrc(val: string) {
  const normalized = normalizeString(val);
  const ipfsUri = normalized.replace('https://gateway.pinata.cloud/ipfs/', 'ipfs://');
  if(ipfsUri.startsWith('http://') || ipfsUri.startsWith('https://') || ipfsUri.startsWith('/')) return ipfsUri;
  if(!ipfsUri) return '/learna-image4.png';
  return '/learna-image4.png';
};

/**
 * @dev Accepts blockchain data and format to convert the encoded data to readable formats
 * @param arg : Data to format
 * @returns Formatted data
 */
export function formatCampaignsTemplateReadData(arg: CampaignTemplateReadData, contractAddress: Address) : FormattedCampaignTemplate {
  const { epochData, metadata: mt, ...rest } = arg;
  // console.log("formatCampaignsTemplateReadData", arg);
  return {
    contractAddress,
    epochData: epochData.map(({learners, setting, totalProofs}) => {
      return {
        totalProofs,
        setting: {
          endDate: setting.endDate,
          maxProof: setting.maxProof,
          funds: {
            nativeAss: setting.funds.nativeAss,
            nativeInt: setting.funds.nativeInt,
            erc20Ass: setting.funds.erc20Ass.map((erc20Ass) => ({
              tokenName: normalizeString(erc20Ass.tokenName as Hex),
              tokenSymbol: normalizeString(erc20Ass.tokenSymbol as Hex),
              amount:erc20Ass.amount,
              token:erc20Ass.token,
              decimals: erc20Ass.decimals
            })),
            erc20Int: setting.funds.erc20Ass.map((erc20Int) => ({
              ...erc20Int,
              tokenName: normalizeString(erc20Int.tokenName as Hex),
              tokenSymbol: normalizeString(erc20Int.tokenSymbol as Hex),
            })),
          }
        },
        learners: learners.map(({id, ratings, poass, point: { links, approvedAt, score, verified }}) => ({
          id,
          poass,
          ratings: ratings.map(({ratedAt, value}) => ({
            value,
            ratedAt: normalizeString(ratedAt as Hex)
          })),
          point: { approvedAt, score, verified, links: links.map(({ submittedAt, value }) => {
            return {
              value: normalizeString(value as Hex),
              submittedAt
            }
          })}
        }))
      }
    }),
    metadata: {
      hash_: mt.hash_,
      name: normalizeString(mt.name as Hex),
      link: normalizeString(mt.link as Hex),
      description: normalizeString(mt.description as Hex),
      imageUrl: normalizeImageSrc(mt.imageUrl as Hex),
      endDate: mt.endDate,
      startDate: mt.startDate,
    },
    ...rest,
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

export function buildTransactionData({functionName, chainId, contractAddress, args} : BuildUserTransactionDataProps) {
  const abi = campaigntemplate.abi.filter(({name}) => name === functionName);
  let trxnData : TrxnData = {contractAddress: zeroAddress, abi: [], functionName: '', args: []};
  if(functionName === 'createCampaign') {
    const { transactionData } = filterTransactionData({chainId, filter: true, functionNames: [functionName]});
    trxnData = { contractAddress: transactionData[0].contractAddress as Address, abi: transactionData[0].abi, args, functionName};
  } else {
    assert(contractAddress !== undefined, `Contract address not provided for ${functionName}`);
    trxnData = { contractAddress, args, functionName, abi: campaigntemplate.abi};
  }
  return trxnData;
}

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Environment variable validation
function validateEnvironmentVariables() {
  const requiredVars = {
    PINATA_JWT_SECRET: process.env.NEXT_PUBLIC_PINATA_JWT_SECRET_ACCESS_TOKEN,
    PINATA_GATEWAY: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return requiredVars as {
    PINATA_JWT_SECRET: string;
    PINATA_GATEWAY: string;
  };
}

// File validation function
function validateFile(file: File, fileName: string, fileType: string): void {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(fileType)) {
    throw new Error(`File type ${fileType} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`);
  }

  // Check file extension
  const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    throw new Error(`File extension ${fileExtension} is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  // Check if file is empty
  if (file.size === 0) {
    throw new Error('File cannot be empty');
  }
}

// Secure Pinata initialization with proper error handling
function initializePinata() {
  try {
    const envVars = validateEnvironmentVariables();
    
    return new PinataSDK({
      pinataJwt: envVars.PINATA_JWT_SECRET,
      pinataGateway: envVars.PINATA_GATEWAY,
    });
  } catch (error) {
    console.error('Failed to initialize Pinata:', error);
    throw new Error('Pinata initialization failed. Please check your environment configuration.');
  }
}

// Generate unique filename to prevent conflicts
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.substring(originalName.lastIndexOf('.'));
  return `${timestamp}_${randomString}${extension}`;
}

// Upload image to Pinata with comprehensive error handling and security
export async function uploadImageToPinata({
  file, 
  fileName, 
  fileType,
  campaignName
}: {
  file: File; 
  fileName: string; 
  fileType: string;
  campaignName: string
}): Promise<{ success: boolean; imageURI?: string; error?: string }> {
  try {
    // Validate input parameters
    if (!file) {
      throw new Error('File is required');
    }
    if (!fileName || fileName.trim() === '') {
      throw new Error('File name is required');
    }
    if (!fileType || fileType.trim() === '') {
      throw new Error('File type is required');
    }

    // Validate file
    validateFile(file, fileName, fileType);

    // Initialize Pinata with secure configuration
    const pinata = initializePinata();

    // Generate unique filename to prevent conflicts
    const uniqueFileName = generateUniqueFileName(fileName);

    // Create file with proper type
    const imageFile = new File([file], uniqueFileName, { type: fileType });

    // console.log("pinata", pinata);
    // Upload to Pinata using the correct API structure
    const response = await pinata.upload.public
    .file(imageFile)
    .name(campaignName);

    console.log("Response", response);
    // Verify upload was successful
    if (!response || !response.cid) {
      alert('Upload failed: No CID returned from Pinata');
      return {
        success: false,
        error: 'Upload failed: No CID returned from Pinata'
      };
    }

    // Get the public gateway URL
    const imageUrl = await pinata.gateways.public.convert(response.cid);
    
    return {
      success: true,
      imageURI: imageUrl
    };

  } catch (error) {
    console.error('Upload to Pinata failed:', error);
    
    // Return user-friendly error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during upload';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}