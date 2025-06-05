// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { ISafeFactory } from "../interfaces/ISafeFactory.sol";
import { Safe, OnlyRoleBase } from "../peripherals/Safe.sol";

/**@title SafeFactory: A standalone contract that manages safe creation and retrieval, 
  deletion, read and write data.
 */
contract SafeFactory is ISafeFactory, OnlyRoleBase {
  // Peoviders contract
  address private providers;

  // Total safe created to date
  uint private totalSafes;

  // Fee receiver account
  address private feeTo;

  address private multiSig;

 /**
 * @dev Mapping of unit contribution to safe.
 */
  mapping(uint256 unitContribution => address safeAddresses) private safeMap;

  /**
   * =========== Constructor ===============
   * @param _roleManager : Role manager contract
   * @param _feeTo : Fee receiver
   */
  constructor (
    address _roleManager, 
    address _feeTo,
    address _multiSig
  ) OnlyRoleBase(_roleManager) {
    require(_feeTo != address(0), 'FeeTo is 0');
    require(_multiSig != address(0), 'MultiSig is 0');
    feeTo = _feeTo;
    multiSig = _multiSig;
  }
 
  // Not accepting values
  receive() external payable {
    revert();
  }
  
  /**@dev Return if account owns a safe or not
  */
  function _hasSafe(uint256 unit) internal view returns (bool) {
    return safeMap[unit] != address(0);
  }

  // Returns Safe for 'user'
  function _getSafe(uint256 unit) internal view returns(address) { 
    return safeMap[unit];
  }
  
  /**@dev Create a new safe.
   * @notice 'unit' should not own a safe before now.
   *          only address with owner permission can call.
  */
  function pingSafe(uint256 unit) external onlyRoleBearer returns(address _safe) {
    if(!_hasSafe(unit)){
      _safe = _createSafe(unit);
    } else {
      _safe = _getSafe(unit);
    }
    return _safe;
  }

  /** @dev Creates a new Safe
  * @param unit : Amount
  * @notice Even if user is trying to rekey or upgrade smartsafe, same amount of fee is required
  * for successful upgrade.
  */
  function _createSafe(uint256 unit) private returns(address safe) {
    assert(providers != address(0));
    totalSafes ++;
    safe = address(new Safe(getRoleManager(), feeTo, providers, multiSig)); 
    _updateSafe(unit, safe); 
  }

  /**
   * Update storage with the new Safe instance : {internal}
   * @param unit : Unit amount 
   * @param safe : New Safe address
   */
  function _updateSafe(uint256 unit, address safe) private {
    safeMap[unit] = safe;
  }

  function setFeeTo(address newFeeTo) public onlyRoleBearer {
    feeTo = newFeeTo;
  }

  function setProviderContract(address providerAddr) public onlyRoleBearer {
    providers = providerAddr;
  }

  function getStorage() public view returns(address, uint, address) {
    return (providers, totalSafes, feeTo); 
  }
}