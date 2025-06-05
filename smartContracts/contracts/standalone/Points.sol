// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { IPoint, Common } from "../interfaces/IPoint.sol";
import { ErrorLib } from "../libraries/ErrorLib.sol";
import { OnlyRoleBase } from "../peripherals/OnlyRoleBase.sol";

contract Points is IPoint, OnlyRoleBase {
    using ErrorLib for *;

    // Current Phase of the project at anytime
    Common.Phase public phase;

    // Mapping of unit contributors to Initializer struct
    mapping(address users => Initializer) private initializer;

    /**
     * @dev Mapping showing users rewards for all phases
     */
    mapping(Common.Phase => Common.Point[]) private points;

    // =========== Constructor ===================
    constructor(address _roleManager) OnlyRoleBase(_roleManager) {} 

    /**
     * @dev Returns the point
     * @param user : Contributor
    */
    function _getPoint(address user, uint8 _phase) internal view returns(Common.Point memory point){
        Initializer memory init = initializer[user];
        if(init.isRegistered) {
            point = points[Common.Phase(_phase)][init.location];
        }
        return point;
    }

    /**
     * @dev Returns the point
     * See _getPoint
    */
    function getPoint(address user, uint8 _phase) external view returns(Common.Point memory){
        if(_phase >= 3) 'Invalid phase'._throw();
        return _getPoint(user, _phase);
    }

    /**
     * @dev Register user to earn points for the current phase
     * @notice Users automatically earn free 5 points for signing up
     */
    function registerToEarnPoints() public {
        address sender = _msgSender();
        Common.Phase _phase = phase;
        Initializer memory init = initializer[sender];
        if(init.isRegistered) 'User is registered'._throw();
        init.isRegistered = true;
        init.location = points[_phase].length;
        initializer[sender] = init;
        points[_phase].push( Common.Point(0, 0, 5, sender, _phase));
        
    } 

    /**
     * @dev Update points for the target user for the current phase if they are already initialized otherwise create a new spot for them. 
     * @param user : Unit contribution
     * @param contributor : Point for contributing;
     * @param creator : Point earned as a pool creator
     * @param referrals : Point earned from referrals system
     * @notice Function will always use the current phase
    */
    function setPoint(
        address user, 
        uint8 contributor,
        uint8 creator,
        uint8 referrals
    ) external onlyRoleBearer returns(bool) {
        Initializer memory init = initializer[user];
        if(init.isRegistered) {
            Common.Point memory point = points[phase][init.location];
            assert(user == point.user);
            unchecked {
                if(contributor > 0) points[phase][init.location].contributor = point.contributor + contributor;
                if(creator > 0) points[phase][init.location].creator = point.creator + creator;
                if(referrals > 0) points[phase][init.location].referrals = point.referrals + referrals;
            }
        }
        return true;
    }

    /**
     * @dev Update points for the target user for the current phase if they are already initialized otherwise create a new spot for them. 
     * @param user : Unit contribution
     * @param contributor : Point for contributing;
     * @param creator : Point earned as a pool creator
     * @param referrals : Point earned from referrals system
     * @notice Function will always use the current phase
    */
    function deductPoint( 
        address user, 
        uint8 contributor,
        uint8 creator,
        uint8 referrals
    ) external onlyRoleBearer returns(bool) {
        Initializer memory init = initializer[user];
        Common.Phase _phase = phase;
        if(init.isRegistered) {
            Common.Point memory point = points[_phase][init.location];
            assert(user == point.user);
            unchecked {
                if(contributor > 0 && point.contributor > contributor) points[_phase][init.location].contributor =  point.contributor - contributor;
                if(creator > 0 && point.creator > creator) points[_phase][init.location].creator = point.creator - creator;
                if(referrals > 0 && point.referrals > referrals) points[_phase][init.location].referrals = point.referrals - referrals;
            }
        }
        return true;
    }

    function _getKeys() internal pure returns(string[3] memory){
        return ['beta', 'alpha', 'mainnet'];
    }

    // Retrieve the points from in storage
    function getPoints() public view returns(Common.PointsReturnValue[] memory) {
        string[3] memory keys = _getKeys();
        Common.PointsReturnValue[] memory _points = new Common.PointsReturnValue[](keys.length);
        for(uint i = 0; i < keys.length; i++) {
            _points[i] = Common.PointsReturnValue({
                key: keys[i],
                value: points[Common.Phase(i)]
            });
        }
        
        return _points;
    }

    // Retrieve the points array in storage
    function getPhase() external view returns(string memory) {
        uint8 _phase = uint8(phase);
        string[3] memory keys = _getKeys(); 
        return keys[_phase];
    }

    /// @dev Move to the next phase. Only rolebearer function
    function switchPhase() public onlyRoleBearer returns(bool) {
        uint8 selector = uint8(phase);
        if(selector < 3) {
            phase = Common.Phase(selector + 1);
        } else {
            'Max phase achieved'._throw();
        }
        return true;
    }
}