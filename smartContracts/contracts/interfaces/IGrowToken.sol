// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IGrowToken is IERC20 {
    function allocate(uint amount, address to) external returns(bool);
    function burn(address holder, uint amount) external returns(bool);
}
