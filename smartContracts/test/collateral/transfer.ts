import { sumToString, reduce, TEN_THOUSAND_TOKEN, formatAddr, } from "../utilities";
import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Collateral asset", function () {
  async function deployContractsFixcture() {
    return { 
        ...await deployContracts(ethers.getSigners),
    };
  }

  describe("Testing Token Logic", function () {
    /**
     * We have to first set up a signer from the Token Distributor contract,
     * perform a few steps such as initiate a transaction in order to effect
     * a transfer.
     */
    it("Should successfully transfer asset", async () => {
      const { collateralAsset,signers: { alc1Addr, deployerAddr, deployer }, } = await loadFixture(deployContractsFixcture);
      const initBal_sender = await collateralAsset.balanceOf(formatAddr(deployerAddr));
      const initBal_receiver = await collateralAsset.balanceOf(formatAddr(alc1Addr));
      await collateralAsset.connect(deployer).transfer(formatAddr(alc1Addr), TEN_THOUSAND_TOKEN);
      const balOfSender = await collateralAsset.balanceOf(formatAddr(deployerAddr));
      const balOfRec = await collateralAsset.balanceOf(formatAddr(alc1Addr));
      expect(reduce(balOfSender, 0).toString()).to.be.equal(reduce(initBal_sender, TEN_THOUSAND_TOKEN).toString());
      expect(sumToString(balOfRec, 0).toString()).to.be.equal(sumToString(initBal_receiver, TEN_THOUSAND_TOKEN));
    });
  });
});


