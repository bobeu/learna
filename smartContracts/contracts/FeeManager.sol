// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Fee Manager: Account that receive fee
 * @author : Bobeu - https://github.com/bobeu
 * @notice There is an initial owner which is the deployer account. The owner account can withdraw from the contract
 * without restriction. In the event access is lost to the owner account, panicWithdraw function can be used but funds 
 * are sent to the routeTo account instead.
 */
contract FeeManager is Ownable {
    address public immutable routeTo;

    constructor(address _routeTo) Ownable(_msgSender()) {
        require(_routeTo != address(0), "Route is zero");
        require(_routeTo != _msgSender(), "Route is the deployer");
        routeTo = _routeTo;
    }

    receive() external payable {}

    function _withdraw(uint amount, address to) public onlyOwner {
        (bool done,) = to.call{value:amount}('');
        require(done, "Failed");
    }

    function withdraw(uint amount, address to) public onlyOwner returns(bool){
        _withdraw(amount, to);
        return true;
    }

    function panicWithdraw(uint amount) public returns(bool){
        _withdraw(amount, routeTo);
        return true;
    }
}
