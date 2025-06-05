import {  TEN_THOUSAND_TOKEN, bn, TrxnType, Status_Dist, } from "../utilities";
import {executeTransaction, proposeTransaction, signTransaction } from "../utils"
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
  describe("Adding signers is type of transaction that can be proposed", function () {
    it("Create a request to add new signer", async function () {
      const { distributor, collateralAssetAddr, signers: { signer1, deployer, signer3, alc1Addr,} } = await loadFixture(deployContractsFixcture);
      const transferAmt = TEN_THOUSAND_TOKEN;
      const { txType,id } = await proposeTransaction({
        signer: signer1, 
        recipient: alc1Addr as Address, 
        amount: transferAmt, 
        contract: distributor, 
        delayInHrs: 0, 
        trxType: TrxnType.ADDSIGNER,
        safe: zeroAddress,
        token: collateralAssetAddr
      });
      expect(txType).to.be.eq(TrxnType.ADDSIGNER);
  
      const initSignersB4 = await distributor.getExecutors();
      const isSignerB4 = await distributor.signers(alc1Addr);
      await signTransaction({signer: deployer, requestId: id, contract: distributor});
      const exec = await executeTransaction({signer: signer3, contract: distributor, reqId: id});
      const initSignersAfter = await distributor.getExecutors();
      const isSignerAfter = await distributor.signers(alc1Addr);
      expect(bn(initSignersAfter.length).gt(bn(initSignersB4.length))).to.be.true;
      expect(isSignerB4).to.be.false;
      expect(isSignerAfter).to.be.true;
      expect(exec.status).to.be.eq(Status_Dist.EXECUTED);
    });
  })
})

