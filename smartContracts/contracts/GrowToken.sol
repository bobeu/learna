// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IGrowToken } from './IGrowToken.sol';

contract GrowToken is IGrowToken, ERC20, Ownable {
    // Contract allowed to send allocation request
    address private mainContract; 

    /**
     * @dev Constructor: Totol supply of 21000000 GROW Token is minted at construction to the token address
     * - 50% of the total supply is assigned to the contributors i.e learners sharable and claimable on weekly basis = 10_500_000 GROW
     * - 3% of the total supply is apportioned to the dev as support = 630k GROW
     * - 5% of the total supply is apportioned for marketing in the future = 105000 GROW
     * - 10% of the total supply is apportioned to supporters i.e People who support weekly tippings, etc = 2_100_000 GROW
     * - 20% will be as reserve 4_200_000 GROW
     * - 2% as airdrop = 420000 GROW
     * - 10% for growth and partnership = 2_100_000 GROW
     * 
     * @param reserve : Address where other apportionments other than the dev's will be sent to. 
     */
    constructor(address reserve, address _mainContract) ERC20('GrowToken', 'GROW') Ownable(_msgSender()) {
        unchecked {
            uint tSupply = 21_000_000 * (10**decimals());
            uint dev = 630000 * (10**decimals());
            uint contributors = tSupply / 2;
            _mint(_msgSender(), dev); 
            _mint(address(this), contributors);
            _mint(reserve, tSupply - (contributors + dev));
        }
        require(_mainContract != address(0), 'Main cannot be empty');
        mainContract =_mainContract;
    }

    /**
     * @dev Send allocation request
     * @param amount : Amount to allocate
     */
    function allocate(uint amount) external returns(uint) {
        address approvedSpender = mainContract;
        require(_msgSender() == approvedSpender, 'Only main'); 
        _transfer(address(this), approvedSpender, amount);
        return balanceOf(approvedSpender);
    }
}