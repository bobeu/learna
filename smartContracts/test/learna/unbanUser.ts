import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { banUserFromCampaig, getCampaigns, getQuizResult } from "../utils";
import { Address } from "../types";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Should unban user from campaign", function () {
    it("An admin should be able to remove user from weekly earning payroll", async function () {
      const { learna, signers : { deployer, signer1Addr },} = await loadFixture(deployContractsFixcture);
      const { allCampaign } = await getCampaigns(learna);
      const campaignHash = allCampaign[0].hash_ as Address;
      const quizResult = getQuizResult(campaignHash, 60);
      await learna.connect(deployer).recordPoints(signer1Addr, quizResult, campaignHash);
      const iniP = (await learna.getProfile(signer1Addr))?.[0].campaigns.filter(({campaignHash})=> campaignHash.toLowerCase() === campaignHash.toLowerCase())?.[0];
      expect(iniP.profile.other.blacklisted).to.be.false;
      
      // First call bans user
      const initP = (await banUserFromCampaig({deployer, learna, user: signer1Addr, campaignHashes: [campaignHash]}))?.[0].campaigns.filter(({campaignHash})=> campaignHash.toLowerCase() === campaignHash.toLowerCase())?.[0];
      expect(initP.profile.other.blacklisted).to.be.true;

      // Ban user
      await expect(learna.connect(deployer).recordPoints(signer1Addr, quizResult, campaignHash))
      .to.be.revertedWith("Blacklisted");

      // Second call unbans
      const profileAfterBan = (await banUserFromCampaig({deployer, learna, user: signer1Addr, campaignHashes: [campaignHash]}))?.[0].campaigns.filter(({campaignHash})=> campaignHash.toLowerCase() === campaignHash.toLowerCase())?.[0];
      expect(profileAfterBan?.profile.other.blacklisted).to.be.false;

      // User should able to record points
      await expect(learna.connect(deployer).recordPoints(signer1Addr, quizResult, campaignHash))
      .to.ok;
    });
  })
})