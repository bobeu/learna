import { sumToString, reduce, TEN_THOUSAND_TOKEN, ONE_HUNDRED_TOKEN, formatAddr, } from "./utilities";
import { deployContracts } from "./deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Base Asset test: (For local test only)", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }

  describe("Base asset is the asset in which the contribution amount is based", function () {
    it("Should confirm total amount minted to initial recipient.", async () => {
      const { baseAsset, signers: { deployerAddr }} = await loadFixture(deployContractsFixcture);
      expect(await baseAsset.balanceOf(formatAddr(deployerAddr))).to.be.equal(await baseAsset.totalSupply())
    });

    /**
     * We have to first set up a signer from the Token Distributor contract,
     * perform a few steps such as initiate a transaction in order to effect
     * a transfer.
     */
    it("Should successfully transfer asset", async () => {
      const { 
        baseAsset,
        signers: { alc1Addr, deployerAddr, deployer },
        } = await loadFixture(deployContractsFixcture);

      const initBal_sender = await baseAsset.balanceOf(formatAddr(deployerAddr));
      const initBal_receiver = await baseAsset.balanceOf(formatAddr(alc1Addr));
      await baseAsset.connect(deployer).transfer(formatAddr(alc1Addr), TEN_THOUSAND_TOKEN);
      const balOfSender = await baseAsset.balanceOf(formatAddr(deployerAddr));
      const balOfRec = await baseAsset.balanceOf(formatAddr(alc1Addr));
      expect(reduce(balOfSender, 0).toString()).to.be.equal(reduce(initBal_sender, TEN_THOUSAND_TOKEN).toString());
      expect(sumToString(balOfRec, 0).toString()).to.be.equal(sumToString(initBal_receiver, TEN_THOUSAND_TOKEN));
    });

    it("Should increase allowance of account", async () => {
      const { baseAsset, signers: { alc1Addr, deployer, deployerAddr }, } = await loadFixture(deployContractsFixcture);

      await baseAsset.connect(deployer).approve(alc1Addr, ONE_HUNDRED_TOKEN);
      expect(await baseAsset.allowance(deployerAddr, alc1Addr)).to.be.equal(ONE_HUNDRED_TOKEN);
    });
  });
});


