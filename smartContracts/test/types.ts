import { ContractTransactionResponse, ethers } from "ethers";
import { Hex, Address as ContractAddress } from "viem";
import type { KnowToken as Grow, Learna as Learn, FeeManager as Fm} from "../typechain-types";

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

export type SignersArr = Signer[];

export type Learna = Learn & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type KnowToken = Grow & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type FeeManager = Fm & {
  deploymentTransaction(): ContractTransactionResponse;
};
 
// export type Claim = clm & {
//   deploymentTransaction(): ContractTransactionResponse;
// };
 