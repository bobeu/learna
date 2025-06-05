import { ethers } from "hardhat";
import type {
  Address, 
  FlexpoolFactory, 
  Providers, 
  RoleManager, 
  Signer, 
  Signers,
  SafeContract,
  SupportedAssetManager,
  BaseAsset,
  Points,
  SimpliToken,
  SafeFactory,
  Attorney,
  Reserve,
  TokenDistributor,
  Escape,
  Faucet,
  StateManager
} from "./types";

import { FEE, MAKER_RATE, QUORUM, UNIT_LIQUIDITY } from "./utilities";
import { expect } from "chai";

/**
 * Deploys and return an instance of the Escape contract.
 * @param deployer : Deployer address
 * @param ownershipManager : OwnerShip contract
 * @returns Contract instance
 */
async function deployEscape(ownershipManager: Address, deployer: Signer) : Promise<Escape> {
  const BankFactory = await ethers.getContractFactory("Escape");
  return (await BankFactory.connect(deployer).deploy(ownershipManager)).waitForDeployment();
}

/**
 * Deploys and return an instance of the Reserve contract.
 * @param deployer : Deployer address
 * @param ownershipManager : OwnerShip contract
 * @returns Contract instance
 */
async function deployReserve(ownershipManager: Address, deployer: Signer) : Promise<Reserve> {
  const BankFactory = await ethers.getContractFactory("Reserve");
  return (await BankFactory.connect(deployer).deploy(ownershipManager)).waitForDeployment();
}

/**
 * Deploys and return an instance of the Attorney contract.
 * @param deployer : Deployer address
 * @param fee : Attorney fee
 * @param feeTo : Fee receiver
 * @param ownershipManager : OwnerShip contract
 * @returns Contract instance
 */
async function deployAttorney(
  deployer: Signer,
  fee: bigint,
  feeTo: Address,
  ownershipManager: Address
) : Promise<Attorney> {
  const BankFactory = await ethers.getContractFactory("Attorney");
  return (await BankFactory.connect(deployer).deploy(fee, feeTo, ownershipManager)).waitForDeployment();
}

/**
 * Deploys and return an instance of the Token Distributor contract.
 * @param deployer : Deployer address
 * @param signers : List of Signers
 * @param quorum : Number of signers required to execute a transaction
 * @param ownershipManager : OwnerShip contract
 * @returns Contract instance
 */
async function deployTokenDistributor(
  deployer: Signer,
  ownershipManager: Address,
  signers: Address[],
  quorum: number,
) : Promise<TokenDistributor> {
  const BankFactory = await ethers.getContractFactory("TokenDistributor");
  return (await BankFactory.connect(deployer).deploy(ownershipManager, signers, quorum)).waitForDeployment();
}

/**
 * Deploys and return an instance of the Asset contract
 * @param deployer : Deployer address
 * @returns Contract instance
*/
async function deployFaucet(
  deployer: Signer,
  roleManager: Address, 
  collateralToken: Address,
  baseToken: Address,
  baseTokenAmount: bigint,
  colTokenAmount: bigint
) :Promise<Faucet> {
  const AssetMgr = await ethers.getContractFactory("Faucet");
  return (await AssetMgr.connect(deployer).deploy(roleManager, collateralToken, baseToken, baseTokenAmount, colTokenAmount)).waitForDeployment();
}

/**
 * Deploys and return an instance of the Asset contract
 * @param deployer : Deployer address
 * @returns Contract instance
*/
async function deployCollateralAsset(
  deployer: Signer,
  attorney: Address,
  reserve: Address,
  tokenDistributor: Address,
  roleManager: Address, 
) :Promise<SimpliToken> {
  const AssetMgr = await ethers.getContractFactory("SimpliToken");
  return (await AssetMgr.connect(deployer).deploy(attorney, reserve, tokenDistributor, roleManager)).waitForDeployment();
}


/**
 * Deploys and return an instance of the Safe Factory contract
 * @param deployer : Deployer address
 * @returns : Contract instance
 */
export async function deploySafeFactory(deployer: Signer, roleManager: Address, feeTo: Address, multiSig: Address) : Promise<SafeFactory> {
  const OwnershipManager = await ethers.getContractFactory("SafeFactory");
  return (await OwnershipManager.connect(deployer).deploy(roleManager, feeTo, multiSig)).waitForDeployment();
}

/**
 * Deploys and return an instance of the RoleManager contract
 * @param deployer : Deployer address
 * @returns : Contract instance
 */
export async function deployRoleManager(deployer: Signer) : Promise<RoleManager> {
  const OwnershipManager = await ethers.getContractFactory("RoleManager");
  return (await OwnershipManager.connect(deployer).deploy()).waitForDeployment();
}

/**
 * Deploys and return an instance of the Point contract
 * @param deployer : Deployer address
 * @returns : Contract instance
 */
export async function deployPointsContract(deployer: Signer, roleManager: Address) : Promise<Points> {
  const OwnershipManager = await ethers.getContractFactory("Points");
  return (await OwnershipManager.connect(deployer).deploy(roleManager)).waitForDeployment();
}

/**
 * Deploys and return an instance of the Providers contract.
 * @param deployer : Deployer address
 * @param flexpoolFactory : Flexpool factory contract
 * @param roleManager: Role manager contract
 * @param baseAsset : Base asset contract
 * @param supportedAssetMgr : Supported manager contract
 * @returns Contract instance
 */
export async function deployProvider(flexpoolFactory: Address, roleManager: Address, stateManagerAddr: Address, deployer: Signer) : Promise<Providers> {
  const BankFactory = await ethers.getContractFactory("Providers");
  return (await BankFactory.connect(deployer).deploy(stateManagerAddr, flexpoolFactory, roleManager, 0)).waitForDeployment();
}

/**
  * Deploys and return an instance of the SupportedAssetManager contract
  * @param collateralAsset : Collateral asset ciontract
  * @param roleManager : Role manager contract
  * @param deployer : Deployer address
  * @returns Contract instance
 */

export async function deploySupportedAssetManager(collateralAsset: Address, roleManager: Address, deployer: Signer) :Promise<SupportedAssetManager> {
  const AssetMgr = await ethers.getContractFactory("SupportedAssetManager");
  return (await AssetMgr.connect(deployer).deploy(
    [
      {asset: collateralAsset, isWrappedAsset: false}
    ], 
    roleManager, 
  )).waitForDeployment();
}

/**
 * Deploys and return an address instance of the Base Asset contract
 * @param deployer : Deployer address
 * @returns Contract address
 */
export async function deployBaseAsset(deployer: Signer): Promise<BaseAsset> {
  const testAsset = await ethers.getContractFactory("BaseAsset");
  return (await testAsset.connect(deployer).deploy()).waitForDeployment();
}

/**
 * Deploy an instance of the FlexpoolFactory contract
 * @param deployer : Deployer.
 * @param feeTo : Fee receiver.
 * @param makerRate : Platform fee
 * @param roleManager : Role manager contract
 * @param assetManager : Supported asset manager
 * @param baseAsset : Base asset contract
 * @param pointFactory : Point factory contract
 * @returns Contract instance.
*/

export async function deployStateManager(
  deployer: Signer,
  feeTo:Address, 
  makerRate: number,
  roleManager:Address,
  assetManager:Address, 
  baseAsset:Address,
  pointFactory: Address
) : Promise<StateManager> {
  const Factory = await ethers.getContractFactory("StateManager");
  return (await Factory.connect(deployer).deploy(
    feeTo,
    makerRate,
    roleManager,
    assetManager,
    baseAsset,
    pointFactory
  )).waitForDeployment();
}

/**
 * Deploy an instance of the FlexpoolFactory contract
 * @param deployer : Deployer.
 * @param feeTo : Fee receiver.
 * @param makerRate : Platform fee
 * @param diaOracleAddress : DiaOracle Address
 * @param roleManager : Role manager contract
 * @param assetManager : Supported asset manager
 * @param baseAsset : Base asset contract
 * @param pointFactory : Point factory contract
 * @returns Contract instance.
*/

export async function deployFlexpool(
  deployer: Signer,
  roleManager: Address, 
  stateManager: Address,
  safeFactory: Address
) : Promise<FlexpoolFactory> {
  const Factory = await ethers.getContractFactory("HardhatBased");
  return (await Factory.connect(deployer).deploy(
    roleManager,
    stateManager,
    safeFactory
  )).waitForDeployment();
}

export async function retrieveSafeContract(safeAddress: Address) : Promise<SafeContract> {
  return ethers.getContractAt('Safe', safeAddress);
}

export async function deployContracts(getSigners_: () => Signers) {
  const [deployer, alc1, alc2, feeTo, signer1, signer2, signer3, extra ] = await getSigners_();
  const deployerAddr = await deployer.getAddress() as Address;
  const extraAddr = await extra.getAddress() as Address;
  const signer3Addr = await signer3.getAddress() as Address;
  const signer1Addr = await signer1.getAddress() as Address;
  const feeToAddr = await feeTo.getAddress() as Address;
  const alc1Addr = await alc1.getAddress() as Address;
  const alc2Addr = await alc2.getAddress() as Address;
  const signer2Addr = await signer2.getAddress() as Address
  const signers = [deployerAddr, extraAddr, signer3Addr, signer1Addr] as Address[];
  // const INITIAL_MINT = parseEther('200000');

  const roleManager = await deployRoleManager(deployer);
  const roleManagerAddr = await roleManager.getAddress() as Address;

  const attorney = await deployAttorney(deployer, FEE, feeToAddr as Address, roleManagerAddr);
  const attorneyAddr = await attorney.getAddress() as Address;
 
  const reserve = await deployReserve(roleManagerAddr, deployer);
  const reserveAddr = await reserve.getAddress() as Address;

  const distributor = await deployTokenDistributor(deployer, roleManagerAddr, signers, QUORUM-1);
  const distributorAddr = await distributor.getAddress() as Address;

  const escape = await deployEscape(roleManagerAddr, deployer);
  const escapeAddr = await escape.getAddress() as Address;
  
  const safeFactory = await deploySafeFactory(deployer, roleManagerAddr, feeToAddr, distributorAddr);
  const safeFactoryAddr = await safeFactory.getAddress() as Address;

  const baseAsset = await deployBaseAsset(deployer);
  const baseAssetAddr = await baseAsset.getAddress() as Address;

  const collateralAsset = await deployCollateralAsset(deployer, attorneyAddr, reserveAddr, distributorAddr, roleManagerAddr);
  const collateralAssetAddr = await collateralAsset.getAddress() as Address;
 
  const points = await deployPointsContract(deployer, roleManagerAddr);
  const pointsAddr = await points.getAddress() as Address;
  
  const supportedAssetMgr = await deploySupportedAssetManager(collateralAssetAddr, roleManagerAddr, deployer);
  const supportedAssetMgrAddr = await supportedAssetMgr.getAddress() as Address;
  
  const stateManager = await deployStateManager(deployer, feeToAddr as Address, MAKER_RATE, roleManagerAddr, supportedAssetMgrAddr, baseAssetAddr, pointsAddr);
  const stateManagerAddr = await stateManager.getAddress() as Address;

  const flexpool = await deployFlexpool(deployer, roleManagerAddr, stateManagerAddr, safeFactoryAddr);
  const flexpoolAddr = await flexpool.getAddress() as Address;
  
  const faucet = await deployFaucet(deployer, roleManagerAddr, collateralAssetAddr, baseAssetAddr, UNIT_LIQUIDITY, UNIT_LIQUIDITY * 2n);
  const faucetAddr = await faucet.getAddress() as Address;

  const providers = await deployProvider(flexpoolAddr, roleManagerAddr, stateManagerAddr, deployer);
  const providersAddr = await providers.getAddress() as Address;
  
  await safeFactory.connect(deployer).setProviderContract(providersAddr);
  await roleManager.connect(deployer).setRole([flexpoolAddr, providersAddr, supportedAssetMgrAddr, deployerAddr, stateManagerAddr]);
  const isSupported = await supportedAssetMgr.isSupportedAsset(collateralAssetAddr);
  const isListed = await supportedAssetMgr.listed(collateralAssetAddr);
  // await distributor.connect(deployer).setToken(collateralAssetAddr);
  await attorney.connect(deployer).setToken(collateralAssetAddr);

  // const request = await proposeTransaction({signer: deployer, contract: distributor, amount: INITIAL_MINT, delayInHrs: 0, recipient: deployerAddr as Address, trxType: TrxnType.ERC20});
  // await signTransaction({signer: signer3, contract: distributor, requestId: request.id});
  // await executeTransaction({contract: distributor, reqId: request.id, signer: extra});

  expect(isListed).to.be.true;
  expect(isSupported).to.be.true;

  return {
    // INITIAL_MINT,
    flexpool,
    flexpoolAddr,
    pointsAddr,
    points,
    providers,
    providersAddr,
    collateralAsset,
    collateralAssetAddr,
    baseAsset,
    baseAssetAddr,
    distributor,
    reserve,
    distributorAddr,
    reserveAddr,
    escape,
    faucet,
    faucetAddr,
    escapeAddr,
    attorney,
    attorneyAddr,
    signers_distributor: signers,
    signers: { deployer, alc1, alc2, feeTo, signer1, signer2, signer3, extra, deployerAddr, alc1Addr, alc2Addr, feeToAddr, signer1Addr, signer2Addr, signer3Addr, extraAddr }
  };
}