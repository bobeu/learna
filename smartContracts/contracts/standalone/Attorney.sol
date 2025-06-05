// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { Pausable } from "../peripherals/Pausable.sol";
import { Lib } from "../peripherals/token/ERC20Abstract.sol";
import { SafeERC20 } from "../peripherals/token/SafeERC20.sol";
import { IERC20 } from "../interfaces/IERC20.sol";

/**
 * Attorney acts as mediator between token and their holders when they lost access to their account and had previously
 * set up a lock. Attorney run attestation om the token contract if user's claim is genuine, charges a small amount of fee
 * and unlocks the token. 
 * Tokens are unlocked and sent to the escape address. 
 */

contract Attorney is Pausable {
  using SafeERC20 for IERC20;

  error CallNotFromEscapeAccount();

  // Service fee
  uint public fee;

  // Fee receiver
  address private feeTo;

  // Platform token contract
  IERC20 public token;

  receive() external payable {
    (bool _s,) = feeTo.call{value: msg.value}("");
    require(_s);
  }

  // ======== constructor ========
  constructor(
    uint _fee, 
    address _feeTo,
    address _roleManager
  ) 
    Pausable(_roleManager) 
  {
    require(_feeTo != address(0), "FeeTo is zero address");
    fee = _fee;
    feeTo = _feeTo;
  } 

  /**
   * @dev Sets token contract address
   * @param _token : Token Contract address
   */
  function setToken(IERC20 _token) 
    public 
    onlyRoleBearer
  {
    require(address(_token) != address(0), "Token is not set");
    token = _token;
  }

  /**@dev Panic unlock token.
    Token balances is sent to address specified as an escape address.
    @param lostAccount : Account to panic unlock
   */
  function panicUnlock(
    address lostAccount
  ) 
    public 
    payable 
    whenNotPaused
  {
    IERC20.Balances memory _b = IERC20(token).accountBalances(lostAccount);
    require(_b.locked.value > 0, "No lock detected");
    require(msg.value >= fee, "Insufficient value for fee");
    (bool _s,) = feeTo.call{value: msg.value}("");
    require(_s);
    token.safePanicUnlock(lostAccount, _b);
  }

  // See the service fee
  function setFee(uint newFee) public onlyRoleBearer {
    fee = newFee;
  }

}
