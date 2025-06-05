// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { Epoches, Common } from "./Epoches.sol";
import { Slots } from "./Slots.sol" ;
import { Utils } from "../libraries/Utils.sol";
import { PointsAndSafe } from "./PointsAndSafe.sol";
import { ISafe } from "../interfaces/ISafe.sol";
import { IERC20 } from "../interfaces/IERC20.sol";
import { IStateManager } from "../interfaces/IStateManager.sol";
// import "hardhat/console.sol";

/**
 * ERROR CODE
 * ==========
 * 9 -  Not member
 * 10 - Not allowed
 * 11 - No debt
 * 12 - No User
 * 13 - Payback failed
 */
abstract contract Contributor is Epoches, Slots, PointsAndSafe {
    using Utils for *;

    /**
     * @dev Mapping of unitId to contributors
     * @notice We used record Id to index the contributors in a pool while a unit contribution
     * van have multiple records, it makes sense to track contributors in each pool with their record Id
    */
    mapping(uint => Common.Contributor[]) private contributors;

    /**
     * @dev Mapping of unit ids to contributors to array of providers
     * @notice Each contributor maintain a list of providers they borrow from
     */
    mapping(uint => mapping(address => Common.Provider[])) private unitProviders;

    // ============= constructor ============
    constructor(
        address _stateManager, 
        address _roleManager, 
        address _safeFactory,
        uint _minmumLiquidity
        ) 
    PointsAndSafe(
        _stateManager, 
        _roleManager, 
        _safeFactory, 
        _minmumLiquidity
    )
    {} 

    /**
     * @dev Only contributor in a pool is allowed
     * @param target : Target
     * @param unit : Unit Contribution
    */
    function _checkStatus(address target, uint256 unit, bool value) internal view {
        bool isMember = _getSlot(target, _getUnitId(unit)).isMember;
        value? require(isMember, '9') : require(!isMember, '10');
    }

    /**
     * @dev returns target's profile status in a pool
     * @param target : Target account
     * @param unit : Unit contribution
     */
    function _getContributor(
        address target, 
        uint unit
    ) internal view returns(Common.ContributorReturnValue memory result) {
        uint unitId = _getUnitId(unit); 
        result.slot = _getSlot(target, unitId); 
        result.profile = contributors[unitId][result.slot.value];
        result.providers = _getContributorProviders(target, unitId);
    }

    /**
     * @dev Return providers associated with the target account
     * @param target : Target account
     * @param unitId : Record id
     */
    function _getContributorProviders(address target, uint unitId) internal view returns(Common.Provider[] memory result){
        result = unitProviders[unitId][target];
    }

    /**
     * @dev returns user's profile status in a pool
     * @param unit : Unit contribution
     */
    function _getExpected(uint256 unit, uint8 selector) internal view returns(Common.Contributor memory _expected) {
        _expected = contributors[_getUnitId(unit)][selector];
    }

    /** 
     * @dev Update the provider list of a contributor
     * @param providers : List of providers
     * @param user : Target user
     * @param unitId : Record Id
     */
    function _setProviders(
        Common.Provider[] memory providers, 
        address user, 
        uint unitId
    ) internal {
        for(uint i = 0; i < providers.length; i++){
            unitProviders[unitId][user].push(providers[i]);
        }
    } 

    /**
     * @dev Set user's time to get finance
     * @param user : Target address
     * @param unit : Unit contribution
     * @param date : Date/timestamp
     * @notice If 'user' is zero address, we generate a new slot otherwise fetch existing slot
     */ 
    function _setTurnStartTime(address user, uint256 unit, uint32 date) internal {
        uint position;
        if(user == address(0)){
            position = _getPool(unit).low.selector;
            user = _getExpected(unit, uint8(position)).id;
        } else {
            position = _getSlot(user, _getUnitId(unit)).value;
        }
        contributors[_getUnitId(unit)][position].turnStartTime = date;
     }

    /**
     * @dev Add or update contributor to the list of contributors
     * @param profile : Target profile
     * @param position : The position of target user in the list
     * @param unitId : Unit Id
     */
    function _setContributor(Common.Contributor memory profile, uint unitId, uint8 position, bool setEmpty) internal {
        Common.Contributor memory empty;
        contributors[unitId][position] = setEmpty? empty : profile;
    }

    /**
     * @dev Add contributor data to storage
     * @param pool : Pool struct
     * @param target : Target user
     * @param isAdmin : Whether user is the creator or not
     * @param isMember : Whether user is a member or not
     * @param sentQuota : Whether user have sent their quota of the contribution or not
     */
    function _initializeContributor(
        Common.Pool memory pool, 
        address target,
        bool isAdmin,
        bool isMember,
        bool sentQuota            
    ) internal returns(Common.ContributorReturnValue memory data) {
        data.slot.value = contributors[pool.big.unitId].length;
        _createSlot(target, pool.big.unitId, uint8(data.slot.value), isAdmin, isMember);
        contributors[pool.big.unitId].push(); 
        data.profile.id = target; 
        data.profile.sentQuota = sentQuota;
    }

    /**
     * @dev Remove contributor from a pool
     * @param target : Target address
     * @param unit : Unit contribution
     * @notice Parsing true to _setSlot as the last argument with set the slot to empty
     */
    function _removeContributor(address target, uint256 unit) internal {
        uint unitId = _getUnitId(unit);
        _setSlot(target, unitId, _getSlot(target, unitId), true); 
    }
 
    /**
     * @dev Swaps contributors data if the expected caller is not the same as the actual caller
     * and the grace period has elapsed.
     * @param unit : Unit contribution
     * @param actual : Actual calling account
     * @param expectedSlot : Slot of expected calling account
     * @param expectedData : Data of expected calling account
     */
    function _swapContributors(
        uint256 unit,
        address actual,
        Common.Slot memory expectedSlot,
        Common.Contributor memory expectedData
    )
        internal
        returns(Common.Contributor memory actualData) 
    {
        _checkStatus(actual, unit, true);
        uint unitId = _getUnitId(unit);
        Common.Slot memory actualSlot = _getSlot(actual, unitId);
        actualData = _getContributor(actual, unit).profile;
        _setSlot(actual, unitId, expectedSlot, false);
        _setSlot(expectedData.id, unitId, actualSlot, false);
        expectedData.id = actual; 
        actualData.id = expectedData.id;
        _setContributor(expectedData, unitId, uint8(expectedSlot.value), false);
        _setContributor(actualData, unitId, uint8(actualSlot.value), false);
    }

    /**
     * @dev Complete the getFinance task
     * @param pool : Existing pool. Must not be an empty pool.
     * @param collateral : Expected collateral
     * @param profile : User's profile data
     */
    function _completeGetFinance(Common.Pool memory pool, uint collateral, Common.Contributor memory profile) internal returns(Common.Pool memory _pool, Common.Contributor memory _profile) {
        pool.low.selector ++;
        unchecked {
            profile.paybackTime = _now() + pool.low.duration;
        }
        profile.colBals = collateral;
        profile.loan = pool.big.currentPool;
        Common.Provider[] memory providers = unitProviders[pool.big.unitId][pool.addrs.lastPaid];
        for(uint i = 0; i < providers.length; i++){
            unitProviders[pool.big.unitId][pool.addrs.lastPaid][i].earnStartDate = _now();
            unitProviders[pool.big.unitId][pool.addrs.lastPaid][i].accruals = providers[i].amount.computeInterestsBasedOnDuration(uint16(providers[i].rate), pool.low.duration);
        }
        pool.big.currentPool = 0;
        pool.stage = Common.Stage.PAYBACK;
        _pool = pool;
        _profile = profile;
    }

    /**
     * @dev Payback loan
     * @param unit : Unit contribution
     * @param payer : Contributor
     * @param isSwapped : Whether there was swapping or not. Often swapping will happen when a contributor defaults
     * @param defaulter : The defaulter account
     */
    function _payback(
        uint unit, 
        address payer,
        bool isSwapped,
        address defaulter
    ) 
        internal
        _requireUnitIsActive(unit)
        returns(Common.Pool memory _pool)
    { 
        (uint debt, Common.Pool memory pool) = _getCurrentDebt(unit, payer);
        require(debt > 0, '11');
        uint slot = _getSlot(pool.addrs.lastPaid, pool.big.unitId).value;
        contributors[pool.big.unitId][slot].loan = 0;
        contributors[pool.big.unitId][slot].colBals = 0;
        contributors[pool.big.unitId][slot].paybackTime = _now();
        if(getAwardPointStatus()) _awardPoint(pool.addrs.lastPaid, 2, 0, false);
        if(pool.low.maxQuorum == pool.low.allGh){
            pool.stage = Common.Stage.ENDED;
            _shufflePool(pool);
        } else {
            contributors[pool.big.unitId][pool.low.selector].turnStartTime = _now();
            pool.stage = Common.Stage.GET;
            unchecked {
                pool.big.currentPool = pool.big.unit * pool.low.maxQuorum;
            }
            _setPool(pool, pool.big.unitId);
        }
        IStateManager.StateVariables memory stm = _getVariables();
        uint attestedInitialBal = stm.baseAsset.balanceOf(pool.addrs.safe);
        _checkAndWithdrawAllowance(stm.baseAsset, payer, pool.addrs.safe, debt);
        require(
            ISafe(pool.addrs.safe).payback(
                Common.Payback_Safe(payer, stm.baseAsset, debt, attestedInitialBal, pool.low.maxQuorum == pool.low.allGh, contributors[pool.big.unitId], isSwapped, defaulter, pool.big.recordId, pool.addrs.colAsset, stm.assetManager.isWrappedAsset(address(pool.addrs.colAsset)), _getContributorProviders(payer, pool.big.unitId)),
                unit
            )
            ,
            '13'    
        );
        _pool = pool;
    }

    /**
     * @dev Return current pools with its contributors using unitId. 
     * @notice For every unit contribution, the unit Id is unique to another and does not change
     * @param unitId: UnitId 
    */
    function getPoolData(uint96 unitId) public view returns(Common.ReadPoolDataReturnValue memory result) {
        result = _getPoolData(_getPoolWithUnitId(unitId));
        return result;
    }
 
    function _getPoolData(Common.Pool memory pool) internal view returns(Common.ReadPoolDataReturnValue memory result) {
        result.pool = pool;
        Common.Contributor[] memory participants = contributors[result.pool.big.unitId];
        Common.ContributorReturnValue[] memory data = new Common.ContributorReturnValue[](participants.length);
        if(result.pool.big.unit > 0) {
            for(uint i = 0; i < participants.length; i++) {
                address target = participants[i].id;
                data[i] = _getContributor(target, result.pool.big.unit);
            }
        }
        result.cData = data;
        // return result;
    }

    /**
    * @dev Return past pools
    */
    function getRecords() public view returns(Common.ReadPoolDataReturnValue[] memory result) {
        (,uint96 size) = _getCounters();
        Common.ReadPoolDataReturnValue[] memory rdrs = new Common.ReadPoolDataReturnValue[](size);
        for(uint96 i = 0; i <size; i++) {
            rdrs[i] = _getPoolData(_getPoolWithRecordId(i));
        }
        result = rdrs;
    }

    /**
     * @dev Returns the profile of target
     * @param unit : unit contribution
     * @param target : User
     */
    function getProfile(
        uint256 unit,
        address target
    )
        public
        view
        // onlyInitialized(unit, false)
        returns(Common.ContributorReturnValue memory) 
    {
        return _getContributor(target, unit);
    }

    function _replaceContributor(address liquidator, uint unitId, Common.Slot memory slot, address _defaulter) internal {
        Common.Provider[] memory providers = unitProviders[unitId][_defaulter];
        if(providers.length > 0) {
            unitProviders[unitId][liquidator] = unitProviders[unitId][_defaulter];
            delete unitProviders[unitId][_defaulter];
        }
        contributors[unitId][slot.value].id = liquidator;
        _setSlot(liquidator, unitId, slot, false);
        _setSlot(_defaulter, unitId, slot, true);
    }

    /**
     * Returns the current debt of last paid acount i.e the contributor that last got finance
     * @param unit : Unit contribution
     * @param currentUser : Account for whom to query debt
     * @notice For every contributor that provide liquidity through providers, they are required to 
     * pay interest in proportion to the providers' rate. Every other contributors in the same pool 
     * will pay interest to the same set of providers but the interest will be halved.
     */
    function _getCurrentDebt(uint unit, address currentUser) internal view returns (uint256 debt, Common.Pool memory pool) {
        pool = _getPool(unit);
        require(currentUser != address(0), '12');
        Common.Contributor[] memory profiles = contributors[pool.big.unitId];
        if(_getSlot(currentUser, pool.big.unitId).isMember){ 
            if(profiles.length > 0) {
                for(uint i = 0; i < profiles.length; i++){
                    Common.ContributorReturnValue memory data = _getContributor(profiles[i].id, unit);
                    if(data.profile.id == currentUser) {
                        debt += data.profile.loan;
                    }
                    if(data.providers.length > 0) {
                        for(uint j = 0; j < data.providers.length; j++){
                            unchecked { 
                                debt += data.providers[j].accruals.fullInterest;
                            }
                        }
                    }
                }
            }
        }
    }

      /**
   * @dev Return struct object with data if current beneficiary has defaulted otherwise an empty struct is returned.
   * @param unit: Unit contribution
   */
    function _enquireLiquidation(uint unit) 
        internal 
        view 
        returns (Common.Contributor memory _profile, bool isDefaulted, Common.Slot memory slot) 
    {
        Common.Pool memory pool = _getPool(unit);
        assert(pool.addrs.lastPaid != address(0));
        Common.ContributorReturnValue memory _default = _getContributor(pool.addrs.lastPaid, unit);
        if(_now() > _default.profile.paybackTime) {
            assert(pool.addrs.lastPaid == _default.profile.id);
            (_profile, isDefaulted, slot) = (_default.profile, true, _default.slot);
        } 
    }

    /**
        * @dev Check liquidation opportunity in the pool
        * @param unit : Unit contribution
    */
    function enquireLiquidation(uint unit) public view returns(Common.Contributor memory profile, bool defaulter, Common.Slot memory slot) {
        return _enquireLiquidation(unit);
    }

    function _now() internal view returns(uint32 time) {
        time = uint32(block.timestamp);
    }
    
}