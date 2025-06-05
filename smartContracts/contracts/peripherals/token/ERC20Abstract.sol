// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/ERC20.sol)

pragma solidity 0.8.24;

import { IERC20 } from "../../interfaces/IERC20.sol";
import { Pausable } from "../Pausable.sol";

library Lib {
  function cannotBeEmptyAddress(address target) internal pure {
    require(target != address(0), "Lib: Target is zero address");
  }

  function mustBeAbove(uint a, uint b) internal pure {
    require(a >= b, "B is greater than A");
  }

  function _now() internal view returns(uint64 result) {
    result = uint64(block.timestamp);
  }
}

/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.openzeppelin.com/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * The default value of {decimals} is 18. To change this, you should override
 * this function so it returns a different value.
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC20
 * applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */

/**
 * @title SimpliFinance Token Implementation { Non deployable }
 * @author SimpliFinance - https://github.com/bobeu
 * @notice @dev Simplifinance Token operates a dual ledger model:
     *      - Regular balance : Compatible with the standard ERC20 balances.
     *      - private balance : This is kept in a seperate ledger but reflects in the total balances when 
     *          the `balanceOf` is invoked. We introduced this method for internal security reasons to protect
     *          SPT holder in the event they lost access to their wallets.
     *  HOW IS WORKS
     *  ============
     *      To be protected, holder must explicitly subscribe to it. During the processs, an alternative 
     *      EOA referred to as `escapeTo` must be provided as an argument to the function. Holders are adviced to create a seperate account for this purpose
     *      and keep the private keys secure. Such account might not be used for regular transaction. Providing this address activates 
     *      the private balance mode. The specified amount of `inValue` is locked for the period of `lockTil`. During the locked period, if holder 
     *      lost access to their account, through the `Attorney` contract, provided the lock is activated, they will regain access to their funds.
     *      The Attorney will enquire from the Token contract if the caller has previously activated the lock, and if an escape address was set. otherwise
     *      the request is ignored.
     * Note: An amount is charged by the Attorney for such service.
     * Even if an hacker gained access to your private keys, as a SPT holder, the fund is not accessible to them only if the holder had activated the lock feature.
     * 
     * Note: The call must be initiated by an account other than the owner.
     *       An attacker only has access to SPT token in your regular ERC20 ledger balances.
     *   
        The `panicWithdraw` method resides in the Attorney contract. It unlocks all balances in the locked ledger and are sent to the `escape` account provided the  
        an address was initially set.
 */
abstract contract ERC20Abstract is IERC20, Pausable {
  using Lib for *;

  TokenInfo private tokenInfo;
  
  mapping(address => Balances) private _balances;

  mapping(address => mapping(address => uint256)) private _allowances;

  /**
   * @dev Initializes state varibles.
   * Note: We mint the maxSupply at deployment. 30% of the total supply
   * is in circulation while the rest is lcoked in the reserve.
   */
  constructor(
    address attorney_,
    address reserve_,
    address initTokenReceiver,
    address _roleManager
  )  
    Pausable(_roleManager)
  {
    attorney_.cannotBeEmptyAddress();
    tokenInfo = TokenInfo(18, 0, "Simplfinance Token", "TSFT", attorney_);
    _mint(_msgSender(), 200_000_000*(10**18)); // For testing, mint to msg.sender
    _mint(initTokenReceiver, 800_000_000*(10**18));
    _lock(initTokenReceiver, reserve_, 700_000_000*(10**18)); // We expect reserve_ to be a grouped account e.g multisig.
  }

  /**
   * @dev Returns the name of the token.
   */
  function name() public view virtual override returns (string memory) {
    return tokenInfo.name;
  }

  /**
   * @dev Returns the symbol of the token, usually a shorter version of the
   * name.
   */
  function symbol() public view virtual override returns (string memory) {
    return tokenInfo.symbol;
  }

  /**
   * @dev Returns the number of decimals used to get its user representation.
   * For example, if `decimals` equals `2`, a balance of `505` tokens should
   * be displayed to a user as `5.05` (`505 / 10 ** 2`).
   *
   * Tokens usually opt for a value of 18, imitating the relationship between
   * Ether and Wei. This is the default value returned by this function, unless
   * it's overridden.
   *
   * NOTE: This information is only used for _display_ purposes: it in
   * no way affects any of the arithmetic of the contract, including
   * {IERC20-balanceOf} and {IERC20-transfer}.
   */
  function decimals() public view virtual override returns (uint8) {
    return tokenInfo.decimals;
  }

  /**
   * @dev Returns contracts account connected to the token contracts i.e.
   *    - Attorney
   * Note: Attorney account acts on behalf of a holders to retrive their token
   *        in the event they lost access to their accounts.
   */
  function getAttorney() public view returns(address _attorney) {
    _attorney = tokenInfo.attorney;
  }

  /// @dev See IERC20.sol {getInfo}
  function getLockedInfo(address target) public view returns(Protected memory _locked) {
    address msgSender = _msgSender();
    if(msgSender == tokenInfo.attorney) {
      _locked = _balances[target].locked;
    }
    return _locked;
  }

  /**
   * @dev See {IERC20-totalSupply}.
   */
  function totalSupply() public view virtual override returns (uint256) {
    return tokenInfo.totalSupply;
  }

  ///@dev See {IERC20-accountBalances}.
  function accountBalances(address who) external view returns (Balances memory _bal) {
    _bal = _balances[who];
    return _bal;
  }

  /**
   * @dev See {IERC20-balanceOf}.
   * Returns the spendable balance of @param account: Bytes32 address type
   * Note: The function `balanceOf` complies with that ERC20 standard
   */
  function balanceOf(address account) public view returns (uint256 _bal) {
    return _getSpendable(account);
  }

  /**
   * @dev See {IERC20-transfer}.
   *
   * Requirements:
   *
   * - `to` cannot be the zero address.
   * - the caller must have a balance of at least `amount`.
   */
  function transfer(address to, uint256 amount) public returns (bool) {
    address owner = _msgSender();
    _transfer(owner, to, amount);
    return true;
  }

  /**
   * @dev See {IERC20-allowance}.
   */
  function allowance(address owner, address spender) public view virtual override returns (uint256) {
    return _allowances[owner][spender];
  }

  /**
   * @dev See {IERC20-approve}.
   *
   * NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on
   * `transferFrom`. This is semantically equivalent to an infinite approval.
   *
   * Requirements:
   *
   * - `spender` cannot be the zero address.
   */
  function approve(address spender, uint256 amount) public virtual override returns (bool) {
      address owner = _msgSender();
      _approve(owner, spender, amount);
      return true;
  }

  /**
   * @dev See {IERC20-transferFrom}.
   *
   * Emits an {Approval} event indicating the updated allowance. This is not
   * required by the EIP. See the note at the beginning of {ERC20}.
   *
   * NOTE: Does not update the allowance if the current allowance
   * is the maximum `uint256`.
   *
   * Requirements:
   *
   * - `from` and `to` cannot be the zero address.
   * - `from` must have a balance of at least `amount`.
   * - the caller must have allowance for ``from``'s tokens of at least
   * `amount`.
   */
  function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
    address spender = _msgSender();
    _spendAllowance(from, spender, amount);
    _transfer(from, to, amount);
    return true;
  }

  /**
   * @dev Atomically increases the allowance granted to `spender` by the caller.
   *
   * This is an alternative to {approve} that can be used as a mitigation for
   * problems described in {IERC20-approve}.
   *
   * Emits an {Approval} event indicating the updated allowance.
   *
   * Requirements:
   *
   * - `spender` cannot be the zero address.
   */
  function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
      address owner = _msgSender();
      _approve(owner, spender, allowance(owner, spender) + addedValue);
      return true;
  }

  /**
   * @dev Atomically decreases the allowance granted to `spender` by the caller.
   *
   * This is an alternative to {approve} that can be used as a mitigation for
   * problems described in {IERC20-approve}.
   *
   * Emits an {Approval} event indicating the updated allowance.
   *
   * Requirements:
   *
   * - `spender` cannot be the zero address.
   * - `spender` must have allowance for the caller of at least
   * `subtractedValue`.
   */
  function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns(bool) {
    address owner = _msgSender();
    uint256 currentAllowance = allowance(owner, spender);
    require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
    unchecked {
      _approve(owner, spender, currentAllowance - subtractedValue);
    }

    return true;
  }

  // Returns spendable balances of {from} i.e usual ERC20 'balanceOf'
  function _getSpendable(address from) internal view returns (uint256) {
    return _balances[from].spendable;
  }

  /**
   * @dev Moves `amount` of tokens from `from` to `to`.
   *
   * This internal function is equivalent to {transfer}, and can be used to
   * e.g. implement automatic token fees, slashing mechanisms, etc.
   *
   * Emits a {Transfer} event.
   *
   * Requirements:
   *
   * - `from` cannot be the zero address.
   * - `to` cannot be the zero address.
   * - `from` must have a balance of at least `amount`.
   */
  function _transfer(address from, address to, uint256 amount) internal virtual 
  {
    from.cannotBeEmptyAddress();
    to.cannotBeEmptyAddress();

    _beforeTokenTransfer(from, to, amount);
    uint256 fromBalance = _getSpendable(from);
    fromBalance.mustBeAbove(amount);
    unchecked {
        _balances[from].spendable = fromBalance - amount;
        // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
        // decrementing then incrementing.
        _balances[to].spendable += amount;
    }

    emit Transfer(from, to, amount);

    _afterTokenTransfer(from, to, amount);
  }

  /** @dev Creates `amount` tokens and assigns them to `account`, increasing
   * the total supply.
   *
   * Emits a {Transfer} event with `from` set to the zero address.
   *
   * Requirements:
   *
   * - `account` cannot be the zero address.
   */
  function _mint(address account, uint256 amount) internal virtual {
    // _requireContext(_isCallable(Internal.MINT));
    account.cannotBeEmptyAddress();
    _beforeTokenTransfer(address(0), account, amount);

    tokenInfo.totalSupply += amount;
    unchecked {
        // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
        _balances[account].spendable += amount;
    }
    emit Transfer(address(0), account, amount);

    _afterTokenTransfer(address(0), account, amount);
  }

  /**
   * @dev Destroys `amount` tokens from `account`, reducing the
   * total supply.
   *
   * Emits a {Transfer} event with `to` set to the zero address.
   *
   * Requirements:
   *
   * - `account` cannot be the zero address.
   * - `account` must have at least `amount` tokens.
   */
  function _burn(address account, uint256 amount) internal virtual {
    account.cannotBeEmptyAddress();
    _beforeTokenTransfer(account, address(0), amount);

    uint256 accountBalance = _balances[account].spendable;
    accountBalance.mustBeAbove(amount);
    unchecked {
      _balances[account].spendable = accountBalance - amount;
      // Overflow not possible: amount <= accountBalance <= totalSupply.
      tokenInfo.totalSupply -= amount;
    }

    emit Transfer(account, address(0), amount);

    _afterTokenTransfer(account, address(0), amount);
  }

  /**
   * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
   *
   * This internal function is equivalent to `approve`, and can be used to
   * e.g. set automatic allowances for certain subsystems, etc.
   *
   * Emits an {Approval} event.
   *
   * Requirements:
   *
   * - `owner` cannot be the zero address.
   * - `spender` cannot be the zero address.
   */
  function _approve(address owner, address spender, uint256 amount) internal virtual {
    owner.cannotBeEmptyAddress();
    spender.cannotBeEmptyAddress();
    _allowances[owner][spender] = amount;
    emit Approval(owner, spender, amount);
  }

  /**
   * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
   *
   * Does not update the allowance amount in case of infinite allowance.
   * Revert if not enough allowance is available.
   *
   * Might emit an {Approval} event.
   */
  function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
    uint256 currentAllowance = allowance(owner, spender);
    if (currentAllowance != type(uint256).max) {
      currentAllowance.mustBeAbove(amount);
      unchecked {
        _approve(owner, spender, currentAllowance - amount);
      }
    }
  }

  /**
   * @dev Hook that is called before any transfer of tokens. This includes
   * minting and burning.
   *
   * Calling conditions:
   *
   * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
   * will be transferred to `to`.
   * - when `from` is zero, `amount` tokens will be minted for `to`.
   * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
   * - `from` and `to` are never both zero.
   *
   * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
   */
  function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}

  /**
   * @dev Hook that is called after any transfer of tokens. This includes
   * minting and burning.
   *
   * Calling conditions:
   *
   * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
   * has been transferred to `to`.
   * - when `from` is zero, `amount` tokens have been minted for `to`.
   * - when `to` is zero, `amount` of ``from``'s tokens have been burned.
   * - `from` and `to` are never both zero.
   *
   * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
   */
  function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}

  
  ///@dev Returns current Unix time stamp
  function _now() internal view returns(uint32) {
    return uint32(block.timestamp);
  }
  
  /**@dev Locks token in the private ledger balances.
    When tokens are locked they can be unlocked at any time.
      @param _escapeTo : An extra address that token will be forwarded to. This must not be zero address
      @param amount : Amount user is willing to send to the safe.
      Note: If caller has no lock previously set,`escapeTo` must not be an empty address.
            User will always have to provide an escape address each time they want to lock up tokens.
      REWARD
      ======
      Holders are eligible to claim reward if they hold SFT in private ledger for at least 30 days.
      The measure of such reward is determined by the team.
      @notice Care must be taken when locking and unlocking. Users must first check through the attorney if they're
            qualify for reward then they must claim first before lock again, otherwise, the locked time is overriden.
            This can nullify their rewards.

   */
  function _lock(address account, address _escapeTo, uint256 amount) 
    internal
  {
    _escapeTo.cannotBeEmptyAddress();
    Balances memory balances = _balances[account];

    balances.spendable.mustBeAbove(amount);
    // _balances[account].locked.escapeTo = _escapeTo;
    // _balances[account].locked.lastLocked = amount;
    unchecked {
      _balances[account] = Balances(
        balances.spendable - amount,
        Protected(
          balances.locked.value + amount,
          _escapeTo
        )
      );
    }
  }

  /**@dev Unlock token 
   */
  function _unlock(address account, uint amount) internal {
    Balances memory balances = _balances[account];
    if(balances.locked.escapeTo == address(0)) revert NoPreviousLockDetected();
    balances.locked.value.mustBeAbove(amount);
    unchecked {
      _balances[account].locked.value -= amount;
      _balances[balances.locked.escapeTo].spendable += amount;
    }
  }

  /**
   * @dev Replaces the attorney account. Only authorized owner account can perform
   * this action.
   */
  function setAttorney(address newAttorney) public onlyRoleBearer {
    newAttorney.cannotBeEmptyAddress();
    tokenInfo.attorney = newAttorney;
  }

  /**See IERC20.sol {panicUnlock}
    Method is executed only of the caller is the attorney
    Note: Since the user is able to prove to the attorney that they
    own the lost account, they are also able to reclaim all balances.
   */ 
  function panicUnlock(address accountToRetrieve, Balances memory _bal) external returns(bool feedback) {
    tokenInfo.attorney.cannotBeEmptyAddress();
    if(_msgSender() == tokenInfo.attorney) {
      unchecked {
        _balances[accountToRetrieve].locked.value = 0;
        _balances[_bal.locked.escapeTo].spendable += _bal.locked.value;
      }
      if(_bal.spendable > 0) {
        _transfer(accountToRetrieve, _bal.locked.escapeTo, _bal.spendable);
      } 
      feedback = true;
    }
  }
}
