import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { getPassKey, banUserFromCampaig } from "../utils";
import { campaignHashes } from "../../hashes";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Should ban user from weekly payout", function () {
    it("An admin should be able to remove user from weekly earning payroll", async function () {
      const { learna, growTokenAddr, signers : { deployer, signer1Addr, signer1 },} = await loadFixture(deployContractsFixcture);
      const { state: {weekCounter: weekId} } = await learna.getData();
      const initialProfile = await learna.getProfile(signer1Addr, weekId, campaignHashes);
      for(let i = 0; i < campaignHashes.length; i++){
        const iniP = initialProfile[i].profile;
        expect(iniP.haskey).to.be.false;
        
      };
      const profileB4Ban = await getPassKey({ signer: signer1, learna, growToken: growTokenAddr, campaignHashes});
      profileB4Ban.forEach(({profile: {haskey}}) => {
        expect(haskey).to.be.true;
      });
      const profileAfterBan = await banUserFromCampaig({deployer, learna, user: signer1Addr, weekId, campaignHashes});
      profileAfterBan.forEach(({profile: {haskey}}) => {
        expect(haskey).to.be.false;
      });
    });
  })
})