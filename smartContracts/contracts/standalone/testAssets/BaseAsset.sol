// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { ERC20, Context } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "../../interfaces/IERC20.sol";

contract BaseAsset is ERC20 {
  constructor() ERC20("Base Asset", "BSD") {
    _mint(msg.sender, 50_000_000 * (10**18));
  }
}