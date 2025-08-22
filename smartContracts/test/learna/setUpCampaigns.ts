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
      const { learna, BrainToken, learnaAddr, signers : { signer1, signer1Addr, deployer }, BrainTokenAddr} = await loadFixture(deployContractsFixcture);
      let fundERC20 = parseEther('55');
      const value = parseEther('13');
      const { allCampaign } = await getCampaigns(learna);
      const campaignHash = allCampaign[0].hash_ as Address;
      const erc20Amount = fundERC20;
      await BrainToken.connect(deployer).transfer(signer1Addr, erc20Amount)
      await BrainToken.connect(signer1).approve(learnaAddr, erc20Amount);
      const {
        balanceOfLeanerB4Tipped,
        balanceOfLeanerAfterTipped, 
        campaigns: cp
      } = await setUpCampaign({learna, signer: signer1, campaign: campaigns[0], fundERC20, token: BrainToken, value});

      expect(cp.campaigns.length === 1).to.be.true;
      expect(cp.campaigns[0].data.activeLearners).to.be.eq(0n);
      expect(cp.campaigns[0].data.fundsERC20).to.be.eq(fundERC20);
      expect(cp.campaigns[0].data.fundsNative).to.be.eq(value);
      expect(cp.campaigns[0].data.totalPoints).to.be.eq(0n);
      expect(cp.campaigns[0].data.token).to.be.eq(BrainTokenAddr);
      expect(cp.campaigns[0].data.operator).to.be.eq(signer1Addr);
      expect(cp.campaigns[0].data.data.hash_).to.be.eq(campaignHash);
      expect(cp.campaigns[0].data.lastUpdated > 0n).to.be.true;
      if(balanceOfLeanerAfterTipped && balanceOfLeanerB4Tipped) {
        expect(balanceOfLeanerAfterTipped > balanceOfLeanerB4Tipped).to.be.true;
      }
    })
  })
})