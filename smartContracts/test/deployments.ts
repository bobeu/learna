import { ethers } from "hardhat";
import type { Address,  GrowToken, Learna, Signer, Signers } from "./types";
import { zeroAddress } from "viem";

/**
 * Deploys and return an instance of the Escape contract.
 * @param deployer : Deployer address
 * @returns Contract instance
 */
async function deployLearna(deployer: Signer) : Promise<Learna> {
  const LearnaContract = await ethers.getContractFactory("Learna");
  const deployerAddr = await deployer.getAddress();
  return (await LearnaContract.connect(deployer).deploy([deployerAddr], 0)).waitForDeployment();
}

/**
 * Deploys and return an instance of the Reserve contract.
 * @param deployer : Deployer address
 * @param reserve : Reserve address to receive initial token allocation
 * @param learna : Learna contract address
 * @returns Contract instance
 */
async function deployGrowToken(reserve: Address, learna: Address, deployer: Signer) : Promise<GrowToken> {
  const GrowToken = await ethers.getContractFactory("GrowToken");
  return (await GrowToken.connect(deployer).deploy(reserve, learna)).waitForDeployment();
}

export async function deployContracts(getSigners_: () => Signers) {
  const [deployer, signer1, signer2, reserve ] = await getSigners_();
  const deployerAddr = await deployer.getAddress() as Address;
  const reserveAddr = await reserve.getAddress() as Address;
  const signer1Addr = await signer1.getAddress() as Address;
  const signer2Addr = await signer2.getAddress() as Address;
  // const signers = [deployerAddr, reserveAddr, signer2Addr, signer1Addr] as Address[];

  const learna = await deployLearna(deployer);
  const learnaAddr = await learna.getAddress() as Address;

  const growToken = await deployGrowToken(reserveAddr, learnaAddr, deployer);
  const growTokenAddr = await growToken.getAddress() as Address;

  return {
    growToken,
    growTokenAddr,
    learna,
    learnaAddr,
    signers: { deployer, signer1, signer2, reserveAddr, reserve, deployerAddr, signer1Addr, signer2Addr }
  };
}