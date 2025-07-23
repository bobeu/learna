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
    function _setDeadline(uint weekId, uint96 deadline) internal {
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
     * @param interval : New interval
     */
    function _setTransitionInterval(uint32 intervalInMin, uint32 claimDeadlineInMin, uint weekId) internal {
        if(state.transitionInterval != interval) state.transitionInterval = (interval * 1 minutes);
        unchecked {
            state.transitionDate = _now() + state.transitionInterval;
            if(claimDeadlineInMin > 0) {
                _setDeadline(weekId, _now() + (claimDeadlineInMin * 1 minutes));
            }
        }
    }

    /**
     * @dev Update transition interval
     * @param interval : New interval
     * @notice Transition interval will always reset the transition date 
    */
    function setTransitionInterval(uint32 interval, uint32 claimDeadlineInMin, uint weekId) public onlyOwner {
        _setTransitionInterval(interval, claimDeadlineInMin, weekId);
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
    function _now() internal view returns(uint64 result) {
        result = uint64(block.timestamp);
    } 
}