import { ContractTransactionResponse, ethers } from "ethers";
import { Hex, Address as ContractAddress, stringToBytes, bytesToHex, stringToHex } from "viem";
import type {
  PlatformToken as Platform, 
  LearnaV2 as Learn, 
  FeeManager as Fm,
  CampaignFactory as CmpFactory,
  ApprovalFactory as AppFactory,
  VerifierV2 as Vv2
} from "../typechain-types";

export type BigNumber = ethers.BigNumberish
export type AddressReturn = Promise<Address>;
export type Signer = ethers.Signer;
export type Addresses = Array<Address>;
export type Null = Promise<void>;
export type NullNoPromise = void;
export type Address = ContractAddress;
export type StrBigHex = string | BigNumber | Hex | bigint | number;
export type Signers = Promise<Signer[]>;

export interface SignersObj {
  deployer: Signer; 
  alc1: Signer; 
  alc2: Signer; 
  alc3: Signer; 
  signer1:Signer; 
  signer2:Signer; 
};

export interface Metadata {
  name: string;
  link: string;
  description: string;
  imageUrl: string;
  endDateInHr: number;
}

export type SignersArr = Signer[];

export type Learna = Learn & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type GrowToken = Platform & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type CampaignFactory = CmpFactory & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type FeeManager = Fm & {
  deploymentTransaction(): ContractTransactionResponse;
};
 
export type ApprovalFactory = AppFactory & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type Verifier = Vv2 & {
  deploymentTransaction(): ContractTransactionResponse;
};
 
export const NAME = 'Divvi';
export const LINK = 'https://divvi.xyz';
export const DESCRIPTION = "Welcome to the Divvi ecosystem quiz! The following articles will provide you with deep insights into the Divvi project, its mission to realign web3 incentives, and its powerful SDK. By reading the materials and successfully completing the quiz levels, you will gain a strong understanding of how Divvi empowers both builders and protocols. This knowledge will not only make you a more informed member of the web3 community but will also qualify you to earn token rewards based on your performance. Dive in, learn about the future of permissionless value creation, and get ready to test your knowledge!";
export const IMAGE_URI = "https://divvi.xyz/divvi-logo";
export const END_DATE = 24; // 24 hours

export const metadata : Metadata = {
  name: NAME,
  link: LINK,
  description: DESCRIPTION,
  imageUrl: IMAGE_URI,
  endDateInHr: END_DATE
}

export interface ProofOfAssimilation {
  questionSize: number;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
}

export const proofAssimilation :ProofOfAssimilation = {
  questionSize: 10,
  score: 80,
  totalPoints: 100,
  percentage: 80,
  timeSpent: 3,
  completedAt: stringToHex(new Date().toString())
} 
console.log("proofAssimilation", proofAssimilation);

export interface Performance {
  value: number;
  ratedAt: string;
}

export const performanceRating : Performance = {
  value: 8,
  ratedAt: bytesToHex(stringToBytes(new Date().toString()))
}