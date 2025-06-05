import {  TEN_THOUSAND_TOKEN, TrxnType, Status_Dist, DURATION_IN_HOURS,} from "../utilities";
import { proposeTransaction, signTransaction } from "../utils"
import { deployContracts } from "../deployments";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
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
  
  describe("Signers can sign a transactions in this contract if not expired, non-signers don't", function () {
    it("Signing transaction should fail if deadline expired", async function () {
      const { distributor, collateralAssetAddr, signers: { signer1, alc1Addr, deployer} } = await loadFixture(deployContractsFixcture);
      // const transferAmt = TEN_THOUSAND_TOKEN;
      const prop = await proposeTransaction({
        signer: signer1,
        recipient: alc1Addr as Address, 
        amount: TEN_THOUSAND_TOKEN, 
        contract: distributor,
        delayInHrs: 0, 
        trxType: TrxnType.ERC20,
        safe: zeroAddress,
        token: collateralAssetAddr
      });
      const expirationTime = BigInt((await time.latest()) + (((60 * 60) * DURATION_IN_HOURS) * 15));
      await time.increaseTo(expirationTime);
      const sign = await signTransaction({signer: deployer, requestId: prop.id, contract: distributor});
      expect(prop.status).to.be.eq(Status_Dist.INITIATED);
      expect(sign.status).to.be.eq(Status_Dist.EXPIRED);
    });
  })
})

