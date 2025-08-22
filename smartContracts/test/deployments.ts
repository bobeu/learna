import { ethers } from "hardhat";
import type { Address, FeeManager,  BrainToken, Learna, Signer, Signers } from "./types";
import { campaigns } from "./utils";

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

/**
 * Deploys and return an instance of the Learna contract.
 * @param deployer : Deployer address
 * @returns Contract instance
 */
async function deployLearna(deployer: Signer, admin2: Address, feeManager: Address) : Promise<Learna> {
  const LearnaContract = await ethers.getContractFactory("Learna");
  const deployerAddr = await deployer.getAddress();
  return (await LearnaContract.connect(deployer).deploy([deployerAddr, admin2], 0, Mode.LOCAL, feeManager, campaigns)).waitForDeployment();
}

/**
 * Deploys and return an instance of the BrainToken contract.
 * @param deployer : Deployer address
 * @param reserve : Reserve address to receive initial token allocation
 * @param learna : Learna contract address
 * @returns Contract instance
 */
async function deployBrainToken(reserve: Address, learna: Address, deployer: Signer) : Promise<BrainToken> {
  const Brain = await ethers.getContractFactory("BrainToken");
  return (await Brain.connect(deployer).deploy(reserve, learna, "BrainToken", "GROW")).waitForDeployment();
}

export async function deployContracts(getSigners_: () => Signers) {
  const [deployer, signer1, signer2, reserve, routeTo, admin2, claim ] = await getSigners_();
  const deployerAddr = await deployer.getAddress() as Address;
  const reserveAddr = await reserve.getAddress() as Address;
  const signer1Addr = await signer1.getAddress() as Address;
  const signer2Addr = await signer2.getAddress() as Address;
  const routeToAddr = await routeTo.getAddress() as Address;
  const admin2Addr = await admin2.getAddress() as Address;
  const claimAddr = await claim.getAddress() as Address;
  // const signers = [deployerAddr, reserveAddr, signer2Addr, signer1Addr] as Address[];

  const feeManager = await deployFeeManager(deployer, routeToAddr);
  const feeManagerAddr = await feeManager.getAddress() as Address;

  const learna = await deployLearna(deployer, admin2Addr, feeManagerAddr);
  const learnaAddr = await learna.getAddress() as Address;

  const Brain = await deployBrainToken(reserveAddr, learnaAddr, deployer);
  const BrainTokenAddr = await Brain.getAddress() as Address;

  await learna.connect(deployer).setClaimAddress(claimAddr);
  await learna.connect(deployer).setToken(BrainTokenAddr);

  return {
    BrainToken: Brain,
    BrainTokenAddr,
    feeManager,
    feeManagerAddr,
    learna,
    learnaAddr,
    signers: { deployer, signer1, signer2, admin2,admin2Addr, reserveAddr, reserve, deployerAddr, signer1Addr, signer2Addr }
  };
}