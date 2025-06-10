import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { getPassKey, recordPoints } from "../utils";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Should record weekly payout", function () {
    it("An admin should be able to add user to weekly earning payroll", async function () {
      const { learna, signers : { deployer, signer1Addr, signer1 },} = await loadFixture(deployContractsFixcture);
      const pointsEarned = 60;
      const { state : {weekCounter: weekId}} = await learna.getData();

      // Recording point without passkey should fail
      await expect( recordPoints({deployer, learna, points:pointsEarned, user: signer1Addr}))
      .to.be.revertedWith('No pass key');

      const initialProfile = await learna.getUserData(signer1Addr, weekId);
      await getPassKey({signer: signer1, learna});
      const {points, amountClaimedInERC20, amountClaimedInNative, claimed, haskey, passKey} = await recordPoints({deployer, learna, points:pointsEarned, user: signer1Addr});
      expect(points === BigInt(pointsEarned)).to.be.true;
      expect(initialProfile.amountClaimedInERC20).to.be.eq(0n);
      expect(initialProfile.amountClaimedInNative).to.be.eq(0n);
      expect(initialProfile.points === 0n).to.be.true; 
      expect(haskey).to.be.true;
      expect(claimed).to.be.false;
      expect(amountClaimedInERC20).to.be.eq(0n);
      expect(amountClaimedInNative).to.be.eq(0n);
    });
  })
})