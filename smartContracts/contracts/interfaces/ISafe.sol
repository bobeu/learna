// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { Common } from "./Common.sol";
import { IERC20 } from "./IERC20.sol";

interface ISafe {
  function addUp(address user, uint96 recordId) external returns(bool);
  function getFinance(
    address user, 
    IERC20 baseAsset, 
    uint256 loan, 
    uint fee, 
    uint256 calculatedCol,
    uint96 recordId
  ) 
    external 
    returns(bool);

  function payback(Common.Payback_Safe memory, uint unit) external returns(bool);
  function cancel(address user, IERC20 asset, uint unit, uint96 recordId) external returns(bool);
  function getData() external view returns(ViewData memory);
  function registerProvidersTo(Common.Provider[] memory providers, address contributor, uint96 recordId) external;
  function forwardBalances(address to, address erc20) external returns(bool);
  struct ViewData {
    uint totalClients;
    uint aggregateFee;
  }

  struct ViewUserData {
    bool access;
    uint collateralBalance;
  }
}