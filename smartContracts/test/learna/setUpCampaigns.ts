import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { getCampaigns, setUpCampaign } from "../utils";
import { parseEther } from "viem";
import { CAMPAIGNS, getCampaignHashes } from "../../hashes";

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
      const { campaignHashes } = getCampaignHashes(campaignData);
      const erc20Amount = fundERC20 * BigInt(campaignHashes.length);
      await growToken.connect(deployer).transfer(signer1Addr, erc20Amount)
      await growToken.connect(signer1).approve(learnaAddr, erc20Amount);
      const {
        balanceOfLeanerB4Tipped,
        balanceOfLeanerAfterTipped, 
        campaigns: cp
      } = await setUpCampaign({learna, signer: signer1, campaigns: CAMPAIGNS, fundERC20, token: growTokenAddr, value});
      expect(cp.campaigns.length === campaignHashes.length).to.be.true;
      cp.campaigns.forEach((campaign, i) => {
        expect(campaign.activeLearners).to.be.eq(0n);
        expect(campaign.claimActiveUntil).to.be.eq(0n);
        expect(campaign.fundsERC20).to.be.eq(fundERC20);
        expect(campaign.fundsNative).to.be.eq(value);
        expect(campaign.transitionDate > 0).to.be.true;
        expect(campaign.totalPoints).to.be.eq(0n);
        expect(campaign.token).to.be.eq(growTokenAddr);
        expect(campaign.operator).to.be.eq(signer1Addr);
        expect(campaign.hash_).to.be.eq(campaignHashes[i]);
        expect(campaign.lastUpdated > 0n).to.be.true;
      })
      if(balanceOfLeanerAfterTipped && balanceOfLeanerB4Tipped) {
        expect(balanceOfLeanerAfterTipped > balanceOfLeanerB4Tipped).to.be.true;
      }
    });
  })
})