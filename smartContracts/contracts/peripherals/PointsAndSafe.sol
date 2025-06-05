// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { IPoint } from "../interfaces/IPoint.sol";
import { Common } from "../interfaces/Common.sol";
import { ISafeFactory } from "../interfaces/ISafeFactory.sol";
import { MinimumLiquidity } from "./MinimumLiquidity.sol";

/**
 * @title AwardPoint contract rewards users for their participation only if they had register to earn points in the Points contract 
 * @author : Bobeu - https://github.com/bobeu
 * @notice Users must opt in to earn reward before their points can reflect.
 * 
 * ERROR CODE
 * =========
 * A1 - Safe factory address parsed to the constructor is zero
 * A2 - Safe creation failed
 */
abstract contract PointsAndSafe is MinimumLiquidity {
    // Whether to award point to users or not
    bool private awardPoint;
    
    // Safe factory contract
    ISafeFactory private safeFactory;

    /**
     * ================ Constructor ==============
     */
    constructor(
        address _stateManager, 
        address _roleManager, 
        address _safeFactory,
        uint _minmumLiquidity
    ) 
        MinimumLiquidity(_stateManager, _roleManager, _minmumLiquidity)
    { 
        require(_safeFactory != address(0), 'A1');
        awardPoint = true;
        safeFactory = ISafeFactory(_safeFactory); 
    }

    ///@dev Award points for users
    function _awardPoint(address target, uint8 asMember, uint8 asAdmin, bool deduct) internal {
        IPoint pointFactory = _getVariables().pointFactory;
        bool done;
        if(awardPoint) done = deduct? pointFactory.deductPoint(target, asMember, asAdmin, 0) : pointFactory.setPoint(target, asMember, asAdmin, 0);
        
        require(done); 
    }

    /// @dev Activate reward
    function toggleReward() public onlyRoleBearer returns(bool) {
        awardPoint? awardPoint = false : awardPoint = true;
        return true;
    }
    
    /**
        * @dev Checks, validate and return safe for the target unit.
        * @param unit : Unit contribution.
    */
    function _getSafe(uint256 unit) internal returns(address safe) {
        safe = safeFactory.pingSafe(unit);
        require(safe != address(0), 'A2');
    }

    function getAwardPointStatus() public view returns(bool result) {
        result = awardPoint;
    }
 
}
