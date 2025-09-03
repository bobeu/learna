// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

interface Common {
    struct ShareOut {
        uint erc20;
        uint native;
        address token;
    }
}