// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IGrowToken } from '../interfaces/IGrowToken.sol';
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract PlatformToken is IGrowToken, ERC20, Ownable {
    // Contract allowed to send allocation request
    address internal learna;

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
    constructor(address reserve, string memory name_, string memory symbol_) ERC20(name_, symbol_) Ownable(_msgSender()) {
        unchecked {
            uint tSupply = 21_000_000 * (10**decimals());
            uint dev = 630000 * (10**decimals());
            uint contributors = tSupply / 2;
            _mint(_msgSender(), dev); 
            _mint(address(this), contributors);
            _mint(reserve, tSupply - (contributors + dev));
        }
    }

    // Fallback
    receive() external payable {
      (bool sent,) = learna.call{value: msg.value}('');
      require(sent);
    }

    /**
     * @dev Allocate token to the learna contract
     * @param amount : Amount to allocate
     */
    function allocate(uint amount, address to) external returns(bool) {
        require(_msgSender() == learna || _msgSender() == owner(), "Not authorized");
        _transfer(address(this), to, amount);
        return true;
    }

    /**
     * @dev Update learna contract
     * @param newMain : New learna address
     * @notice : If the previous address is valid and has some balances, they're moved to this contract.
     */
    function setMain(address newMain) external onlyOwner returns(bool) {
        require(newMain != address(0), "Address is zero");
        if(learna != address(0)){
            uint bal = balanceOf(learna);
            if(bal > 0){
                _transfer(learna, address(this), bal);
            }
        }

        learna = newMain;
        return true;
    }

    /**
     * @dev Burn certain amount from the holder account
     * @param holder : Account to burn from
     * @param amount : Amount to burn
     */
    function burn(address holder, uint amount) external returns(bool) {
        _burn(holder, amount);
        return true;
    }
}