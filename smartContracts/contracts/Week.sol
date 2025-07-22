// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { ILearna } from "./interfaces/ILearna.sol";
import { Admins } from "./Admins.sol";

abstract contract Week is ILearna, Admins {

    // Other state variables
    State private state;

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
    function _setTransitionInterval(uint32 interval) internal {
        if(state.transitionInterval != interval) state.transitionInterval = interval;
        state.transitionDate = _now() + state.transitionInterval;
    }

    /**
     * @dev Update transition interval
     * @param interval : New interval
     * @notice Transition interval will always reset the transition date 
    */
    function setTransitionInterval(uint32 interval) public onlyOwner {
        _setTransitionInterval(interval);
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