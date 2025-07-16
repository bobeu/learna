import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { campaigns, claimReward, getCampaigns, getPassKey, getQuizResult, recordPoints, setUpCampaign, sortWeeklyEarning } from "../utils";
import { parseEther } from "viem";
import { Address } from "../types";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Claim reward", function () {
    it("Users should be able to claim reward from weekly payout", async function () {
      const { learna, learnaAddr, growToken, growTokenAddr, signers : { deployer, signer2, signer2Addr, signer1, signer1Addr },} = await loadFixture(deployContractsFixcture);
      const amountInERC20 = parseEther('10000');
      const fundERC20 = parseEther('80');
      const campaignSize = 1n
      const valuePerCampaign = parseEther('1');
      const { state: {weekCounter: weekId} } = await learna.getData();
      const { campaignData } = await getCampaigns(learna);
      const campaignHash = campaignData.campaignHash as Address;
      console.log("campaignHash", campaignHash);
      const nativeBalOfLearnerB4 = await signer1.provider?.getBalance(learnaAddr);
      await growToken.connect(deployer).approve(learnaAddr, fundERC20 * campaignSize);
      await setUpCampaign({learna, signer: deployer, fundERC20, campaign: campaigns[0], value: valuePerCampaign, token: growTokenAddr});
      const nativeBalOfLearnerAfterSetup = await signer1.provider?.getBalance(learnaAddr);
      if(nativeBalOfLearnerB4 && nativeBalOfLearnerAfterSetup){
        expect(nativeBalOfLearnerAfterSetup > nativeBalOfLearnerB4).to.be.true;
        expect(nativeBalOfLearnerAfterSetup >= valuePerCampaign * campaignSize).to.be.true;
      }
      
      await getPassKey({signer: signer1, learna, growToken: growTokenAddr, campaignHashes: [campaignHash]});
      await getPassKey({signer: signer2, learna, growToken: growTokenAddr, campaignHashes: [campaignHash]});
      await recordPoints({deployer, learna, quizResult: getQuizResult(campaignHash, 60), campaignHash, user: signer1Addr, token: growTokenAddr});
      await recordPoints({deployer, learna, quizResult: getQuizResult(campaignHash, 90), campaignHash, user: signer2Addr, token: growTokenAddr});
      const isEligible = await learna.connect(signer1).checkEligibility(weekId, signer1Addr, [campaignHash]);
      expect(isEligible[0].value).to.be.false;

      await sortWeeklyEarning({amountInERC20, deployer, growToken, learna, campaigns});
      const isEligibleAfter = await learna.connect(signer1).checkEligibility(weekId, signer1Addr, [campaignHash]);
      expect(isEligibleAfter[0].value).to.be.true;

      const { state: {weekCounter: newWeekId} } = await learna.getData();
      expect(newWeekId > weekId && newWeekId === 1n).to.be.true;
      const s1 = await claimReward({growToken, learna, signer: signer1, weekId, campaignHashes: [campaignHash]});
      const s2 = await claimReward({growToken, learna, signer: signer2, weekId, campaignHashes: [campaignHash]});

      expect(s1.erc20balanceInLearnaAfterClaim < s1.erc20balanceInLearnaB4Claim).to.be.true;
      expect(s1.erc20balanceOfSignerAfterClaim > s1.erc20balanceOfSignerB4Claim).to.be.true;
      expect(s1.nativeBalOfSignerAfterClaim > s1.nativeBalOfSignerB4Claim).to.be.true;

      expect(s1.profile[0].profile.other.amountClaimedInNative > 0n).to.be.true;
      expect(s2.profile[0].profile.other.amountClaimedInNative > 0n).to.be.true;

      expect(s2.erc20balanceInLearnaAfterClaim < s2.erc20balanceInLearnaB4Claim).to.be.true;
      expect(s2.erc20balanceOfSignerAfterClaim > s2.erc20balanceOfSignerB4Claim).to.be.true;
      expect(s2.nativeBalOfSignerAfterClaim > s2.nativeBalOfSignerB4Claim).to.be.true;
    });
  })
})