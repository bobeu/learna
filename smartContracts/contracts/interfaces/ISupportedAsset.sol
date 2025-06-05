// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { Common } from "./Common.sol";

interface ISupportedAsset {
  struct SupportedAsset {
    address id;
    string name;
    string symbol;
    bool isWrappedAsset;
  }
  function isSupportedAsset(address _asset) external view returns(bool);
  function getDefaultSupportedCollateralAsset(uint index) external view returns(address);
  function isWrappedAsset(address assetAddr) external view returns(bool);
}  