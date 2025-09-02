import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { campaigns, getCampaigns, setUpCampaign } from "../utils";
import { parseEther,} from "viem";
import { Address, metadata } from "../types";
import { parseUnits } from "ethers";

describe("CampaignFactory", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners)};
  }
  
  describe("Setup campaigns", function () { 
    it("Should create a campaign successfully", async function () {
      const { campaignFactory, approvalFactory, approvalFactoryAddr, feeManagerAddr, devAddr, signers : { signer1, deployerAddr, signer1Addr: operatorAddr, deployer }} = await loadFixture(deployContractsFixcture);
      let createtionFee = parseUnits('0.001', 18);
      const operator = signer1;
      await campaignFactory.connect(deployer).setApprovalFactory(approvalFactoryAddr);
      await campaignFactory.connect(operator).createCampaign(metadata);
      const data = await campaignFactory.getData();
      const hasApproval = await approvalFactory.hasApproval(deployerAddr);
    
      console.log("Data", data);
      expect(data.campaigns.length).to.be.eq(1);
      expect(data.approvalFactory).to.be.eq(approvalFactoryAddr);
      expect(hasApproval).to.be.true;
      expect(data.dev).to.be.eq(devAddr);
      expect(data.feeTo).to.be.eq(feeManagerAddr);
    });
  })
})