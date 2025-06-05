import {  TEN_THOUSAND_TOKEN, ZERO, TrxnType, Status_Dist, QUORUM, } from "../utilities";
import { proposeTransaction } from "../utils"
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

  describe("Signers can propose a transaction to transfer ERC20 token to the recipient, non-signers don't", function () {
    it("Propose an ERC20 transfer transaction", async function () {
      const { distributor,collateralAssetAddr, signers: {signer1, alc1Addr, signer1Addr, }, } = await loadFixture(deployContractsFixcture);
      const transferAmt = TEN_THOUSAND_TOKEN;
      const { recipient, amount, executors, txType, status, delay, id} = await proposeTransaction({
        signer: signer1, 
        recipient: alc1Addr as Address, 
        amount: transferAmt, 
        contract: distributor, 
        delayInHrs: 0, 
        trxType: TrxnType.ERC20,
        safe: zeroAddress,
        token: collateralAssetAddr
      });
      const quorum = await distributor.quorum();
      expect(quorum).to.be.eq(BigInt(QUORUM - 1));
      expect(id).to.be.eq(1n);
      expect(delay).to.be.eq(ZERO);
      expect(amount).to.be.eq(transferAmt);
      expect(executors.length).to.be.eq(1n);
      expect(executors[0]).to.be.eq(signer1Addr);
      expect(status).to.be.eq(Status_Dist.INITIATED);
      expect(txType).to.be.eq(TrxnType.ERC20);
      expect(recipient).to.be.eq(alc1Addr);
    });
  })
})

