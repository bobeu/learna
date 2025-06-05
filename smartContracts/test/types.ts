import { ContractTransactionResponse, ethers } from "ethers";
import { Hex, Address as ContractAddress } from "viem";
import type { 
  Points as Point, 
  RoleManager as RoleMgr, 
  HardhatBased as Flex, 
  Providers as ProviderContract, 
  SimpliToken as Collateral, 
  BaseAsset as Base,
  SupportedAssetManager as SupportedAssetMgr,
  SafeFactory as SafeFactry,
  Safe,
  StateManager as State,
  Faucet as Fct,
  Reserve as Rsv,
  Escape as Esc,
  TokenDistributor as Tkd,
  Attorney as Attn
} from "../typechain-types";
import { Common } from "../typechain-types/contracts/standalone/celo/FlexpoolFactory";
import { Common as CMon, } from "../typechain-types/contracts/peripherals/Contributor";

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
  routeTo: Signer; 
  feeTo: Signer; 
  signer1:Signer; 
  signer2:Signer; 
  signer3:Signer; 
  devAddr:Signer;
};

export type SignersArr = Signer[];

export interface CreateRouterParam {
  quorum: number;
  durationInHours : number; 
  colCoverageRatio: number;
  amount: bigint;
  asset: Address;
  participants: Addresses;
  contract: FlexpoolFactory;
  creator: Signer;
}

export interface FunctionParam {
  unit: bigint; 
  from: Signer;
  factory: FlexpoolFactory;
  account?: Address;
}

export interface Liquidation {
  position : number;
  target: Address;
  expectedRepaymentTime: number;
  debt: BigNumber;
  colBalInToken: BigNumber;
}

export interface PermissionLessBandParam {
  intRate: number;
  quorum : number;
  colCoverage: number;
  deployer: Signer;
  durationInHours: number;
  unitLiquidity: bigint;
  asset: BaseAsset;
  factory: FlexpoolFactory;
  signer: Signer;
  collateralToken: SimpliToken;
}

export interface RemoveLiquidityParam {
  factory: FlexpoolFactory;
  signer: Signer;
  unit: bigint;
}

export interface PermissionedBandParam {
  factory: FlexpoolFactory;
  signer: Signer;
  deployer: Signer;
  intRate: number;
  durationInHours: number;
  colCoverage: number;
  unitLiquidity: bigint;
  asset: BaseAsset;
  contributors: Signer[];
  collateralToken: SimpliToken;
}

export interface BandParam {
  unit: bigint;
  factory: FlexpoolFactory;
  signers: Signer[];
}

export interface SetVariableParam {
  factory: FlexpoolFactory;
  signer: Signer;
  feeTo: Address;
  assetMgr: Address;
  makerRate: number;
  creationFee: bigint;
}

export interface Balances {
  collateral: bigint;
  base: bigint;
}

export interface Contributor {
  paybackTime: number;
  turnStartTime: number;
  getFinanceTime: number;
  loan: bigint;
  colBals: bigint;
  id: Address;
  sentQuota: boolean;
}

export interface FactoryTxReturn {
  pool: CMon.ReadPoolDataReturnValueStructOutput;
  balances?: Balances;
  profile: CMon.ContributorStructOutput;
  slot: Common.SlotStructOutput;
}

export interface FundAccountParam {
  asset: BaseAsset | SimpliToken;
  testAssetAddr?: Address;
  recipients: Address[];
  sender: Signer;
  amount: bigint;
}

export interface TransferParam {
  asset: BaseAsset | SimpliToken;
  recipients: Address[];
  amount: bigint;
  sender: Signer;
}

export interface JoinABandParam {
  testAsset: BaseAsset;
  factory: FlexpoolFactory;
  factoryAddr: Address;
  signers: SignersArr;
  deployer: Signer;
  unit: bigint;
  // contribution: bigint;
  collateral: SimpliToken;
  // unitId: bigint;
}

export interface LiquidateParam extends BandParam {
  debt?: bigint;
  asset: BaseAsset;
  deployer: Signer;
  collateral: SimpliToken;
  pool?: Common.PoolStructOutput;
}

export interface GetFinanceParam extends BandParam {
  colQuote: bigint;
  asset: BaseAsset; 
  collateral: SimpliToken;
  deployer: Signer;
}

export interface PaybackParam extends LiquidateParam {
  asset: BaseAsset;
  collateral: SimpliToken;
}

export interface GetPaidParam {
  factory: FlexpoolFactory;
  signers: SignersArr;
  unit: bigint;
  runPayback: boolean;
  tcUSD: BaseAsset;
  signerAddrs: Addresses;
  strategies: Addresses;
  trusteeAddr: Address;
}

export interface ProvideLiquidityArg extends RemoveLiquidityArg {
  contractAddr: Address;
  rate: number;
  deployer: Signer;
  amount: bigint;
  asset: BaseAsset;
}

export interface BorrowArg extends RemoveLiquidityArg {
  amount: bigint;
  providersSlots: bigint[];
  flexpool: FlexpoolFactory;
}

export type RemoveLiquidityArg = {
  contract: Providers;
  signer: Signer;
  signerAddr: Address;
}

export type FlexpoolFactory = Flex & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type SupportedAssetManager = SupportedAssetMgr & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type RoleManager = RoleMgr & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type Points = Point & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type Providers = ProviderContract & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type SimpliToken = Collateral & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type BaseAsset = Base & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type SafeContract = Safe & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type SafeFactory = SafeFactry & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type TokenDistributor = Tkd & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type Escape = Esc & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type Reserve = Rsv & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type Attorney = Attn & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type Faucet = Fct & {
  deploymentTransaction(): ContractTransactionResponse;
};

export type StateManager = State & {
  deploymentTransaction(): ContractTransactionResponse;
};
