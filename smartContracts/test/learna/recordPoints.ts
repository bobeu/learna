import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { getCampaigns, getQuizResult, recordPoints } from "../utils";
import { Address } from "../types";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
  describe("Should record weekly payout", function () {
    it("An admin should be able to sort weekly earning payroll", async function () {
        const { learna, GrowTokenAddr, signers : { deployer, signer1Addr },} = await loadFixture(deployContractsFixcture);
        const { allCampaign } = await getCampaigns(learna);
        const campaignHash = allCampaign[0].hash_ as Address;
        const quizResult = getQuizResult(campaignHash, 60);
        const pf = await recordPoints({deployer, learna, quizResult, campaignHash, user: signer1Addr, token: GrowTokenAddr});
        const filtered = pf.campaigns.filter(({hash_})=> hash_.toLowerCase() === campaignHash.toLowerCase())?.[0];

        const { other: { }, quizResults } = filtered.profile;
        expect(quizResults[0].other.score === BigInt(quizResult.other.score)).to.be.true;
        // expect(amountClaimedInERC20).to.be.eq(0n);
        // expect(amountClaimedInNative).to.be.eq(0n);
        // expect(amountClaimedInERC20).to.be.eq(0n);
        // expect(amountClaimedInNative).to.be.eq(0n);
    });
  })
})