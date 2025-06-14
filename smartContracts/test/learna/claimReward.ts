import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { claimWeeklyReward, getPassKey, recordPoints, sendTip, sortWeeklyEarning } from "../utils";
import { parseEther } from "viem";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Claim reward", function () {
    it("Users should be able to claim reward from weekly payout", async function () {
      const { learna, learnaAddr, growToken, signers : { deployer, deployerAddr, signer2, signer2Addr, signer1, signer1Addr },} = await loadFixture(deployContractsFixcture);
      const amountInERC20 = parseEther('10000');
      const tipAmount = parseEther('80');
      const signer1PointsEarned = 70;
      const signer2PointsEarned = 90;
      const { state: {weekCounter: weekId} } = await learna.getData();
      await getPassKey({signer: signer1, learna});
      await getPassKey({signer: signer2, learna});
      await recordPoints({deployer, learna, points:signer1PointsEarned, user: signer1Addr});
      await recordPoints({deployer, learna, points:signer2PointsEarned, user: signer2Addr});
      const nativeBalOfLearnerB4 = await signer1.provider?.getBalance(learnaAddr);
      await sendTip({learna, signer: deployer, tipAmount});
      const nativeBalOfLearnerAfterTipping = await signer1.provider?.getBalance(learnaAddr);
      if(nativeBalOfLearnerB4 && nativeBalOfLearnerAfterTipping){
        expect(nativeBalOfLearnerAfterTipping > nativeBalOfLearnerB4).to.be.true;
        expect(nativeBalOfLearnerAfterTipping >= tipAmount).to.be.true;
      }
      const isEligible = await learna.connect(signer1).checkligibility(weekId);
      expect(isEligible).to.be.false;
      await sortWeeklyEarning({amountInERC20, deployer, growToken, learna, owner:deployerAddr});
      const isEligibleAfter = await learna.connect(signer1).checkligibility(weekId);
      expect(isEligibleAfter).to.be.true;
      const { state: {weekCounter: newWeekId} } = await learna.getData();
      expect(newWeekId > weekId && newWeekId === 1n).to.be.true;
      const s1 = await claimWeeklyReward({growToken, learna, signer: signer1, weekId});
      const s2= await claimWeeklyReward({growToken, learna, signer: signer2, weekId});

      expect(s1.erc20balanceInLearnaAfterClaim < s1.erc20balanceInLearnaB4Claim).to.be.true;
      expect(s1.erc20balanceOfSignerAfterClaim > s1.erc20balanceOfSignerB4Claim).to.be.true;
      expect(s1.nativeBalOfSignerAfterClaim > s1.nativeBalOfSignerB4Claim).to.be.true;
      expect(s1.profile.amountClaimedInNative > 0n).to.be.true;

      expect(s2.erc20balanceInLearnaAfterClaim < s2.erc20balanceInLearnaB4Claim).to.be.true;
      expect(s2.erc20balanceOfSignerAfterClaim > s2.erc20balanceOfSignerB4Claim).to.be.true;
      expect(s2.nativeBalOfSignerAfterClaim > s2.nativeBalOfSignerB4Claim).to.be.true;
      expect(s2.profile.amountClaimedInNative > 0n).to.be.true;
    });
  })
})