// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { IRoleBase } from "../interfaces/IRoleBase.sol";

/**
 * @title MsgSender 
 * @author Simplifi (Bobeu)
 * @notice Non-deployable contract simply returning the calling account.
 * ERROR CODE
 * ==========
 * R1 - Role manager is zero address
 * R2 - User is not permitted
 */
abstract contract MsgSender {
    function _msgSender() internal view virtual returns(address sender) {
        sender = msg.sender;
    }
}

abstract contract OnlyRoleBase is MsgSender {
    // Role manager address
    IRoleBase private roleManager;

    // ============= constructor ============
    constructor(address _roleManager)
    {
        require(_roleManager != address(0), 'R1');
        roleManager = IRoleBase(_roleManager);
    }

    /**
     * @notice Caller must have owner role before execeution can proceed.
     * The 'errorMessage' argument can be used to return error specific to 
     * a context e.g function call. 
     */
    modifier onlyRoleBearer {
        require(_hasRole(_msgSender()), 'R2');
        _;
    }

    function _hasRole(address target) internal view returns(bool result) {
        result = roleManager.hasRole(target);
    }
    
    function getRoleManager() public view returns(address) {
        return address(roleManager);
    }

}