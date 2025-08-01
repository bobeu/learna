// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { ILearna } from "./interfaces/ILearna.sol";
import { Admins } from "./Admins.sol";

abstract contract Week is ILearna, Admins {

    /// @dev  Other state variables
    State private state;

    /// @dev Claim deadlines
    mapping (uint => uint96) private claimDeadlines;

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
     * @dev Update minimum token - onlyOwner
     * @param minToken : New minimum payable token
     */
    function setMinimumToken(uint minToken) public onlyOwner {
        _setMinimumToken(minToken);
    }

    /**
     * @dev Update transition interval
     * @param intervalInMin : New interval
     * @param weekId : Week Id
     */
    function _setTransitionInterval(uint32 intervalInMin, uint pastWeek) internal {
        if(intervalInMin > 0) {
            uint64 newInterval = intervalInMin * 1 minutes;
            uint64 transitionDate = _now() + newInterval;
            state.transitionInterval = newInterval;
            unchecked {
                state.transitionDate = transitionDate;
            }
            _setClaimDeadline(pastWeek, transitionDate);
        } 
    }

    /**
     * @dev Update transition interval
     * @param interval : New interval
     * @notice Transition interval will always reset the transition date 
    */
    function setTransitionInterval(uint32 interval, uint weekId) public onlyOwner {
        if(interval > 0) state.transitionInterval = interval * 1 minutes;
    }

    /**
     * @dev Transition to a new week and return the new week Id
     */
    function _transitionToNewWeek() internal returns(uint newWeekId) {
        state.weekId ++;
        newWeekId = state.weekId;
    }

    /// @dev Return the state variable object
    function _getState() internal view returns(State memory st) {
        st = state;
    }

    // Return the current unix time stamp on the network
    function _now() internal view returns(uint64 time) {
        time = uint64(block.timestamp);
    } 
}