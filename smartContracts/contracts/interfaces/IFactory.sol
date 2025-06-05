// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { Common } from "./Common.sol";
import { ISafeFactory } from "./ISafeFactory.sol";
import { ISupportedAsset } from "./ISupportedAsset.sol";
import { IERC20 } from "./IERC20.sol";
import { IPoint } from "./IPoint.sol";

interface IFactory is Common {
  struct StateVariables {
    address feeTo;
    uint16 makerRate;
    ISafeFactory safeFactory;
    ISupportedAsset assetManager; 
    IERC20 baseAsset;
    IPoint pointFactory;
  }
  struct ConstructorArgs {
    address feeTo;
    uint16 makerRate;
    address safeFactory;
    address assetManager; 
    address baseAsset;
    address pointFactory;
    address roleManager;
  }

  function contributeThroughProvider(Provider[] memory providers, address borrower, uint unit) external returns(bool);
  function getPool(uint unit) external view returns(Common.Pool memory);
}