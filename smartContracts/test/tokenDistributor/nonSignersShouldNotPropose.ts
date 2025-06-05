import {  TEN_THOUSAND_TOKEN, TrxnType } from "../utilities";
import { deployContracts } from "../deployments";
import { loadFixture, } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { zeroAddress } from "viem";

describe("Token distributor", function () {
  async function deployContractsFixcture() {
    return { 
      ...await deployContracts(ethers.getSigners),
    };
  }
  describe("Signers have power to propose transaction, non-signers don't", function () {
    it("Non-Signers should not propose transaction", async function () {
      const { distributor, collateralAssetAddr, signers: { alc1, deployer} } = await loadFixture(deployContractsFixcture);
      const transferAmt = TEN_THOUSAND_TOKEN;
      await expect(
        distributor.connect(alc1).proposeTransaction(collateralAssetAddr, zeroAddress, deployer, transferAmt, 0, TrxnType.ERC20)
      ).to.be.revertedWith("Not a signer");
    });
  })
})

