import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { borrow, provideLiquidity, } from "../utils";
import { parseEther } from "viem";

describe("Providers", function () {
  const amount = parseEther('500');
  const rate = 0.02 * 100;
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners), amount, rate };
  }
  
  describe("When a contributor request for loan from external providers, the process should add the user to existing permissionless pool if it exist", function () {
    it("Signer should borrow. This should successfully launch a new flexpool if there are no active ones for the requested amount ", async function () {
      const {
        baseAsset,
        rate,
        flexpool,
        amount,
        signers : { signer1, deployer, signer2, signer2Addr, signer1Addr },
        providers,
        providersAddr
      } = await loadFixture(deployContractsFixcture);
      
      const signerAddr = signer2Addr as `0x${string}`;
      const prov = await provideLiquidity({deployer, signer: signer1, amount, asset: baseAsset, contract: providers, contractAddr: providersAddr, rate, signerAddr: signer1Addr});
      const { pool, } = await borrow({amount, contract:providers, flexpool, providersSlots: [prov.profile.slot], signer: signer2, signerAddr});
      expect(pool.pool.big.unit).to.be.eq(amount);
      expect(pool.pool.big.currentPool).to.be.eq(amount);
      expect(pool.pool.low.maxQuorum).to.be.eq(2n);
      expect(pool.pool.low.duration).to.be.eq(72n * 60n * 60n);
      expect(pool.pool.low.colCoverage).to.be.eq(120n);
    });
  })
})