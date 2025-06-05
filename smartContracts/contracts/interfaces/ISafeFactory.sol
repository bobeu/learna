// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title Interface of the Safe manager
 * @author : Simplifinance (Written by Bobeu)
 */
interface ISafeFactory {  
/**
 * Clones and return a new safe 
 * @param unit : Target address for whom to create safe
 */
  function pingSafe(uint256 unit) external returns(address safe);

  /**
   * Safe struct map
   * key: user address { EOA }
   * value: Safe { Contract } 
   */
  struct SafeData {
    address key;
    address value;
  }

}