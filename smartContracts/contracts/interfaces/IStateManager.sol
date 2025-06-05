// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { ISupportedAsset } from "./ISupportedAsset.sol";
import { IERC20 } from "./IERC20.sol";
import { IPoint } from "./IPoint.sol";

interface IStateManager {
    struct StateVariables {
        address feeTo;
        uint16 makerRate;
        ISupportedAsset assetManager; 
        IERC20 baseAsset;
        IPoint pointFactory;
    }
    function getStateVariables() external view returns(StateVariables memory);
}
