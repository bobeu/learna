import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { registerUsersForWeeklyEarning } from "../utils";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Should register user for weekly payout", function () {
    it("An admin should be able to add user to weekly earning payroll", async function () {
      const { learna, signers : { deployer, signer1Addr },} = await loadFixture(deployContractsFixcture);
      
      const { weekCounter: weekId } = await learna.getData();
      const initProfile = await learna.getUserData(signer1Addr, weekId);
      const {isApproved, claimed, amountClaimedInERC20, amountClaimedInNative} = await registerUsersForWeeklyEarning({
        deployer,
        learna,
        user: signer1Addr,
        weekId,
      });
      
      expect(initProfile.isApproved).to.be.false;
      expect(initProfile.amountClaimedInERC20).to.be.eq(0n);
      expect(initProfile.amountClaimedInNative).to.be.eq(0n);
      expect(isApproved).to.be.true;
      expect(claimed).to.be.false;
      expect(amountClaimedInERC20).to.be.eq(0n);
      expect(amountClaimedInNative).to.be.eq(0n);
    });
  })
})