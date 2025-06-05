// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { TokenInteractor } from "../peripherals/token/TokenInteractor.sol";

/**
 * @title Escape
 * @dev Total supply is minted to this contract and is controlled by an owner address
 * that should be a multisig account.
 */

contract Escape is TokenInteractor {
    constructor(address _roleManager) TokenInteractor(_roleManager) { }

    function name() public pure returns(string memory) {
        return "ESCAPE";
    }
}
 