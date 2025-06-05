// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { Common } from "./Common.sol";
/**
 * @title Simplifi
 * @author : Bobeu - https://github.com/bobeu
 * @notice : Interface of the Point contract for managing user's rewards and points.
 */
interface IPoint {
  struct Initializer {
    bool isRegistered;
    uint location; 
  }

  function getPoint(address user, uint8 phase) external view returns(Common.Point memory);
  function setPoint(
    address user, 
    uint8 contributor,
    uint8 creator,
    uint8 referrals
  ) external returns(bool);
  function deductPoint(
    address user, 
    uint8 contributor,
    uint8 creator,
    uint8 referrals
  ) external returns(bool);
}