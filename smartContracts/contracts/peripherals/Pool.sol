// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

// import "hardhat/console.sol";
import { Contributor, Common, IERC20 } from "./Contributor.sol";
import { ISafe } from "../interfaces/ISafe.sol";

/**
 * ERROR CODE
 * 3 - Invalid duration
 * 4 - Invalid list
 * 5 - Minimum of two participants
 * 6 - Admin not in list
 * 7 - Admin appeared twice
 * 8 - Stage not ready
 * 8+ - Adding user to safe failied
 */

abstract contract Pool is Contributor {
    // ================ Constructor ==============
    constructor(
        address stateManager, 
        address roleManager, 
        address _safeFactory,
        uint _minmumLiquidity
    )
        Contributor(stateManager, roleManager, _safeFactory, _minmumLiquidity)
    {}

    /**
     * @dev Create a pool internally
     * @param args : Parameters
     * @param args.users : Participants
     * @param args.unit : Unit contribution
     * @param args.maxQuorum : Maximum number of contributors that can participate
     * @param args.durationInHours : Maximum duration in hours each borrower can retain the loan
     * @param args.colCoverage : Ration of collateral coverage or index required as cover for loan
     * @param args.router : Router : PERMISSIOLESS or PERMISSIONED
     * @param args.sender : msg.sender
    */
    function _createPool(
        Common.CreatePoolParam memory args
    ) 
        internal
        _requireUnitIsNotActive(args.unit) 
        onlySupportedAsset(args.colAsset) 
        returns(Common.Pool memory pool) 
    {
        require(args.durationInHours > 0 && args.durationInHours <= 720, '3');
        if(args.router == Common.Router.PERMISSIONLESS){
            require(args.users.length == 1, '4');
        } else {
            require(args.users.length >= 2, '5');
        } 
        require(args.sender == args.users[0], '6');
        (uint96 unitId, uint96 recordId) = _generateIds(args.unit);
        pool = _updatePool(Common.UpdatePoolData(args.unit, unitId, recordId, args.maxQuorum, args.colCoverage, IERC20(args.colAsset), args.durationInHours, args.users[0], args.router));   
        pool = _addUserToPool(args.users, pool);
        _setPool(pool, unitId);
        _completeAddUser(args.users[0], pool);
    }

    /**
     * @dev Add users to newly created pool
     * @param users : List of contributors to add
     * @param pool : Pool data. Must be an existing data relating to the unit contribution
     */
    function _addUserToPool(
        address[] memory users,
        Common.Pool memory pool 
    ) internal returns(Common.Pool memory _pool) {
        for(uint i = 0; i < users.length; i++) {
            Common.ContributorReturnValue memory data;
            if(i == 0) {
                data = _initializeContributor(pool, users[i], true, true, true);
            } else {
                require(users[0] != users[i], '7');
                data = _initializeContributor(pool, users[i], false, true, false);
            }
            _setContributor(data.profile, pool.big.unitId, uint8(data.slot.value), false);
        }
        _pool = pool;
    }

    /**
        * @dev Add user to existing pool
        * @param unit : Unit contribution
        * @param user : Contributors to add
        * @param pool : Pool data. Must be an existing data relating to the unit contribution
    */
    function _joinAPool(
        uint256 unit, 
        address user,
        Common.Pool memory pool
    ) internal _requireUnitIsActive(unit) returns(Common.Pool memory _pool) {
        require(pool.stage == Common.Stage.JOIN, '8');
        Common.ContributorReturnValue memory data;
        unchecked {
            pool.big.currentPool += pool.big.unit;
            pool.low.userCount += 1;
        }
        if(pool.router == Common.Router.PERMISSIONED) {
            _checkStatus(user, unit, true);
            data = _getContributor(user, unit);
            data.profile.sentQuota = true;
        } else {
            _checkStatus(user, unit, false);
            data = _initializeContributor(pool, user, false, true, true);
        }
        _setContributor(data.profile, pool.big.unitId, uint8(data.slot.value), false);
        if(_isPoolFilled(pool, pool.router == Common.Router.PERMISSIONED)) {
            _setTurnStartTime(address(0), unit, _now());
            pool.stage = Common.Stage.GET;
        }
        _pool = pool;
        _completeAddUser(user, pool);
    }
    
    /**
        * @dev Complete the add task.
        * @param user : Contributors to add
        * @param pool : Pool data. Must be an existing data relating to the unit contribution
    */
    function _completeAddUser(address user, Common.Pool memory pool) internal {
        _checkAndWithdrawAllowance(IERC20(_getVariables().baseAsset), user, pool.addrs.safe, pool.big.unit);
        require(ISafe(pool.addrs.safe).addUp(user, pool.big.recordId), '8+'); 
    }

    /**
     * @dev Update pool with relevant data
     * @param data : Function argument of type Common.UpdatePoolData
     */
    function _updatePool(Common.UpdatePoolData memory data) internal returns(Common.Pool memory pool) {
        unchecked {
            pool.low = Common.Low(data.maxQuorum, 0, data.colCoverage, uint32(uint(data.durationInHours) * 1 hours), 0, 1);
        }
        pool.big = Common.Big(data.unit, data.unit, data.recordId, data.unitId);
        pool.addrs = Common.Addresses(data.colAsset, address(0), _getSafe(data.unit), data.creator);
        pool.router = data.router;
        pool.status = Common.Status.TAKEN;
        pool.stage = Common.Stage.JOIN;
    }

    /**
     * Returns the current debt of target user.
     * @param unit : Unit contribution
     */
    function getCurrentDebt(uint256 unit, address target) public view returns(uint256 debt) 
    {
       (debt,) = _getCurrentDebt(unit, target);
       return debt;
    }

}
