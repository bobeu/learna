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
  describe("ERC20 transfer is a type of transaction that can be proposed, sign,and executed", function () {
    it("Execute ERC20 transfer request", async function () {
      const { distributor, collateralAsset, distributorAddr, collateralAssetAddr, signers: { signer1, alc1Addr, signer3, deployer} } = await loadFixture(deployContractsFixcture);
      const quorum = await distributor.quorum();
      const balB4Execute = await collateralAsset.balanceOf(distributorAddr);
      const balOfAcc1B4Execute = await collateralAsset.balanceOf(alc1Addr);
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
      await signTransaction({signer: deployer, requestId: id, contract: distributor});
      const {
        executors,
        status
      } = await executeTransaction({signer: signer3, contract: distributor, reqId: id});
      const balAfterExecute = await collateralAsset.balanceOf(distributorAddr);
      const balOfAlc1AfterExecute = await collateralAsset.balanceOf(alc1Addr);
      expect(status).to.be.eq(Status_Dist.EXECUTED);
      expect(executors.length).to.be.eq(quorum);
      expect(bn(balAfterExecute).lt(bn(balB4Execute))).to.be.true;
      expect(bn(balOfAlc1AfterExecute).gt(bn(balOfAcc1B4Execute))).to.be.true;
      expect(balOfAlc1AfterExecute).to.be.eq(TEN_THOUSAND_TOKEN);
    });
  })
})

