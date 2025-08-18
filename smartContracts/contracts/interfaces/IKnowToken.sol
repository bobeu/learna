// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

interface IKnowToken {
    function allocate(uint amount, address to) external returns(bool);
    function burn(address holder, uint amount) external returns(bool);
}
