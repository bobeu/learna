// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("Test Token", "TTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(uint amount, address to) public {
        _mint(to, amount);
    }
}
