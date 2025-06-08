import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { registerUsersForWeeklyEarning, unregisterUsersForWeeklyEarning } from "../utils";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Should unregister user for weekly payout", function () {
    it("An admin should be able to remove user from weekly earning payroll", async function () {
      const { learna, signers : { deployer, signer1Addr },} = await loadFixture(deployContractsFixcture);
      const { weekCounter: weekId } = await learna.getData();
      const { isApproved } = await registerUsersForWeeklyEarning({ deployer, learna, user: signer1Addr, weekId });
      expect(isApproved).to.be.true;
      const { isApproved: isApprovedAfter } = await unregisterUsersForWeeklyEarning({deployer, learna, user: signer1Addr, weekId});
      expect(isApprovedAfter).to.be.false;
    });
  })
})