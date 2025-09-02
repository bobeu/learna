import { ethers } from "hardhat";
import type { Address, FeeManager,  GrowToken, Learna, Signer, Signers, CampaignFactory, ApprovalFactory } from "./types";
import { campaigns } from "./utils";
import { parseUnits } from "ethers";

enum Mode { LOCAL, LIVE }

/**
 * Deploys and return an instance of the FeeManager contract.
 * @param deployer : Deployer address
 * @returns Contract instance
 */
async function deployFeeManager(deployer: Signer, routeTo: Address) : Promise<FeeManager> {
  const LearnaContract = await ethers.getContractFactory("FeeManager");
  return (await LearnaContract.connect(deployer).deploy(routeTo)).waitForDeployment();
}

async function deployLearna(deployer: Signer, admin2: Address, feeManager: Address) : Promise<Learna> {
  const LearnaContract = await ethers.getContractFactory("LearnaV2"); // V2 
  const deployerAddr = await deployer.getAddress();
  return (await LearnaContract.connect(deployer).deploy([deployerAddr, admin2], 0, Mode.LOCAL, feeManager, campaigns)).waitForDeployment();
}

async function deployVerifier(deployer: Signer, identityVerificationHub: Address) : Promise<Learna> {
  const LearnaContract = await ethers.getContractFactory("VerifierV2"); // V2 
  return (await LearnaContract.connect(deployer).deploy(identityVerificationHub)).waitForDeployment();
}

async function deployCampaignFactory(deployer: Signer, dev: Address, createtionFee: bigint, approvalFactory: Address) : Promise<CampaignFactory> {
  const LearnaContract = await ethers.getContractFactory("CampaignFactory"); // V3
  return (await LearnaContract.connect(deployer).deploy(dev, createtionFee, approvalFactory)).waitForDeployment();
}

async function deployApprovalFactory(deployer: Signer) : Promise<ApprovalFactory> {
  const LearnaContract = await ethers.getContractFactory("ApprovalFactory"); // V3
  return (await LearnaContract.connect(deployer).deploy()).waitForDeployment();
}

/**
 * Deploys and return an instance of the GrowToken contract.
 * @param deployer : Deployer address
 * @param reserve : Reserve address to receive initial token allocation
 * @param learna : Learna contract address
 * @returns Contract instance
 */
async function deployGrowToken(reserve: Address, deployer: Signer) : Promise<GrowToken> {
  const token = await ethers.getContractFactory("PlatformToken"); // Token V2
  return (await token.connect(deployer).deploy(reserve, "GrowToken", "GROW")).waitForDeployment();
}

export async function deployContracts(getSigners_: () => Signers) {
  const [deployer, signer1, signer2, reserve, routeTo, admin2, claim, dev ] = await getSigners_();
  const deployerAddr = await deployer.getAddress() as Address;
  const reserveAddr = await reserve.getAddress() as Address;
  const signer1Addr = await signer1.getAddress() as Address;
  const signer2Addr = await signer2.getAddress() as Address;
  const routeToAddr = await routeTo.getAddress() as Address;
  const admin2Addr = await admin2.getAddress() as Address;
  const claimAddr = await claim.getAddress() as Address;
  const devAddr = await dev.getAddress() as Address;
  // const signers = [deployerAddr, reserveAddr, signer2Addr, signer1Addr] as Address[];
  const createtionFee = parseUnits('0.1', 18);

  const feeManager = await deployFeeManager(deployer, routeToAddr);
  const feeManagerAddr = await feeManager.getAddress() as Address;

  const learna = await deployLearna(deployer, admin2Addr, feeManagerAddr);
  const learnaAddr = await learna.getAddress() as Address;

  const Token = await deployGrowToken(reserveAddr, deployer);
  const GrowTokenAddr = await Token.getAddress() as Address;
  await Token.connect(deployer).setMain(learnaAddr);

  await learna.connect(deployer).setVerifierAddress(claimAddr);
  await learna.connect(deployer).setToken(GrowTokenAddr);

  const approvalFactory = await deployApprovalFactory(deployer);
  const approvalFactoryAddr = await approvalFactory.getAddress() as Address;

  const campaignFactory = await deployCampaignFactory(deployer, devAddr, createtionFee, approvalFactoryAddr);
  const campaignFactoryAddr = await campaignFactory.getAddress();

  const verifier = await deployVerifier(deployer, devAddr);
  const verifierAddr = await verifier.getAddress();

  await campaignFactory.connect(deployer).setApprovalFactory(approvalFactoryAddr);
  await campaignFactory.setFeeTo(feeManagerAddr);
  await campaignFactory.connect(deployer).setVerifier(verifierAddr);

  return {
    campaignFactoryAddr,
    campaignFactory,
    approvalFactory,
    approvalFactoryAddr,
    GrowToken: Token,
    GrowTokenAddr,
    feeManager,
    feeManagerAddr,
    learna,
    devAddr,
    dev,
    learnaAddr,
    signers: { deployer, signer1, signer2, admin2,admin2Addr, reserveAddr, reserve, deployerAddr, signer1Addr, signer2Addr }
  };
}