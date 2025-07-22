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
  
  describe("Should ban user from weekly payout", function () {
    it("An admin should be able to remove user from participating in campaign", async function () {
      const { learna, growTokenAddr, signers : { deployer, signer1Addr },} = await loadFixture(deployContractsFixcture);
      const { state: {weekId}, } = await learna.getData();
      const { allCampaign } = await getCampaigns(learna);
      const campaignHash = allCampaign[0].hash_ as Address;
      const quizResult = getQuizResult(campaignHash, 60);

      const iniP = await learna.getProfile(signer1Addr, weekId, campaignHash);
      expect(iniP.profile.other.blacklisted).to.be.false;
      const profileAfterBan = await banUserFromCampaig({deployer, learna, user: signer1Addr, weekId, campaignHashes: [campaignHash]});
      expect(profileAfterBan.profile.other.blacklisted).to.be.true;
      await expect(learna.connect(deployer).recordPoints(signer1Addr, quizResult, campaignHash))
      .to.be.revertedWith("Blacklisted");
    });
  })
})