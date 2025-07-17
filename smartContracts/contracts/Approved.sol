// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Approved is Ownable {
    error AddressIsZero();
    
    event Approval(address indexed);
    event UnApproval(address indexed);

    // Mapping of account to approvals
    mapping (address => bool) private approval;

    // Only approved account is allowed
    modifier onlyApproved {
        require(_isApproved(_msgSender()), "Not approved account");
        _;
    }

    constructor() Ownable(_msgSender()) {}
    //    _approve(toApprove, true);
    //    _approve(_msgSender(), true);

    /**
     * @dev Set approval for
     * @param target : Account to set approval for
     * @param value : Approval state - true or false
     */
    function _approve(address target, bool value) internal {
        if(target == address(0)) revert AddressIsZero();
        approval[target] = value;
    }

    /**
     * @dev Set approval for target
     * @param target : Account to set approval for
     */
    function approve(address target) public onlyOwner {
        _approve(target, true);
        emit Approval(target);
    }

    /**
     * @dev Set approval for target
     * @param target : Account to set approval for
     */
    function _isApproved(address target) internal return(bool result) {
        result = approval[target];
    }

    /**
     * @dev Set approval for target
     * @param target : Account to set approval for
     */
    function unApprove(address target) public onlyOwner {
        _approve(target, false);
        emit UnApproval(target);
    }
}