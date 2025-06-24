// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

interface IGrowToken {
    function allocate(uint amount) external returns(bool);
}
