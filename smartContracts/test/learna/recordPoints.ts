import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { getPassKey, recordPoints } from "../utils";
import { campaignHashes, getPoints } from "../../hashes";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Should record weekly payout", function () {
    it("An admin should be able to add user to weekly earning payroll", async function () {
      const { learna, growTokenAddr, signers : { deployer, signer1Addr, signer1 },} = await loadFixture(deployContractsFixcture);
      const pointsEarned = 60;
      const { state : {weekCounter: weekId}} = await learna.getData();
      const points = getPoints(pointsEarned);

      // Recording point without passkey should fail
      await expect( recordPoints({deployer, learna, points, campaignHashes, user: signer1Addr, token: growTokenAddr}))
      .to.be.revertedWith('No pass key');

      const initialProfile = await learna.getProfile(signer1Addr, weekId, campaignHashes);
      await getPassKey({signer: signer1, learna, growToken: growTokenAddr, campaignHashes});
      const pf = await recordPoints({deployer, learna, points, campaignHashes, user: signer1Addr, token: growTokenAddr});
      for(let i = 0; i < campaignHashes.length; i++){
        const {points: pts, amountClaimedInERC20, amountClaimedInNative, claimed, haskey} = pf[i].profile;
        expect(pts === BigInt(points[i])).to.be.true;
        const initPf = initialProfile[i].profile
        expect(initPf.amountClaimedInERC20).to.be.eq(0n);
        expect(initPf.amountClaimedInNative).to.be.eq(0n);
        expect(initPf.points === 0n).to.be.true; 
        expect(haskey).to.be.true;
        expect(claimed).to.be.false;
        expect(amountClaimedInERC20).to.be.eq(0n);
        expect(amountClaimedInNative).to.be.eq(0n);
      }
    });
  })
})