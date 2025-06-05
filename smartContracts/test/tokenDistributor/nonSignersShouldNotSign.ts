import {  TEN_THOUSAND_TOKEN, TrxnType, } from "../utilities";
import { proposeTransaction, } from "../utils"
import { deployContracts } from "../deployments";
import { loadFixture, } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Address } from "../types";
import { zeroAddress } from "viem";

describe("Token distributor", function () {
  async function deployContractsFixcture() {
    return { 
      ...await deployContracts(ethers.getSigners),
    };
  }
  describe("Signers have power to sign transaction, non-signers don't", function () {
    it("Non-Signers should not sign transaction", async function () {
      const { distributor, collateralAssetAddr, signers: { signer1, alc1, alc1Addr, } } = await loadFixture(deployContractsFixcture);
      const { id } = await proposeTransaction({
        signer: signer1, 
        recipient: alc1Addr as Address, 
        amount: TEN_THOUSAND_TOKEN, 
        contract: distributor, 
        delayInHrs: 0, 
        trxType: TrxnType.ERC20,
        safe: zeroAddress,
        token: collateralAssetAddr
      });
      await expect(
        distributor.connect(alc1).signTransaction(id)
      ).to.be.revertedWith("Not a signer");
    });
  })
})

