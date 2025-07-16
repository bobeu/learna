import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { setUpCampaign, campaigns, getCampaigns } from "../utils";
import { parseEther } from "viem";
import { Address } from "../types";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners)};
  }
  
  describe("Setup campaigns", function () { 
    it("Should setup and fund campaign successfully", async function () {
      const { learna, growToken, learnaAddr, signers : { signer1, signer1Addr, deployer }, growTokenAddr} = await loadFixture(deployContractsFixcture);
      let fundERC20 = parseEther('55');
      const value = parseEther('13');
      const { campaignData } = await getCampaigns(learna);
      const campaignHash = campaignData.campaignHash as Address;
      const erc20Amount = fundERC20;
      await growToken.connect(deployer).transfer(signer1Addr, erc20Amount)
      await growToken.connect(signer1).approve(learnaAddr, erc20Amount);
      const {
        balanceOfLeanerB4Tipped,
        balanceOfLeanerAfterTipped, 
        campaigns: cp
      } = await setUpCampaign({learna, signer: signer1, campaign: campaigns[0], fundERC20, token: growTokenAddr, value});

      expect(cp.campaigns.length === 1).to.be.true;
      expect(cp.campaigns[0].activeLearners).to.be.eq(0n);
      expect(cp.campaigns[0].claimActiveUntil).to.be.eq(0n);
      expect(cp.campaigns[0].fundsERC20).to.be.eq(fundERC20);
      expect(cp.campaigns[0].fundsNative).to.be.eq(value);
      expect(cp.campaigns[0].transitionDate > 0).to.be.true;
      expect(cp.campaigns[0].totalPoints).to.be.eq(0n);
      expect(cp.campaigns[0].token).to.be.eq(growTokenAddr);
      expect(cp.campaigns[0].operator).to.be.eq(signer1Addr);
      expect(cp.campaigns[0].hash_).to.be.eq(campaignHash);
      expect(cp.campaigns[0].lastUpdated > 0n).to.be.true;
      if(balanceOfLeanerAfterTipped && balanceOfLeanerB4Tipped) {
        expect(balanceOfLeanerAfterTipped > balanceOfLeanerB4Tipped).to.be.true;
      }
    })
  })
})