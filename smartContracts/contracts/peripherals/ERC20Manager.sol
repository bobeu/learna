// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IERC20 } from "../interfaces/IERC20.sol";
import { IStateManager } from "../interfaces/IStateManager.sol";
import { Pausable } from "./Pausable.sol";

/**
 * ERROR CODE
 * =========
 * E2 - Not supported
 * E3 - Value exceed allowance
 * E4 - Asset transfer failed
 * E5 - Approval failed
 * E1 - State manager address is zero
 */
abstract contract ERC20Manager is Pausable {
    // Storage contract
    IStateManager private stateManager;

    modifier onlySupportedAsset(address asset) {
        IStateManager.StateVariables memory state = _getVariables();
        if(asset != address(state.baseAsset)){
            require(state.assetManager.isSupportedAsset(asset), 'E2');
        }
        _;
    }

    // ============= Constructor ================

    constructor(address _stateManager, address _roleManager) Pausable(_roleManager) {
        require(_stateManager != address(0), 'E1');
        stateManager = IStateManager(_stateManager);
    }

    /**
     * @dev Validate allowance given by user against actual value
     * @param asset : ERC20 compatible contract
     * @param owner : Owner account
     * @param value : Value to compare allowance to
     */
    function _validateAllowance(
        address asset, 
        address owner, 
        uint value
    ) 
        onlySupportedAsset(asset)
        internal 
        view
        returns(uint allowance) 
    {
        allowance = IERC20(asset).allowance(owner, address(this));
        require(allowance >= value,  'E3');
    }

    /**
     * @dev Validate allowance given by user against actual value
     * @param asset : ERC20 compatible contract
     * @param owner : Owner account
     * @param beneficiary : Recipient of the allowance
     * @param value : Value to compare allowance to
    */
    function _checkAndWithdrawAllowance(IERC20 asset, address owner, address beneficiary, uint value) internal returns(uint allowance) {
        address _owner = owner == _msgSender()? owner : _msgSender();
        allowance = _validateAllowance(address(asset), _owner, value);
        require(asset.transferFrom(_owner, beneficiary, allowance), 'E4');
    }

    /**
     * @dev Approve an account to spend from the contract balance
     * @param asset : ERC20 compatible contract
     * @param spender : Recipient of the allowance
     * @param value : Amount to approve
    */
    function _setApprovalFor(IERC20 asset, address spender, uint value) internal {
        uint prevAllowance = IERC20(asset).allowance(address(this), spender);
        unchecked {
            require(IERC20(asset).approve(spender, value + prevAllowance), 'E5');
        }
    }

    // Get all state variables internally from the state manager
    function _getVariables() internal view returns(IStateManager.StateVariables memory result) {
        result = stateManager.getStateVariables();
    }

    function getStateManager() public view returns(address) {
        return address(stateManager); 
    }

}