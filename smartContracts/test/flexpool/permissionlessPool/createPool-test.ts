import { deployContracts, retrieveSafeContract } from "../../deployments";
import { loadFixture, } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { 
  UNIT_LIQUIDITY,
  ZERO_ADDRESS,
  COLLATER_COVERAGE_RATIO,
  DURATION_IN_HOURS,
  ZERO,
  INTEREST_RATE,
  formatAddr,
  DURATION_IN_SECS,
  Router,
  QUORUM,
} from "../../utilities";
import { createPermissionlessPool } from "../../utils";

describe("Permissionless: CreatePool test", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }

    describe("Create a permissionless liquidity pool", function () {
        it("Should create pool successfully", async function () {
            const {
                baseAsset,
                flexpool,
                collateralAsset,
                collateralAssetAddr,
                signers : { signer1, deployer, signer1Addr },
            } = await loadFixture(deployContractsFixcture);

            const {
                balances, 
                pool: { 
                    pool: {
                        addrs: { colAsset, safe, lastPaid, admin }, 
                        low: { colCoverage, duration, selector, allGh, }, 
                        big: { currentPool, unit},
                        router
                    },
                    cData: members
                },
                profile: { id },
                slot: { value: position, isAdmin, isMember}
            } = await createPermissionlessPool(
                {
                    asset: baseAsset,
                    colCoverage: COLLATER_COVERAGE_RATIO,
                    durationInHours: DURATION_IN_HOURS,
                    factory: flexpool,
                    intRate: INTEREST_RATE,
                    quorum: QUORUM,
                    signer: signer1,
                    unitLiquidity: UNIT_LIQUIDITY,
                    deployer,
                    collateralToken: collateralAsset
                }
            );

            const safeContract = await retrieveSafeContract(formatAddr(safe));
            const safeData = await safeContract.getData();
            // Assertions
            expect(safeData.aggregateFee).to.be.eq(ZERO);
            expect(safeData.totalClients).to.be.eq(1n);

            expect(UNIT_LIQUIDITY).to.be.equal(unit);
            expect(safe === ZERO_ADDRESS).to.be.false;
            expect(admin).to.be.equal(signer1Addr, "Error: Admin is zero address");
            expect(colAsset).to.be.equal(collateralAssetAddr);
            expect(balances?.collateral).to.be.equal(ZERO, `Error: xfi balance is ${balances?.collateral.toString()}`); // XFI balance in bank should be zero.
            expect(balances?.base).to.be.equal(UNIT_LIQUIDITY, `Error: ERC20 balance is ${balances?.base.toString()} as against ${UNIT_LIQUIDITY.toString()}`); // ERC20 balance in this epoch should correspond to the liquidity supplied.
            expect(lastPaid).to.be.equal(ZERO_ADDRESS, "Error: lastpaid was not zero address");

            expect(currentPool).to.be.equal(UNIT_LIQUIDITY);
            expect(colCoverage).to.be.equal(COLLATER_COVERAGE_RATIO);
            expect(duration.toString()).to.be.equal(DURATION_IN_SECS.toString());
            expect(allGh).to.be.equal(ZERO);
            expect(selector).to.be.equal(ZERO);
            
            const prof_1 = (await flexpool.getProfile(unit, signer1Addr)).profile;
            expect(prof_1.id).to.be.equal(signer1Addr);
            expect(members[0].profile.id).to.be.equal(signer1Addr);
            expect(id).to.be.equal(signer1Addr);
            expect(isAdmin).to.be.true;
            expect(isMember).to.be.true;
            expect(position).to.be.equal(ZERO);
            expect(router).to.be.equal(BigInt(Router.PERMISSIONLESS));
        });
    })
})