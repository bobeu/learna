import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { getCampaigns, setUpCampaign } from "../utils";
import { parseEther, parseUnits } from "viem";
import { campaignHashes } from "../../hashes";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners)};
  }
  
  describe("Setup campaigns", function () { 
    it("Should setup and fund campaign successfully", async function () {
      const { learna, growToken, learnaAddr, signers : { signer1, admin2, signer1Addr, deployer }, growTokenAddr} = await loadFixture(deployContractsFixcture);
      let fundERC20 = parseEther('5');
      let value = parseEther('1');
      const erc20Amount = fundERC20 * BigInt(campaignHashes.length);
      await growToken.connect(deployer).transfer(signer1Addr, erc20Amount)
      await growToken.connect(signer1).approve(learnaAddr, erc20Amount);
      const {campaigns: cp} = await setUpCampaign({learna, signer: signer1, campaignHashes, fundERC20, token: growTokenAddr, value});
      const campaigns = cp.filter((_, i) => i > 0); // Remove the first slot in campaign list since it will alwways be zero. Please refer to the Campaign.sol
      // console.log("campaignHashes.length: ", campaignHashes.length);
      const newErc20Values = campaignHashes.map((_, i) => {
        const reducer = parseUnits((i+1).toString(), 9);
        if(fundERC20 > reducer) fundERC20 -= reducer
        else fundERC20 += reducer;
        return fundERC20;
      });

      const newNativeValues = campaignHashes.map((_, i) => {
        const reducer = parseUnits((i+1).toString(), 9);
        if(value > reducer) value -= reducer
        else value += reducer;
        return value;
      });

      await learna.connect(admin2).adjustCampaignValues(campaignHashes, newErc20Values,newNativeValues);
      const newCampaigns = (await getCampaigns(learna)).filter((_, i) => i > 0);;

      campaigns.forEach((campaign, i) => {
        expect(campaign.activeLearners).to.be.eq(newCampaigns[i].activeLearners);
        expect(campaign.claimActiveUntil).to.be.eq(newCampaigns[i].claimActiveUntil);
        expect(campaign.fundsERC20 > newCampaigns[i].fundsERC20).to.be.true;
        expect(campaign.fundsNative > newCampaigns[i].fundsNative).to.be.true;
        expect(campaign.transitionDate > 0).to.be.true;
        expect(campaign.transitionDate === newCampaigns[i].transitionDate).to.be.true;
        expect(campaign.totalPoints).to.be.eq(newCampaigns[i].totalPoints);
        expect(campaign.token).to.be.eq(newCampaigns[i].token);
        expect(campaign.operator).to.be.eq(newCampaigns[i].operator);
        expect(campaign.hash_).to.be.eq(campaignHashes[i]);
        expect(campaign.lastUpdated <= newCampaigns[i].lastUpdated).to.be.true;
      })
    });
  })
})