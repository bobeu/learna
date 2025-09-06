// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { IVerifierV2 } from "./VerifierV2.sol";
import { ILearna } from "../interfaces/ILearna.sol";
import { IGrowToken } from "../interfaces/IGrowToken.sol";
import { Approved } from "../Approved.sol";

abstract contract WeekV2 is ILearna, Approved {

    /// @dev  Other state variables
    State private state;

    ///@notice Platform token 
    IGrowToken public token;

    ///@notice Claim address
    
    IVerifierV2 public verifier;

    bool public skipVerification;

    /// @dev Claim deadlines
    // mapping(uint => uint96) private claimDeadlines;

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
    function _hasClaimed(address user, uint weekId, bytes32 hash_) internal view returns(bool) {
        return isClaimed[user][weekId][hash_];
    }

    // function _getDeadline(uint weekId) internal view returns(uint96 deadline) {
    //     deadline = claimDeadlines[weekId];
    // }
    
    // /**
    //  * @dev Set claim deadline
    //  * @param weekId : Week Id
    //  * @param deadline : New deadline
    //  */
    // function _setClaimDeadline(uint weekId, uint96 deadline) internal {
    //     claimDeadlines[weekId] = deadline;
    // }

    /** 
     * @dev Update minimum token
     * @param minToken : New minimum payable token
     */
    function _setMinimumToken(uint minToken) internal {
        state.minimumToken = minToken;
    }

    /**
     * @dev Set approval for target
     * @param _verifier : Account to set approval for
     */
    function setVerifierAddress(address _verifier) public onlyOwner returns(bool) {
        verifier = IVerifierV2(_verifier);
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
     */
    function _setTransitionInterval() internal {
        unchecked {
            state.transitionInterval = _now() - state.transitionDate;
            state.transitionDate = _now();
        }
    }

    /**
     * @dev Transition to a new week and return the new week Id
     */
    function _transitionToNewWeek() internal {
        unchecked {
            state.weekId ++;
        }
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

    // Return the current unix time stamp on the network
    function _now() internal view returns(uint64 time) {
        time = uint64(block.timestamp);
    } 

    function toggleSkipVerification() public onlyApproved returns(bool) {
        bool status = skipVerification;
        skipVerification = !status;
        return true;
    }
}