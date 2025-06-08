import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { claimWeeklyReward, registerUsersForWeeklyEarning, sendTip, sortWeeklyEarning } from "../utils";
import { parseEther } from "viem";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Claim reward", function () {
    it("Users should be able to claim reward from weekly payout", async function () {
      const { learna, growToken, signers : { deployer, deployerAddr, signer1, signer1Addr },} = await loadFixture(deployContractsFixcture);
      const amountInERC20 = parseEther('10000');
      const tipAmount = parseEther('55');
      const { weekCounter: weekId } = await learna.getData();
      await registerUsersForWeeklyEarning({
        deployer,
        learna,
        user: signer1Addr,
        weekId,
      });
      await sendTip({learna, signer: signer1, tipAmount});
      await sortWeeklyEarning({amountInERC20, deployer, growToken, learna, owner:deployerAddr});
      const { 
        erc20balanceInLearnaAfterClaim,
        erc20balanceInLearnaB4Claim,
        erc20balanceOfSignerAfterClaim,
        erc20balanceOfSignerB4Claim,
        nativeBalOfSignerAfterClaim,
        nativeBalOfSignerB4Claim,
        profile
      } = await claimWeeklyReward({growToken, learna, signer: signer1, weekId});

      expect(erc20balanceInLearnaAfterClaim < erc20balanceInLearnaB4Claim).to.be.true;
      expect(erc20balanceOfSignerAfterClaim > erc20balanceOfSignerB4Claim).to.be.true;
      expect(nativeBalOfSignerAfterClaim > nativeBalOfSignerB4Claim).to.be.true;
      expect(profile.amountClaimedInNative > 0n).to.be.true;
    });
  })
})