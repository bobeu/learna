import { compareEqualString, bigintToStr, } from "../utilities";
import { deployContracts } from "../deployments";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Collateral Asset: This test is needed locally. Any standard ERC20 token can be used as collateral", function () {
  async function deployContractsFixcture() {
    const TOKEN_NAME = 'Simplfinance Token';
    const SYMBOL = 'TSFT';
    const TOTAL_SUPPLY = BigInt('1000000000') * BigInt(10 ** 18);
    const DECIMALS = 18;
    return { 
        ...await deployContracts(ethers.getSigners),
        TOKEN_NAME,
        SYMBOL,
        TOTAL_SUPPLY,
        DECIMALS
    };
  }

  describe("Asset Metadata", function () {
    it("Should set name correctly", async function () {
      const { collateralAsset, TOKEN_NAME} = await loadFixture(deployContractsFixcture);
      compareEqualString(await collateralAsset.name(), TOKEN_NAME);
    });
    
    it("Should set symbol correctly", async function () {
      const { collateralAsset, SYMBOL } = await loadFixture(deployContractsFixcture);
      compareEqualString(await collateralAsset.symbol(), SYMBOL);
    });

    it("Should set maxSupply correctly", async function () {
      const { collateralAsset, TOTAL_SUPPLY} = await loadFixture(deployContractsFixcture);
      let tSupply : bigint = await collateralAsset.totalSupply();
      compareEqualString(bigintToStr(tSupply), TOTAL_SUPPLY.toString());
    });

    it("Should set collateralAsset decimals correctly", async function () {
      const { collateralAsset, DECIMALS } = await loadFixture(deployContractsFixcture);
      expect(await collateralAsset.decimals()).to.equal(DECIMALS);
    });
  });
});


