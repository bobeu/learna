import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { getPassKey, unregisterUsersForWeeklyEarning } from "../utils";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Should unregister user for weekly payout", function () {
    it("An admin should be able to remove user from weekly earning payroll", async function () {
      const { learna, signers : { deployer, signer1Addr, signer1 },} = await loadFixture(deployContractsFixcture);
      const { state: {weekCounter: weekId} } = await learna.getData();
      const initialProfile = await learna.getUserData(signer1Addr, weekId);
      expect(initialProfile.haskey).to.be.false;
      const { haskey } = await getPassKey({ signer: signer1, learna});
      expect(haskey).to.be.true;
      const { haskey: haskeyAfter } = await unregisterUsersForWeeklyEarning({deployer, learna, user: signer1Addr, weekId});
      expect(haskeyAfter).to.be.false;
    });
  })
})