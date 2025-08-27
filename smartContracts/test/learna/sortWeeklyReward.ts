import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { getCampaigns, setUpCampaign, getQuizResult, sortWeeklyEarning, campaigns, recordPoints } from "../utils";
import { parseEther } from "viem";
import { Address } from "../types";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Should allocate weekly payout", function () {
    it("An admin should be able to allocate weekly earning payout with relevant data", async function () {
      const { learna, GrowToken, learnaAddr, GrowTokenAddr, signers : { deployer, signer1, signer1Addr, },} = await loadFixture(deployContractsFixcture);
      const amountInERC20 = parseEther('10');

      let fundERC20 = parseEther('55');
      const value = parseEther('13');
      const { allCampaign } = await getCampaigns(learna);
      const campaignHash = allCampaign[0].hash_ as Address;
      const erc20Amount = fundERC20;
      await GrowToken.connect(deployer).transfer(signer1Addr, erc20Amount)
      await GrowToken.connect(signer1).approve(learnaAddr, erc20Amount);
      const quizResult = getQuizResult(campaignHash, 60);
      await recordPoints({deployer, learna, quizResult, campaignHash, user: signer1Addr, token: GrowTokenAddr});
      await setUpCampaign({learna, signer: signer1, campaign: campaigns[0], fundERC20, token: GrowToken, value});
      
      const { 
        balanceInGrowReserveAfterAllocation,
        balanceInGrowReserveB4Allocation,
        balanceOfLearnaAfterAllocation,
        balanceOfLearnaB4Allocation,
        // data
      } = await sortWeeklyEarning({amountInERC20, deployer, GrowToken, learna});

      expect(balanceInGrowReserveAfterAllocation < balanceInGrowReserveB4Allocation).to.be.true;
      expect(balanceOfLearnaAfterAllocation === balanceOfLearnaB4Allocation).to.be.true;
    });
  })
})