// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { ILearna } from "./interfaces/ILearna.sol";
import { Admins } from "./Admins.sol";
import { IGrowToken } from "./interfaces/IGrowToken.sol";

abstract contract Week is ILearna, Admins {

    /// @dev  Other state variables
    State private state;

    ///@notice Platform token 
    IGrowToken internal token;

    ///@notice Claim address
    address public claim;

    /// @dev Claim deadlines
    mapping(uint => uint96) private claimDeadlines;

    ///@dev Mapping that shows whether user has claimed reward for a specific week or not
    mapping(address user => mapping(uint week => mapping(bytes32 => bool))) internal isClaimed;

    /**@dev Set claimed status for a user
     * @param user : User address
     * @param weekId : Week Id
     * @param hash_ : Hash of the claim
     */
    // function _setIsClaimed(address user, uint weekId, bytes32 hash_) internal whenNotPaused onlyApproved() {
    function _setIsClaimed(address user, uint weekId, bytes32 hash_) internal {
        if(!isClaimed[user][weekId][hash_]) isClaimed[user][weekId][hash_] = true;
    }

    /**
        * @notice This function checks if a user has claimed their reward for a specific week.
        * @dev It returns true if the user has claimed the reward, false otherwise.
        * @param user : User address
        * @param weekId : Week Id
        * @return bool : True if user has claimed reward for the week, false otherwise
     */
    function hasClaimed(address user, uint weekId, bytes32 hash_) external view returns(bool) {
        return isClaimed[user][weekId][hash_];
    }

    function _getDeadline(uint weekId) internal view returns(uint96 deadline) {
        deadline = claimDeadlines[weekId];
    }
    
    /**
     * @dev Set claim deadline
     * @param weekId : Week Id
     * @param deadline : New deadline
     */
    function _setClaimDeadline(uint weekId, uint96 deadline) internal {
        claimDeadlines[weekId] = deadline;
    }

    /** 
     * @dev Update minimum token
     * @param minToken : New minimum payable token
     */
    function _setMinimumToken(uint minToken) internal {
        state.minimumToken = minToken;
    }

    /**
     * @dev Set approval for target
     * @param newClaim : Account to set approval for
     */
    function setClaimAddress(address newClaim) public onlyOwner returns(bool) {
        claim = newClaim;
        return true;
    }

    /**
     * @dev Update minimum token - onlyOwner
     * @param minToken : New minimum payable token
     */
    function setMinimumToken(uint minToken) public onlyOwner {
        _setMinimumToken(minToken);
    }

    /**
     * @dev Update transition interval
     * @param intervalInMin : New interval
     * @param pastWeek : Week Id
     */
    function _setTransitionInterval(uint32 intervalInMin, uint pastWeek) internal {
        if(intervalInMin > 0) {
            unchecked {
                uint64 newInterval = intervalInMin * 1 minutes;
                uint64 transitionDate = _now() + newInterval;
                state.transitionInterval = newInterval;
                state.transitionDate = transitionDate;
                _setClaimDeadline(pastWeek, transitionDate);
            }
        } 
    }

    /**
     * @dev Update transition interval
     * @param interval : New interval
     * @notice Transition interval will always reset the transition date 
    */
    function setTransitionInterval(uint32 interval) public onlyOwner {
        unchecked {
            if(interval > 0) state.transitionInterval = interval * 1 minutes;
        }
    }

    /**
     * @dev Transition to a new week and return the new week Id
     */
    function _transitionToNewWeek() internal returns(uint newWeekId) {
        unchecked {
            state.weekId ++;
        }
        newWeekId = state.weekId;
    }

    /// @dev Return the state variable object
    function _getState() internal view returns(State memory st) {
        st = state;
    }

    /// @dev Update the token variable. Only-owner function
    function setToken(address _token) public onlyOwner returns(bool) {
        require(_token != address(0), "Token is zero");
        token = IGrowToken(_token);
        return true;
    }

    /// @dev Get platform token
    function getPlatformToken() external view returns(address) {
        return address(token);
    }

    // Return the current unix time stamp on the network
    function _now() internal view returns(uint64 time) {
        time = uint64(block.timestamp);
    } 
}