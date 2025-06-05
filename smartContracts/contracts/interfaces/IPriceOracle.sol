// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { Common } from "./Common.sol";

interface IPriceOracle {
  struct PriceData {
    string pair;
    address oracleAddress;
    uint128 latestPrice;
    uint128 timestampOflatestPrice;
    uint8 decimals;
  }

  // Only rolebearer function
  function getPriceQuote(address asset) external view returns(uint128 price, bool inTime, uint8 decimals);
  function updatePriceFeed(address asset) external;
}