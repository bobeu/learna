import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { banUserFromCampaig, unbanUserFromCampaig, getCampaigns } from "../utils";
import { Address } from "../types";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Should unban user from campaign", function () {
    it("An admin should be able to remove user from weekly earning payroll", async function () {
      const { learna, signers : { deployer, signer1Addr },} = await loadFixture(deployContractsFixcture);
      const { state: {weekCounter: weekId}, } = await learna.getData();
      const { campaignData } = await getCampaigns(learna);
      const campaignHash = campaignData.campaignHash as Address;

      const iniP = await learna.getProfile(signer1Addr, weekId, campaignHash);
      expect(iniP.profile.other.blacklisted).to.be.false;
      const initP = await banUserFromCampaig({deployer, learna, user: signer1Addr, weekId, campaignHashes: [campaignHash]});
      expect(initP.profile.other.blacklisted).to.be.true;
      const profileAfterBan = await unbanUserFromCampaig({deployer, learna, user: signer1Addr, weekId, campaignHashes: [campaignHash]});
      expect(profileAfterBan.profile.other.blacklisted).to.be.false;
    });
  })
})