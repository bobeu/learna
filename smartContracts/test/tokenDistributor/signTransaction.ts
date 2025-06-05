import {  TEN_THOUSAND_TOKEN, TrxnType, Status_Dist, } from "../utilities";
import { proposeTransaction, signTransaction } from "../utils"
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
  describe("Signers can sign supported transactions, non-signers don't", function () {
    it("Sign transaction", async function () {
      const { distributor, collateralAssetAddr, signers: { signer1, alc1Addr, deployer} } = await loadFixture(deployContractsFixcture);
      const transferAmt = TEN_THOUSAND_TOKEN;
      const quorum = await distributor.quorum();
      const { id } = await proposeTransaction({
        signer: signer1, 
        recipient: alc1Addr as Address, 
        amount: transferAmt, 
        contract: distributor, 
        delayInHrs: 0, 
        trxType: TrxnType.SETQUORUM,
        safe: zeroAddress,
        token: collateralAssetAddr
      });
      const { executors, status } = await signTransaction({signer: deployer, requestId: id, contract: distributor});
      expect(status).to.be.eq(Status_Dist.PENDING);
      expect(executors.length).to.be.eq(quorum);
    });
  })
})

