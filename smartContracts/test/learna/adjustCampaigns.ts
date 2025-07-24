import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { campaigns, getCampaigns, setUpCampaign } from "../utils";
import { parseEther,} from "viem";
import { Address } from "../types";

describe("Learna", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners)};
  }
  
  describe("Setup campaigns", function () { 
    it("Should setup and fund campaign successfully", async function () {
      const { learna, growToken, learnaAddr, signers : { signer1, admin2, signer1Addr, deployer }, growTokenAddr} = await loadFixture(deployContractsFixcture);
      let fundERC20 = parseEther('5');
      let value = parseEther('1');
      const { allCampaign } = await getCampaigns(learna);
      const campaignHash = allCampaign[0].hash_ as Address;
      const erc20Amount = fundERC20;
      await growToken.connect(deployer).transfer(signer1Addr, erc20Amount)
      await growToken.connect(signer1).approve(learnaAddr, erc20Amount);
      const campaign = campaigns[0];
      // const campaignHash = keccak256(stringToBytes(campaign));
      const {campaigns: cp} = await setUpCampaign({learna, signer: signer1, campaign, fundERC20, token: growTokenAddr, value});
      // const { campaignData } = await getCampaigns(learna);
      const newErc20Values = fundERC20 / 2n;

      const newNativeValues = value / 2n;

      await learna.connect(admin2).adjustCampaignValues(cp.campaigns[0].hash_, newErc20Values, newNativeValues);
      const newCampaigns = (await getCampaigns(learna)).campaigns;

      // console.log("CP", cp.campaigns);
      expect(cp.campaigns[0].activeLearners).to.be.eq(newCampaigns[0].activeLearners);
      expect(cp.campaigns[0].fundsERC20 > newCampaigns[0].fundsERC20).to.be.true;
      expect(cp.campaigns[0].fundsNative > newCampaigns[0].fundsNative).to.be.true;
      expect(cp.campaigns[0].totalPoints).to.be.eq(newCampaigns[0].totalPoints);
      expect(cp.campaigns[0].token).to.be.eq(newCampaigns[0].token);
      expect(cp.campaigns[0].operator).to.be.eq(newCampaigns[0].operator);
      expect(cp.campaigns[0].hash_).to.be.eq(campaignHash);
      expect(cp.campaigns[0].lastUpdated <= newCampaigns[0].lastUpdated).to.be.true;
    });
  })
})