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
} from "../../utilities";
import { createPermissionedPool } from "../../utils";

describe("Permissioned: CreatePool test", function () {
  async function deployContractsFixcture() {
    return { ...await deployContracts(ethers.getSigners) };
  }
  
    describe("Create a permissioned liquidity pool", function () {
        it("Should create pool successfully", async function () {
        const {
            baseAsset,
            flexpool,
            collateralAsset,
            collateralAssetAddr,
            signers : { signer1, signer2, signer3, deployer, signer1Addr, signer2Addr, signer3Addr },
        } = await loadFixture(deployContractsFixcture);

        const {
            balances, 
            pool: { 
                pool: {
                    addrs: { colAsset, safe, lastPaid, admin }, 
                    low: { colCoverage, duration, selector, allGh, }, 
                    big: { currentPool, unit, unitId},
                    router
                },
                cData: members
            },
            profile: { id },
            slot: { value: position, isAdmin, isMember}
        } = await createPermissionedPool(
            {
                asset: baseAsset,
                colCoverage: COLLATER_COVERAGE_RATIO,
                durationInHours: DURATION_IN_HOURS,
                factory: flexpool,
                intRate: INTEREST_RATE,
                signer: signer1,
                unitLiquidity: UNIT_LIQUIDITY,
                contributors: [signer1, signer2, signer3],
                deployer,
                collateralToken: collateralAsset
            }
        );

        const slot2 = await flexpool.getSlot(signer2Addr, unitId);
        const slot3 = await flexpool.getSlot(signer3Addr, unitId);
        const safeContract = await retrieveSafeContract(formatAddr(safe));
        const safeData = await safeContract.getData();

        // Assertions
        expect(safeData.aggregateFee).to.be.eq(ZERO);
        expect(safeData.totalClients).to.be.eq(1n);
        expect(colAsset).to.be.equal(collateralAssetAddr);
        expect(UNIT_LIQUIDITY).to.be.equal(unit);
        expect(safe === ZERO_ADDRESS).to.be.false;
        expect(admin).to.be.equal(signer1Addr, "Error: Admin is zero address");
        expect(balances?.collateral).to.be.equal(ZERO, `Error: Collateral asset balance is ${balances?.collateral.toString()}`); // XFI balance in safe should be zero.
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
        expect(members[1].profile.id).to.be.equal(signer2Addr);
        expect(members[2].profile.id).to.be.equal(signer3Addr);
        expect(id).to.be.equal(signer1Addr);

        expect(isAdmin).to.be.true;
        expect(isMember).to.be.true;

        // Slots
        expect(slot2.isAdmin).to.be.false;
        expect(slot3.isAdmin).to.be.false;
        expect(slot2.isMember).to.be.true;
        expect(slot3.isMember).to.be.true;
        expect(slot2.value).to.be.eq(1n);
        expect(slot3.value).to.be.eq(2n);
        expect(position).to.be.equal(ZERO);
        expect(router).to.be.equal(BigInt(Router.PERMISSIONED));
        
        const prof_2 = (await flexpool.getProfile(unit, signer2Addr)).profile;
        const prof_3 = (await flexpool.getProfile(unit, signer3Addr)).profile;

        // Equal address
        expect(prof_2.id).to.be.equal(signer2Addr);
        expect(prof_3.id).to.be.equal(signer3Addr);
        
        });
    })
})