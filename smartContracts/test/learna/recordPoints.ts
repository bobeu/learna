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
        const { learna, growTokenAddr, signers : { deployer, signer1Addr },} = await loadFixture(deployContractsFixcture);
        const { campaignData } = await getCampaigns(learna);
        const campaignHash = campaignData.campaignHash as Address;
        const quizResult = getQuizResult(campaignHash, 60);
        const pf = await recordPoints({deployer, learna, quizResult, campaignHash, user: signer1Addr, token: growTokenAddr});

        const { other: {amountClaimedInERC20, amountClaimedInNative, claimed }, quizResults } = pf.profile;
        expect(quizResults[0].other.score === BigInt(quizResult.other.score)).to.be.true;
        expect(amountClaimedInERC20).to.be.eq(0n);
        expect(amountClaimedInNative).to.be.eq(0n);
        expect(claimed).to.be.false;
        expect(amountClaimedInERC20).to.be.eq(0n);
        expect(amountClaimedInNative).to.be.eq(0n);
    });
  })
})