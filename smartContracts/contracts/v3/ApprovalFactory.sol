// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

interface IApprovalFactory {
    error AddressIsZero();
    error AddressHasApproval();
    error AddressHasNoApproval();

    event Approval(address[]);
    event ApprovalRemoved(address[]);

    function hasApproval(address target) external view returns(bool);
}

contract ApprovalFactory is IApproval, Ownable {
    // Mapping of account to approvals
    mapping (address => bool) private approval;

    constructor() Ownable(_msgSender()) {
       _isApproved(_msgSender());
    }

    /**
     * @dev Set approval for
     * @param target : Account to set approval for
     * @param value : Approval state - true or false
     */
    function _setApprovalFor(address target) internal {
        if(target == address(0)) revert AddressIsZero();
        if(_isApproved(target)) revert AddressHasApproval();
        approval[target] = true;
    }

    /**
     * @dev Remove approval for
     * @param target : Account to set approval for
     * @param value : Approval state - true or false
     */
    function _removeApprovalFor(address target) internal {
        if(!_isApproved(target)) revert AddressHasNoApproval();
        approval[target] = false;
    }

    /**
     * @dev Set approval for target
     * @param target : Account to set approval for
     */
    function setApproval(address[] memory targets) public onlyOwner {
        for(uinti = 0; i < targets.length; i++) {
            _setApprovalFor(targets[i]);
        }
        emit Approval(targets);
    }

    /**
     * @dev Set approval for target
     * @param target : Account to set approval for
     */
    function removeApproval(address[] memory targets) public onlyOwner {
        for(uinti = 0; i < targets.length; i++) {
            _removeApprovalFor(targets[i]);
        }
        emit ApprovalRemoved(targets);
    }

    /**
     * @dev Set approval for target
     * @param target : Account to set approval for
     */
    function _isApproved(address target) internal view returns(bool result) {
        result = approval[target];
    }

    /**
     * @dev Check approval for target
     * @param target : Account to set approval for
     */
    function hasApproval(address target) external view returns(bool) {
        return _isApproved(target);
    }
}