import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { campaigns, getCampaigns, setUpCampaign } from "../utils";
import { parseEther,} from "viem";
import { Address } from "../types";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners)};
  }
  
  describe("Setup campaigns", function () { 
    it("Should setup and fund campaign successfully", async function () {
      const { learna, knowToken, learnaAddr, signers : { signer1, admin2, signer1Addr, deployer }, knowTokenAddr} = await loadFixture(deployContractsFixcture);
      let fundERC20 = parseEther('5');
      let value = parseEther('1');
      const { allCampaign } = await getCampaigns(learna);
      const campaignHash = allCampaign[0].hash_ as Address;
      const erc20Amount = fundERC20;
      await knowToken.connect(deployer).transfer(signer1Addr, erc20Amount)
      await knowToken.connect(signer1).approve(learnaAddr, erc20Amount);
      const campaign = campaigns[0];
      // const campaignHash = keccak256(stringToBytes(campaign));
      const {campaigns: cp} = await setUpCampaign({learna, signer: signer1, campaign, fundERC20, token: knowToken, value});
      // const { campaignData } = await getCampaigns(learna);
      const newErc20Values = fundERC20 / 2n;

      const newNativeValues = value / 2n;

      await learna.connect(admin2).adjustCampaignValues(cp.campaigns[0].data.data.hash_, newErc20Values, newNativeValues);
      const newCampaigns = (await getCampaigns(learna)).campaigns;

      // console.log("CP", cp.campaigns);
      expect(cp.campaigns[0].data.activeLearners).to.be.eq(newCampaigns[0].data.activeLearners);
      expect(cp.campaigns[0].data.fundsERC20 > newCampaigns[0].data.fundsERC20).to.be.true;
      expect(cp.campaigns[0].data.fundsNative > newCampaigns[0].data.fundsNative).to.be.true;
      expect(cp.campaigns[0].data.totalPoints).to.be.eq(newCampaigns[0].data.totalPoints);
      expect(cp.campaigns[0].data.token).to.be.eq(newCampaigns[0].data.token);
      expect(cp.campaigns[0].data.operator).to.be.eq(newCampaigns[0].data.operator);
      expect(cp.campaigns[0].data.data.hash_).to.be.eq(campaignHash);
      expect(cp.campaigns[0].data.lastUpdated <= newCampaigns[0].data.lastUpdated).to.be.true;
    });
  })
})