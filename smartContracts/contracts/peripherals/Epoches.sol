// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

/**
 * @title : Epoches contract
 * @author : Bobeu - Simplifinance - https://github.com/bobeu
 * @notice It is a base contract manages push and retrieval actions on pools in storage.
 * 
 * ERROR CODE
 * =========
 * 1 - Unit is active
 * 2 - Unit is inactive
 */

import { Common } from "../interfaces/Common.sol";
import { Counters } from "@thirdweb-dev/contracts/external-deps/openzeppelin/utils/Counters.sol";

abstract contract Epoches {
    using Counters for Counters.Counter;

    // Current pool counter
    Counters.Counter private currentCounter;

    // Past pool counter
    Counters.Counter private recordCounter;

    /**
     * Mapping holding two storage branches. Common.Branch.CURRENT => unitId returns a mapped value of type Common.Pool while
     * Common.Branch.RECORD => recordId returns a mapped value of type Pool. The difference is that one is a past pool while the 
     * other returns a active pool 
    */ 
    mapping(Common.Branch => mapping(uint96 unitOrRecordId => Common.Pool)) private pools;
 
    /**
     * @dev Mapping of unit contribution to unit Ids
     * For every unit amount of contribution, there is a corresponding index for retrieving the pool object from the storage.
     */
    mapping(uint256 unitContribution => uint96) private ids; 

    /**
     * @dev Ensure the contribution unit is active. 
     * @notice When unit is not active, it can be relaunched. 
    */
    modifier _requireUnitIsActive(uint unit){
        require(_isUnitActive(unit), '2');
        _;
    }

    /**
     *  @dev Add a completed pool to history 
     * @param pool : Pool object to push to storage
    */
    function _setRecord(Common.Pool memory pool) internal {
        pools[Common.Branch.RECORD][pool.big.recordId] = pool;
    }

    /**
     * @dev Verify that the contribution unit is not active. 
     * @notice When unit is not active, it can be relaunched. 
    */
    modifier _requireUnitIsNotActive(uint unit){
        require(!_isUnitActive(unit), '1');
        _;
    }

    /**
        * @dev Ensure that unit contribution is active.
        * Every unit contribution has a corresponding and unique id called unitId.
        * When a unitId equals zero mean it is not active
    */
    function _isUnitActive(uint unit) internal view returns(bool result){
        result = pools[Common.Branch.CURRENT][_getUnitId(unit)].status == Common.Status.TAKEN; 
    }

    /**
     * @dev Fetch unit id/index
     * @param unit : Unit contribution
     */
    function _getUnitId(uint unit) internal view returns(uint96 _unitId) {
        _unitId = ids[unit];
    }

    /** 
     * @dev Generate a new unit Id
     * @param unit : Unit contribution
     * @notice When a pool is created, we generate a unitId and a recordId. Unit Id can be used to access the pool directly
     * from the activePools storage reference while recordId can be used to retrieve the past pool. Since every unit contribution can 
     * have a unique id assigned to them, to avoid collision and data loss, we generate a slot stored in each pool object ahead before the epoch is
     * completed. So at any point in time, a completed pool can be retrieved using its corresponding recordId while an active pool maintains a 
     * unique unit Id
     */
    function _generateIds(uint unit) internal returns(uint96 unitId, uint96 recordId) {
        currentCounter.increment(); 
        (unitId, recordId) = _getCounters();
        recordCounter.increment();
        ids[unit] = unitId;
    }

    /**
     * @dev Return both the current and past pool counters
     */
    function _getCounters() internal view returns(uint96 activePoolCounter, uint96 pastPoolCounter) {
        (activePoolCounter, pastPoolCounter) = (uint96(currentCounter.current()), uint96(recordCounter.current()));
    }

    /**
     * @dev Fetch current pool with unit contribution
     * @param unit : Unit contribution
     */
    function _getPool(uint unit) internal view returns(Common.Pool memory result) {
        result = _getPoolWithUnitId(_getUnitId(unit));
    }

    /**
     * @dev Update pool in storage
     * @param pool : Pool object
     * @param unitId : Unit Id
     */    
    function _setPool(Common.Pool memory pool, uint96 unitId) internal {
        pools[Common.Branch.CURRENT][unitId] = pool;
    }

    /**
     * @dev Fetch Current pool with unitId
     * @param unitId : Unit Id
     */
    function _getPoolWithUnitId(uint96 unitId) internal view returns(Common.Pool memory result){
        result = pools[Common.Branch.CURRENT][unitId];
    }

    /**
     * @dev Fetch Current pool with unitId
     * @param recordId : Unit Id
     */
    function _getPoolWithRecordId(uint96 recordId) internal view returns(Common.Pool memory result){
        result = pools[Common.Branch.RECORD][recordId];
    }

    /**
     * @dev Shuffle pools i.e move the current pool to history and reset it 
     * @param pool : Current pool
     */ 
    function _shufflePool(Common.Pool memory pool) internal {
        Common.Pool memory empty = pools[Common.Branch.CURRENT][0];
        _setPool(empty, pool.big.unitId);
        _setRecord(pool);
    }

    /**@dev Check if pool is filled
        * @dev Msg.sender must not be a member of the band at epoch Id before now.
        * @param pool: Pool struct (Location: Memory)
        * @notice : Be sure to wrap this function in an uncheck block
    */
    function _isPoolFilled(Common.Pool memory pool, bool isPermissioned) 
        internal 
        pure
        returns(bool filled) 
    {
        unchecked {
            filled = !isPermissioned? pool.low.userCount == pool.low.maxQuorum : pool.big.currentPool == (pool.big.unit * pool.low.maxQuorum);
        }
    }

    /**@dev Sets new last paid */
    function _setLastPaid(address to, uint unit) internal {
        pools[Common.Branch.CURRENT][_getUnitId(unit)].addrs.lastPaid = to; 
    }


}