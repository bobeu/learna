// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Common } from "./Common.sol";
/**
 * @title Interface of the Providers contract
 * @author : Simplifinance (Written by Bobeu)
 */
interface IProviders {  
/**
 * Refund providers when an admin closes a pool 
 * @param providers : Target address for whom to create safe
 */
  function refund(Common.Provider[] memory providers) external returns(bool);
}