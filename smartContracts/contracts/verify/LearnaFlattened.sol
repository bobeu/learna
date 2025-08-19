// Sources flattened with hardhat v2.26.1 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/interfaces/draft-IERC6093.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/draft-IERC6093.sol)
pragma solidity >=0.8.4;

/**
 * @dev Standard ERC-20 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-20 tokens.
 */
interface IERC20Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC20InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC20InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `spender`’s `allowance`. Used in transfers.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     * @param allowance Amount of tokens a `spender` is allowed to operate with.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC20InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `spender` to be approved. Used in approvals.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC20InvalidSpender(address spender);
}

/**
 * @dev Standard ERC-721 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-721 tokens.
 */
interface IERC721Errors {
    /**
     * @dev Indicates that an address can't be an owner. For example, `address(0)` is a forbidden owner in ERC-20.
     * Used in balance queries.
     * @param owner Address of the current owner of a token.
     */
    error ERC721InvalidOwner(address owner);

    /**
     * @dev Indicates a `tokenId` whose `owner` is the zero address.
     * @param tokenId Identifier number of a token.
     */
    error ERC721NonexistentToken(uint256 tokenId);

    /**
     * @dev Indicates an error related to the ownership over a particular token. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param tokenId Identifier number of a token.
     * @param owner Address of the current owner of a token.
     */
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC721InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC721InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param tokenId Identifier number of a token.
     */
    error ERC721InsufficientApproval(address operator, uint256 tokenId);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC721InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC721InvalidOperator(address operator);
}

/**
 * @dev Standard ERC-1155 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-1155 tokens.
 */
interface IERC1155Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     * @param tokenId Identifier number of a token.
     */
    error ERC1155InsufficientBalance(address sender, uint256 balance, uint256 needed, uint256 tokenId);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC1155InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC1155InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param owner Address of the current owner of a token.
     */
    error ERC1155MissingApprovalForAll(address operator, address owner);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC1155InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC1155InvalidOperator(address operator);

    /**
     * @dev Indicates an array length mismatch between ids and values in a safeBatchTransferFrom operation.
     * Used in batch transfers.
     * @param idsLength Length of the array of token identifiers
     * @param valuesLength Length of the array of token amounts
     */
    error ERC1155InvalidArrayLength(uint256 idsLength, uint256 valuesLength);
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)

pragma solidity >=0.4.16;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/extensions/IERC20Metadata.sol)

pragma solidity >=0.6.2;

/**
 * @dev Interface for the optional metadata functions from the ERC-20 standard.
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}


// File @openzeppelin/contracts/token/ERC20/ERC20.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.20;




/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
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
 * conventional and does not conflict with the expectations of ERC-20
 * applications.
 */
abstract contract ERC20 is Context, IERC20, IERC20Metadata, IERC20Errors {
    mapping(address account => uint256) private _balances;

    mapping(address account => mapping(address spender => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * Both values are immutable: they can only be set once during construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
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
    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    /// @inheritdoc IERC20
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    /// @inheritdoc IERC20
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `value`.
     */
    function transfer(address to, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, value);
        return true;
    }

    /// @inheritdoc IERC20
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: If `value` is the maximum `uint256`, the allowance is not updated on
     * `transferFrom`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, value);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Skips emitting an {Approval} event indicating an allowance update. This is not
     * required by the ERC. See {xref-ERC20-_approve-address-address-uint256-bool-}[_approve].
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `value`.
     * - the caller must have allowance for ``from``'s tokens of at least
     * `value`.
     */
    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _transfer(address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from, to, value);
    }

    /**
     * @dev Transfers a `value` amount of tokens from `from` to `to`, or alternatively mints (or burns) if `from`
     * (or `to`) is the zero address. All customizations to transfers, mints, and burns should be done by overriding
     * this function.
     *
     * Emits a {Transfer} event.
     */
    function _update(address from, address to, uint256 value) internal virtual {
        if (from == address(0)) {
            // Overflow check required: The rest of the code assumes that totalSupply never overflows
            _totalSupply += value;
        } else {
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) {
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            unchecked {
                // Overflow not possible: value <= fromBalance <= totalSupply.
                _balances[from] = fromBalance - value;
            }
        }

        if (to == address(0)) {
            unchecked {
                // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
                _totalSupply -= value;
            }
        } else {
            unchecked {
                // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
                _balances[to] += value;
            }
        }

        emit Transfer(from, to, value);
    }

    /**
     * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
     * Relies on the `_update` mechanism
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _mint(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), account, value);
    }

    /**
     * @dev Destroys a `value` amount of tokens from `account`, lowering the total supply.
     * Relies on the `_update` mechanism.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead
     */
    function _burn(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _update(account, address(0), value);
    }

    /**
     * @dev Sets `value` as the allowance of `spender` over the `owner`'s tokens.
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
     *
     * Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument.
     */
    function _approve(address owner, address spender, uint256 value) internal {
        _approve(owner, spender, value, true);
    }

    /**
     * @dev Variant of {_approve} with an optional flag to enable or disable the {Approval} event.
     *
     * By default (when calling {_approve}) the flag is set to true. On the other hand, approval changes made by
     * `_spendAllowance` during the `transferFrom` operation set the flag to false. This saves gas by not emitting any
     * `Approval` event during `transferFrom` operations.
     *
     * Anyone who wishes to continue emitting `Approval` events on the`transferFrom` operation can force the flag to
     * true using the following override:
     *
     * ```solidity
     * function _approve(address owner, address spender, uint256 value, bool) internal virtual override {
     *     super._approve(owner, spender, value, true);
     * }
     * ```
     *
     * Requirements are the same as {_approve}.
     */
    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        _allowances[owner][spender] = value;
        if (emitEvent) {
            emit Approval(owner, spender, value);
        }
    }

    /**
     * @dev Updates `owner`'s allowance for `spender` based on spent `value`.
     *
     * Does not update the allowance value in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Does not emit an {Approval} event.
     */
    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance < type(uint256).max) {
            if (currentAllowance < value) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, value);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - value, false);
            }
        }
    }
}


// File @openzeppelin/contracts/utils/Pausable.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (utils/Pausable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    bool private _paused;

    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    /**
     * @dev The operation failed because the contract is paused.
     */
    error EnforcedPause();

    /**
     * @dev The operation failed because the contract is not paused.
     */
    error ExpectedPause();

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        if (paused()) {
            revert EnforcedPause();
        }
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        if (!paused()) {
            revert ExpectedPause();
        }
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}


// File contracts/Approved.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.28;
abstract contract Approved is Ownable, Pausable {
    error AddressIsZero();
    
    event Approval(address indexed);
    event UnApproval(address indexed);

    // Mapping of account to approvals
    mapping (address => bool) private approval;

    // Only approved account is allowed
    modifier onlyApproved {
        require(_isApproved(_msgSender()), "Not approved account");
        _;
    }

    constructor() Ownable(_msgSender()) {
       _setPermission(_msgSender(), true);
         
    }
    //    _approve(toApprove, true);

    /**
     * @dev Set approval for
     * @param target : Account to set approval for
     * @param value : Approval state - true or false
     */
    function _setPermission(address target, bool value) internal {
        if(target == address(0)) revert AddressIsZero();
        approval[target] = value;
    }

    /**
     * @dev Set approval for target
     * @param target : Account to set approval for
     */
    function setPermission(address target) public onlyOwner {
        _setPermission(target, true);
        emit Approval(target);
    }

    /**
     * @dev Set approval for target
     * @param target : Account to set approval for
     */
    function _isApproved(address target) internal view returns(bool result) {
        result = approval[target];
    }

    /**
     * @dev Set approval for target
     * @param target : Account to set approval for
     */
    function isPermitted(address target) public view returns(bool) {
        return _isApproved(target);
    }

    /**
     * @dev Set approval for target
     * @param target : Account to set approval for
     */
    function unApprove(address target) public onlyOwner {
        _setPermission(target, false);
        emit UnApproval(target);
    }

}


// File contracts/Admins.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;
abstract contract Admins is Approved {
    struct Admin {
        address id;
        bool active;
    }

    /// @dev Total number of admins
    uint private adminCount;

    /// Admins slots
    mapping(uint8 => address) private slots;

    /// @dev Mapping of slots to admin data
    mapping(address => bool) private isAdmin;

    /**
     * @dev Only admin
     * @notice Even if no admin is added, we will always byepass the out-of-bound error since 
     * we already added at least one content to the admins array in the constructor, it wil always fetch zero slot.
    */
    modifier onlyAdmin() {
        require(_isAdmin(_msgSender()), 'Only admin');
        _; 
    }

    function _isAdmin(address target) internal view returns(bool result) {
        result = isAdmin[target];
    }
    
    /**
     * @dev Add admin and activate them
     * @param target : Account to add
     */
    function _addAdmin(address target) internal {
        require(!isAdmin[target], 'Admin already added');
        isAdmin[target] = true;
        uint8 slot = uint8(adminCount);
        adminCount = slot + 1;
        slots[slot] = target;
    }

    /**
     * @dev Toggle admin status either activate or deactivate them by toggling back and forth. 
     * @param target : Target account
     */
    function toggleAdminStatus(address target) public onlyOwner {
        bool status = isAdmin[target];
        isAdmin[target] = !status;
    }

    /// Initialize an empty slot in the admins array
    function setAdmin(address target) public onlyOwner {
        _addAdmin(target);
    }

    /// Return all admins
    function getAdmins() public view returns(Admin[] memory _admins) {
        uint8 _adminCount = uint8(adminCount);
        if(_adminCount == 0) return _admins;
        _admins = new Admin[](_adminCount);
        for(uint8 i = 0; i < _adminCount; i++) {
            address target = slots[i];
            _admins[i] = Admin(target, isAdmin[target]);
        }
        return _admins;
    }
}


// File contracts/interfaces/IKnowToken.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;

interface IKnowToken {
    function allocate(uint amount, address to) external returns(bool);
    function burn(address holder, uint amount) external returns(bool);
}


// File contracts/interfaces/ILearna.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;
interface ILearna {
    enum Mode { LOCAL, LIVE }

    error UserBlacklisted();
    error NotEligible();
    error ClaimEnded(uint64);
    error InvalidAddress(address);
    error CampaignClaimNotActivated();
    error InsufficientAllowance(uint256);
    error ClaimAddressNotSet();
    error NotInitialized();

    event NewCampaign(Campaign campaign);
    event CampaignUpdated(Campaign campaign);
    event PointRecorded(address indexed user, uint weekId, bytes32 campainHash, QuizResultInput quizResult);
    event Sorted(uint _weekId, uint newWeekId, CampaignData[] campaigns);
    event CampaignCreated(uint weekId, address indexed tipper, Campaign data, bytes32[] campainHashes);
    event UserStatusChanged(address[] users, bool[] newStatus);

    struct CData {
        uint platformToken;
        uint256 fundsNative;
        uint256 fundsERC20;
        uint96 totalPoints;
        uint64 lastUpdated;
        uint activeLearners; 
        address operator;
        address token;
        CampaignData data;
    }

    struct Campaign {
        CData data;
        address[] users;
    }

    struct GetCampaign {
        Campaign cp;
        uint32 slot;
    }

    struct CampaignData {
        bytes32 hash_;
        bytes encoded;
    }

    struct WeekInitializer {
        bool hasSlot;
        uint32 slot;
    }

    struct WeekProfileData {
        uint weekId;
        ReadProfile[] campaigns;
    }

    struct ReadProfile {
        Eligibility eligibility;
        Profile profile;
        bool isClaimed;
        bytes32 hash_;
    }

    struct Answer {
        bytes questionHash;
        uint64 selected;
        bool isUserSelected;
    }

    struct AnswerInput {
        string questionHash;
        uint64 selected;
        bool isUserSelected;
    }

    struct QuizResultOther {
        bytes id;
        bytes quizId;
        uint32 score;
        bytes title;
        uint64 totalPoints;
        uint16 percentage;
        uint64 timeSpent;
        bytes completedAt;
    }

    struct QuizResultOtherInput {
        string id;
        string quizId;
        uint32 score;
        string title;
        uint64 totalPoints;
        uint16 percentage;
        uint64 timeSpent;
        string completedAt;
    }

    struct QuizResultInput {
        AnswerInput[] answers;
        QuizResultOtherInput other;
    }

    struct QuizResult {
        Answer[] answers;
        QuizResultOther other;
    }

    struct ProfileOther {
        uint amountMinted;
        uint8 totalQuizPerWeek;
        bytes32 passkey;
        bool haskey;
    }

    struct Profile {
        QuizResult[] quizResults;
        ProfileOther other;
    }

    struct WeekData {
        uint weekId;
        Campaign[] campaigns;
        uint96 claimDeadline;
    } 

    // Readonly data
    struct ReadData {
        State state;
        WeekData[] wd;
        CampaignData[] approved;
        WeekProfileData[] profileData;
    }

    struct State {
        uint minimumToken;
        uint64 transitionInterval;
        uint64 transitionDate;
        uint weekId;
    }

    struct Eligibility {
        bool isEligible;
        uint erc20Amount;
        uint nativeAmount;
        uint platform;
        address token;
        bytes32 hash_;
        uint weekId;
    }

    // Eligibilities for the previous 3 weeks at most
    struct Eligibilities {
        Eligibility[] elgs;
        uint weekId;
    }

    struct UserCampaigns {
        uint weekId;
        bytes32[] campaigns;
    }

    function checkEligibility(address user) external view returns (Eligibilities memory);
    // function setIsClaimed(address user, uint weekId, bytes32 hash_) external;
    function hasClaimed(address user, uint weekId, bytes32 hash_) external view returns(bool);
    function getPlatformToken() external view returns(address);
    function onCampaignValueChanged(
        uint weekId, 
        bytes32 hash_, 
        uint256 fundsNative, 
        uint256 fundsERC20,
        uint256 platformToken,
        address user
    ) external;
}


// File contracts/Week.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;
abstract contract Week is ILearna, Admins {

    /// @dev  Other state variables
    State private state;

    ///@notice Platform token 
    IKnowToken internal token;

    ///@notice Claim address
    address public claim;

    /// @dev Claim deadlines
    mapping(uint => uint96) private claimDeadlines;

    ///@dev Mapping that shows whether user has claimed reward for a specific week or not
    mapping(address user => mapping(uint week => mapping(bytes32 => bool))) internal isClaimed;

    /**@dev Set claimed status for a user
     * @param user : User address
     * @param weekId : Week Id
     * @param hash_ : Hash of the claim
     */
    // function _setIsClaimed(address user, uint weekId, bytes32 hash_) internal whenNotPaused onlyApproved() {
    function _setIsClaimed(address user, uint weekId, bytes32 hash_) internal {
        if(!isClaimed[user][weekId][hash_]) isClaimed[user][weekId][hash_] = true;
    }

    /**
        * @notice This function checks if a user has claimed their reward for a specific week.
        * @dev It returns true if the user has claimed the reward, false otherwise.
        * @param user : User address
        * @param weekId : Week Id
        * @return bool : True if user has claimed reward for the week, false otherwise
     */
    function hasClaimed(address user, uint weekId, bytes32 hash_) external view returns(bool) {
        return isClaimed[user][weekId][hash_];
    }

    function _getDeadline(uint weekId) internal view returns(uint96 deadline) {
        deadline = claimDeadlines[weekId];
    }
    
    /**
     * @dev Set claim deadline
     * @param weekId : Week Id
     * @param deadline : New deadline
     */
    function _setClaimDeadline(uint weekId, uint96 deadline) internal {
        claimDeadlines[weekId] = deadline;
    }

    /** 
     * @dev Update minimum token
     * @param minToken : New minimum payable token
     */
    function _setMinimumToken(uint minToken) internal {
        state.minimumToken = minToken;
    }

    /**
     * @dev Set approval for target
     * @param newClaim : Account to set approval for
     */
    function setClaimAddress(address newClaim) public onlyOwner returns(bool) {
        claim = newClaim;
        return true;
    }

    /**
     * @dev Update minimum token - onlyOwner
     * @param minToken : New minimum payable token
     */
    function setMinimumToken(uint minToken) public onlyOwner {
        _setMinimumToken(minToken);
    }

    /**
     * @dev Update transition interval
     * @param intervalInMin : New interval
     * @param pastWeek : Week Id
     */
    function _setTransitionInterval(uint32 intervalInMin, uint pastWeek) internal {
        if(intervalInMin > 0) {
            unchecked {
                uint64 newInterval = intervalInMin * 1 minutes;
                uint64 transitionDate = _now() + newInterval;
                state.transitionInterval = newInterval;
                state.transitionDate = transitionDate;
                _setClaimDeadline(pastWeek, transitionDate);
            }
        } 
    }

    /**
     * @dev Update transition interval
     * @param interval : New interval
     * @notice Transition interval will always reset the transition date 
    */
    function setTransitionInterval(uint32 interval) public onlyOwner {
        if(interval > 0) state.transitionInterval = interval * 1 minutes;
    }

    /**
     * @dev Transition to a new week and return the new week Id
     */
    function _transitionToNewWeek() internal returns(uint newWeekId) {
        state.weekId ++;
        newWeekId = state.weekId;
    }

    /// @dev Return the state variable object
    function _getState() internal view returns(State memory st) {
        st = state;
    }

    /// @dev Update the token variable. Only-owner function
    function setToken(address _token) public onlyOwner returns(bool) {
        require(_token != address(0), "Token is zero");
        token = IKnowToken(_token);
        return true;
    }

    /// @dev Get platform token
    function getPlatformToken() external view returns(address) {
        return address(token);
    }

    // Return the current unix time stamp on the network
    function _now() internal view returns(uint64 time) {
        time = uint64(block.timestamp);
    } 
}


// File contracts/Campaigns.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;
/**
 * @title Campaigns. 
 * @author : Bobeu - https://github.com/bobeu
 * @notice Non-deployable parent contract that perform CRUD operation on campaigns
*/ 
abstract contract Campaigns is Week {
    ///@dev 
    CampaignData[] private campaignList;   

    ///@dev All registered campaign
    mapping(bytes32 => bool) private isRegistered;

    // Campaigns
    // mapping(bytes32 campaignHash => Initializer) private initializer;

    ///@dev Week inititializer
    mapping(uint weekId => mapping(bytes32 => WeekInitializer)) private wInit;

    //week data for all campaigns
    mapping(uint weekId => Campaign[]) private campaigns;


    // Total campaigns
    uint private allCampaigns;

    // Mapping of campaigns to identifiers
    mapping(uint campaignIndex => bytes32 campaingHashValue) private indexer;

    ///@dev Registers a new campaign
    function _checkAndInitializeCampaign(CampaignData memory data) internal {
        if(!isRegistered[data.hash_]){
            isRegistered[data.hash_] = true;
            campaignList.push(data);
        }
    }

    /**
     * @dev Adds a campaign to a new week
     * @param data : Campaign data struct
     * @param weekId : Week Id
     * @param operator : Campaign operator or owner
     * @param fundsNative : Amount to fund in native asset
     * @param fundsERC20 : Amount to fund in erc20 asset
     * @param platformToken : Amount to fund in platform asset
     * @param token : ERC20 token address
    */
    function _addCampaignToNewWeek(
        CampaignData memory data,
        uint weekId,
        address operator,
        uint256 fundsNative,
        uint256 fundsERC20,
        uint256 platformToken,
        address token
    ) internal returns(Campaign memory cmp) {
        WeekInitializer memory wi = wInit[weekId][data.hash_];
        if(!wi.hasSlot){
            wi.hasSlot = true;
            wi.slot = uint32(campaigns[weekId].length);
            campaigns[weekId].push();
            campaigns[weekId][wi.slot].data = CData(platformToken, fundsNative, fundsERC20, 0, _now(), 0, operator, token, data);
            wInit[weekId][data.hash_] = wi;
            cmp = _getCampaign(weekId, data.hash_).cp;
            emit NewCampaign(cmp);
        } else {
            cmp = _getCampaign(weekId, data.hash_).cp;
            unchecked {
                cmp.data.fundsNative += fundsNative;
                cmp.data.platformToken += platformToken;
            }
            if(operator != cmp.data.operator) cmp.data.operator = operator;
            // If token is not zero address, then update the fundsERC20
            // If token is zero address, then fundsERC20 will not be updated

            // If token is same as existing token, then update the fundsERC20
            // If token is different, then update the token address and fundsERC20
            if(fundsERC20 > 0 && token != address(0)) {
                bool execute = false;
                if(token == cmp.data.token){
                    execute = true;
                } else {
                    if(cmp.data.fundsERC20 == 0) {
                        cmp.data.token = token;
                        execute = true;
                    }
                }
                if(execute) {
                    if(IERC20(token).allowance(_msgSender(), address(this)) >= fundsERC20) {
                        if(IERC20(token).transferFrom(_msgSender(), claim, fundsERC20)){
                            unchecked {
                                cmp.data.fundsERC20 += fundsERC20;
                            }
                        }
                    }
                }
            }
            cmp.data.lastUpdated = _now();
            _setCampaign(wi.slot, weekId, cmp.data);
            emit CampaignUpdated(cmp);
        }
    }

    /**
     * @dev Only approved campaign can pass
     * @param hash_ : Campaign Hash : Hash of the campaign string e.g keccack256("Solidity")
     * @param weekId : week id
    */
    function _validateCampaign(bytes32 hash_, uint weekId) internal view {
        require(isRegistered[hash_], "Campaign not registered");
        require(wInit[weekId][hash_].hasSlot, "Campaign not in current week");
    }

    /**
     * @dev Return the hashed result of a campaign string
     * @param campaign : Campaign string
     */
    function _getHash(string memory campaign) internal pure returns(CampaignData memory data) {
        data.encoded = bytes(campaign);
        data.hash_ = keccak256(data.encoded);
    }

    /**
     * @dev Initializeds a new campaign and create an index for it if not exist, Then initialize the campaign for the
     * parsed weekId. If already iniitialized, update the existing campaign in storage.
     * @param data : Campaign data struct
     * @param weekId : Week Id
     * @param operator : Campaign operator or owner
     * @param fundsNative : Amount to fund in native asset
     * @param fundsERC20 : Amount to fund in erc20 asset
     * @param platformToken : Amount to fund in platform asset
     * @param token : ERC20 token address
    */
    function _tryInitializeCampaign(
        uint weekId,
        CampaignData memory data,
        address operator,
        uint256 fundsNative,
        uint256 fundsERC20,
        uint256 platformToken,
        address token
    ) internal returns(Campaign memory cmp) {
        _checkAndInitializeCampaign(data);
        cmp = _addCampaignToNewWeek(
            data, 
            weekId, 
            operator, 
            fundsNative, 
            fundsERC20, 
            platformToken,
            token
        );
        _validateCampaign(data.hash_, weekId);
    }

    ///@dev Activates or deactivates campaigns
    function toggleCampaignStatus(string[] memory _campaigns) public returns(bool) {
        for(uint i = 0; i < _campaigns.length; i++) {
            bytes32 hash_ = _getHash(_campaigns[i]).hash_;
            bool status = isRegistered[hash_];
            isRegistered[hash_] = !status;
        }
        return true;
    }

    /**
     * Fetches the campaign for the particular week
     * @param weekId : Week id
     * @return data : Campaigns
     */
    function _getCampaings(uint weekId) internal view returns(Campaign[] memory data) {
        data = campaigns[weekId];
    }

    /**
     * Update campaign data in storage
     * @param weekId : Week id
     * @param _campaign : Other data
     * @param slot : Campaign Id
     */
    function _setCampaign(
        uint32 slot,
        uint weekId, 
        CData memory _campaign
    ) internal  {
        campaigns[weekId][slot].data = _campaign;
    }

    /**
     * Update campaign data in storage
     * @param weekId : Week id
     * @param slot : Campaign Id
     * @param user : Target user
     */
    function _updateCampaignUsersList(
        uint32 slot,
        uint weekId, 
        address user
    ) internal  {
        campaigns[weekId][slot].users.push(user);
    }

    /**
     * Update other campaign data
     * @param weekId : Week id
     * @param hash_ : Campaign Id
     * @notice Fetch a campaign only if there is a slot for such campaign for the requested week
     */
    function _getCampaign(uint weekId, bytes32 hash_) internal view returns(GetCampaign memory res) {
        WeekInitializer memory wi = wInit[weekId][hash_];
        res.slot = wi.slot;
        if(wi.hasSlot) {
            res.cp = campaigns[weekId][wi.slot];
        }
    }

    ///@dev Return approved campaigns
    function _getApprovedCampaigns() internal view returns(CampaignData[] memory result) {
        result = campaignList;
    }

    ///@dev Return campaigns for the previous week. This will be used to determine the amount claimables by learners
    function getCampaignsForThePastWeek() external view returns(Campaign[] memory result) {
        uint pastWeek = _getState().weekId;
        if(pastWeek == 0) return result;
        return _getCampaings(pastWeek - 1);
    }

    /**
     * @dev Set up all campaigns for the new week. 
     * @notice it transition into a new week bringing forward the funds from the previous week to the new week.
     * @param newIntervalInMin : New interval to update
     * @param callback : Callback function to run for each campaign
    */
    function _initializeAllCampaigns(uint32 newIntervalInMin, uint _platformToken, function(CData memory, uint) internal returns(CData memory) callback) internal returns(uint pastWeek, uint newWeek, CampaignData[] memory cData) {
        State memory st = _getState();
        require(st.transitionDate < _now(), "Transition is in future");
        pastWeek = st.weekId;
        cData = _getApprovedCampaigns();
        newWeek = _transitionToNewWeek();
        _setTransitionInterval(newIntervalInMin, pastWeek);
        for(uint i = 0; i < cData.length; i++) {
            bytes32 hash_ = cData[i].hash_;
            GetCampaign memory cmp = _getCampaign(pastWeek, hash_);
            _bringForward(pastWeek, newWeek, hash_);
            _setCampaign(cmp.slot, pastWeek, callback(cmp.cp.data, _platformToken)); 
        }
    }

    /**
     * @dev Bring forward the campaign balances from the previous week to a new week
     * @param weekEnded : Current week
     * @param newWeek : New week
     * @param hash_ : Campaign hash
     */
    function _bringForward(uint weekEnded, uint newWeek, bytes32 hash_) internal {
        GetCampaign memory prevWk;
        if(weekEnded > 0){
            uint prevWkId = weekEnded - 1;
            // If the week ended is greater than 0, then we can bring forward the funds
            prevWk = _getCampaign(prevWkId, hash_);
            _tryInitializeCampaign(
                newWeek,
                prevWk.cp.data.data,
                prevWk.cp.data.operator,
                prevWk.cp.data.fundsNative,
                prevWk.cp.data.fundsERC20,
                prevWk.cp.data.platformToken,
                prevWk.cp.data.token
            );
            // Reset the funds for the previous week
            prevWk.cp.data.fundsERC20 = 0;
            prevWk.cp.data.fundsNative = 0;
            prevWk.cp.data.platformToken = 0;
            prevWk.cp.data.lastUpdated = _now();
            _setCampaign(prevWk.slot, prevWkId, prevWk.cp.data);
        } else {
            prevWk = _getCampaign(weekEnded, hash_);
            _tryInitializeCampaign(
                newWeek,
                prevWk.cp.data.data,
                prevWk.cp.data.operator,
                0,
                0,
                0,
                prevWk.cp.data.token
            );
        }
    }
}


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/libraries/Utils.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;

library Utils {
    /**@dev Calculate the rate
     * @param fullPoints : Full or aggregate share/points
     * @param unitPoint : Point her user
     * @param principal : Principal amount
     * @param decimals : Number of leading zeros on which the principal is based ex. Celo is based in 18 zeros
     * @notice Rate is returned in %, and we use 1 ether i.e 1e18 as the full percentage i.e 100%
    */
    function calculateShare(
        uint96 fullPoints, 
        uint64 unitPoint,
        uint principal,
        uint8 decimals
    )
        internal
        pure 
        returns (uint share) 
    {
        if(fullPoints == 0 || unitPoint == 0 || principal == 0) return 0;
        require(fullPoints >= unitPoint, 'Invalid principal');
        unchecked {
            uint base = 10 ** decimals;
            share = (((unitPoint * base) / fullPoints) * principal) /base;
        } 
    }
    
}


// File contracts/Learna.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;
contract Learna is Campaigns, ReentrancyGuard {
    using Utils for uint96;

    Mode private mode;

    ///@notice Flag that controls whether to use key mechanism for learners or not
    bool public useKey;

    // Dev Address
    address private dev;

    // Campaign fee receiver
    address private immutable feeTo;

    // Profiles for each campaign in week id
    mapping(uint weekId => mapping(bytes32 hash_ => mapping(address => Profile))) private learners;

    /// @dev All campaigns user subscribed to for all the weeks.
    mapping(uint => mapping(address => bytes32[])) private userCampaigns;

    /// @dev Mapping showing whether users have registred for a campaign for given week or not
    mapping(address => mapping(bytes32 => mapping(uint => bool))) registered;

    modifier validateAddress(address target) {
        require(target != address(0), "Token is zero");
        _;
    }

    /**
     * @dev Constructor
     * @param _admins : Addresses to be added as admin
     * @param transitionInterval : Interval in time with which a week can be sorted. Ex. If its 7 days, this mean an admin
     *                              cannot perform the sort function until its 7 days from the last sorted time. 
     * @param _mode : Deployment mode - LOCAL or LIVE
     * @notice We instanitate the admins array with an empty content. This is to ensure that anyone with slot 0 will always be
     * false otherwise anyone with 0 slot will automatically inherits the attributes of an admin in slot 0. If such as admin is active,
     * anyone could perform an admin role.
     */
    constructor(
        address[] memory _admins, 
        uint32 transitionInterval, 
        Mode _mode, 
        address _feeTo,
        string[] memory _campaigns
    ) {
        _setMinimumToken(1e16);
        mode = _mode;
        dev = _msgSender();
        require(_feeTo != address(0), "Fee manager is zero");
        feeTo = _feeTo;
        if(mode == Mode.LIVE){
            _setTransitionInterval(transitionInterval, _getState().weekId);
            useKey = false;
        } else {
            useKey = true;
        }
        for(uint i = 0; i < _admins.length; i++) {
            if(_admins[i] != address(0)) _addAdmin(_admins[i]); 
        } 

        for(uint i = 0; i < _campaigns.length; i++) {
            _tryInitializeCampaign(_getState().weekId, _getHash(_campaigns[i]), _msgSender(), 0, 0, 0, address(0));
        }
    }

    receive() external payable {}

    /**
     * Fetch profile
     * @param weekId : Week id
     * @param hash_ : Campaign hash
     * @param user : Target user
     * @return profile : Profile data
    */
    function _getProfile(uint weekId, bytes32 hash_, address user) internal view returns(Profile memory profile) {
        profile = learners[weekId][hash_][user];
    }

    /**
     * Toggle useKey status. 
     @notice Toggling the function will continously alter the state of the useKey variable by negating the current status 
    */
    function toggleUseKey() public onlyOwner returns(bool) {
        bool status = useKey;
        useKey = !status;
        return true;
    }

    /**
     * Update profile
     * @param weekId : Week id
     * @param hash_ : Campaign hash
     * @param user : Target user
     * @param profile : Profile data
    */
    function _setProfile(uint weekId, bytes32 hash_, address user, ProfileOther memory profile) internal {
        learners[weekId][hash_][user].other = profile;
    }

    /**
     * Forward value to a specific address
     * @param amount : Amount to forward
     * @param to : Address to forward the fee to
     */
    function _sendValue(uint amount, address to) internal {
        if(amount > 0) {
            require(address(this).balance >= amount, "Insufficient bal");
            (bool s,) = to.call{value: amount}('');
            require(s, "Failed");
        }
    }

    ///////////////////////////////////////////////////////////
    //     PUBLIC FUNCTION : SET UP A CAMPAIGN               //
    ///////////////////////////////////////////////////////////
    /**
     * @dev Add new campaign to the current week and fund it. Also, can be used to increase the funds in existing campaign for the week.
     * @param _campaign : Campaign string
     * @param token : ERC20 contract address if fundsErc20 is greater than 0
     * @param fundsErc20 : Amount to fund the campaign in ERC20 currency e.g $GROW, $G. etc
     * @notice Anyone can setUp or add campaign provided they have enough to fund it. Campaign can be funded in two ways:
     * - ERC20. If the amount in fundsErc20 is greater than 0, it is suppose that the sender intends to also fund the campaign
     *    in ERC20-based asset hence the 'token' parameter must not be zero.
     * - Native such as CELO.
     */
    function setUpCampaign(
        string memory _campaign, 
        uint256 fundsErc20,
        address token
    ) public payable returns(bool) {
        _sendValue(msg.value, claim);
        _tryInitializeCampaign(
            _getState().weekId,
            _getHash(_campaign),
            _msgSender(),
            msg.value,
            fundsErc20,
            0,
            token
        );

        return true;
    }


    /////////////////////////////////////////////////////////////////////////
    //     PUBLIC FUNCTION :  ADJUST THE FUNDS IN A CAMPAING              //
    ////////////////////////////////////////////////////////////////////////
    
    /**
     * @dev Adjust funds in campaigns. Only admin function
     * @param hash_ : Campaign hashes
     * @param erc20Value : ERC20 values.
     * @param nativeValue : Values in native coin e.g CELO
     * @notice The function can increase or decrease the values in a campaign. Just parse desired values.
     *         - Value cannot be adjusted beyond the balances in this contract.
     */
    function adjustCampaignValues(
        bytes32 hash_, 
        uint erc20Value,
        uint nativeValue
    ) public onlyAdmin returns(bool) {
        uint weekId = _getState().weekId;
        _validateCampaign(hash_, weekId);
        GetCampaign memory res = _getCampaign(weekId, hash_);
        require(res.cp.data.token != address(0), "Token is empty");
        require(IERC20(res.cp.data.token).balanceOf(claim) >= erc20Value, "ERC20Bal inconsistent");
        require(claim.balance >= nativeValue, "New value exceeds balance");
        res.cp.data.fundsERC20 = erc20Value;
        res.cp.data.fundsNative = nativeValue;
        res.cp.data.lastUpdated = _now();
        _setCampaign(res.slot, weekId, res.cp.data);

        return true;
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    //    PUBLIC FUNCTION : KEEP TRACK OF POINTS EARNED FROM PARTICIPATING IN QUIZZES     //
    ////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev Delegate transaction to the Admin account also generate user key for all the campaigns.
     */
    function delegateTransaction() external payable returns(bool) {
       return _generateKey(msg.value);
    }

    /**
     * @dev Register users for weekly reward
     * @param user : User 
     * @param hash_ : Campaign hash 
     * @param quizResult : Array of quiz result for a campaign
     * @notice Only owner function
    */
    function recordPoints(address user, QuizResultInput memory quizResult, bytes32 hash_) 
        public 
        payable
        onlyAdmin
        whenNotPaused 
        returns(bool) 
    { 
        uint weekId = _getState().weekId;
        _sendValue(msg.value, feeTo);
        require(user != address(0), "Invalid user"); 
        _validateCampaign(hash_, weekId);
        GetCampaign memory res = _getCampaign(weekId, hash_);
        Profile memory pf = _getProfile(weekId, hash_, user);
        if(!_checkRegistration(weekId, hash_, user)) {
            _updateCampaignUsersList(res.slot, weekId, user);
            unchecked {
                res.cp.data.activeLearners += 1;
            }
        }
        require(pf.other.totalQuizPerWeek <= 120, 'Storage limit exceeded');
    
        unchecked {
            pf.other.totalQuizPerWeek += 1;
            res.cp.data.totalPoints += quizResult.other.score; 
        }
        _setProfile(weekId,  hash_, user, pf.other);
        uint index = learners[weekId][hash_][user].quizResults.length;
        learners[weekId][hash_][user].quizResults.push();
        learners[weekId][hash_][user].quizResults[index].other.id = bytes(quizResult.other.id);
        learners[weekId][hash_][user].quizResults[index].other.quizId = bytes(quizResult.other.quizId);
        learners[weekId][hash_][user].quizResults[index].other.completedAt = bytes(quizResult.other.completedAt);
        learners[weekId][hash_][user].quizResults[index].other.title = bytes(quizResult.other.title);
        learners[weekId][hash_][user].quizResults[index].other.score = quizResult.other.score;
        learners[weekId][hash_][user].quizResults[index].other.totalPoints = quizResult.other.totalPoints;
        learners[weekId][hash_][user].quizResults[index].other.percentage = quizResult.other.percentage;
        learners[weekId][hash_][user].quizResults[index].other.timeSpent = quizResult.other.timeSpent;

        for(uint i = 0; i < quizResult.answers.length; i++){
            AnswerInput memory answer = quizResult.answers[i]; 
            learners[weekId][hash_][user].quizResults[index].answers.push();
            learners[weekId][hash_][user].quizResults[index].answers[i] = Answer(bytes(answer.questionHash), answer.selected, answer.isUserSelected); 
        }
        _setCampaign(res.slot, weekId, res.cp.data); 

        emit PointRecorded(user, weekId, hash_, quizResult);
        return true;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                       PUBLIC FUNCTIONS                                    //
    ///////////////////////////////////////////////////////////////////////////////////////////////

     /**
     * @dev Allocate weekly earnings
     * @param newIntervalInMin : New transition interval for the new week. The interval is used to determined the claim deadline.
     * @param amountInKnowToken : Amount to allocate in GROW token
     * @notice We first for allowance of owner to this contract. If allowance is zero, we assume allocation should come from
     * the GROW Token. Also, previous week payout will be closed. Learners must withdraw from past week before the current week ends
    */
    function sortWeeklyReward(uint amountInKnowToken, uint32 newIntervalInMin) 
        public 
        whenNotPaused 
        onlyAdmin
        returns(bool) 
    {
        (uint currentWk, uint newWk, CampaignData[] memory cData) = _initializeAllCampaigns(newIntervalInMin, amountInKnowToken, _callback);
        if(amountInKnowToken > 0) {
            require(address(token) != address(0), "Tk empty");
            require(token.allocate(amountInKnowToken, claim), 'Allocation failed');
        }

        emit Sorted(currentWk, newWk, cData);  
 
        return true;
    }

    /**
     * @dev Triggers stopped state.
    */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Returns to normal state.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    ///////////////////////////////////
    //        INTERNAL FUNCTIONS     //
    ///////////////////////////////////

    /**@dev If activated, generate new key for the user, and allocate some amount of GROW token to them based on the 
        amount of value they have sent along with the call. 
    */
    function _createKey(address user, uint value, uint weekId, bytes32 hash_) internal returns(Profile memory pf) {
        pf = _getProfile(weekId, hash_, user);
        if(value > 0) {
            token.allocate(value, user);
        }
        if(!pf.other.haskey) {
            pf.other.haskey = true;
            pf.other.passkey = keccak256(abi.encodePacked(user, weekId, value));
        }
    }

    /**
     * @dev Generate user key for all campaigns in the current week.
     * @param value : Amount sent as minimum token
     */
    function _generateKey(uint256 value) internal returns(bool) {
        uint weekId = _getState().weekId;
        uint minimumToken = _getState().minimumToken;
        Campaign[] memory cps = _getCampaings(weekId);
        if(minimumToken > 0) {
            require(value >= minimumToken, "Insufficient token");
        }
        _sendValue(value, feeTo);
        uint valuePerCampaign;
        if(value > 0 && value >= cps.length) {
            unchecked {
                valuePerCampaign = value / cps.length;
            }
        }
        address user = _msgSender();
        for(uint i = 0; i < cps.length; i++) {
            bytes32 hash_ = cps[i].data.data.hash_;
            Profile memory pf = _createKey(user, valuePerCampaign, weekId, hash_);
            _setProfile(weekId,  hash_, user, pf.other);
        }
        return true;
    }

    function _checkRegistration(uint weekId, bytes32 hash_, address user) internal returns(bool isReg) {
        if(!registered[user][hash_][weekId]){
            registered[user][hash_][weekId] = true;
            userCampaigns[weekId][user].push(hash_);
        } else {
            isReg = true;
        }
    }

    /**
     * @dev Callback function to update campaign values
     * @param weekId : Week Id
     * @param hash_ : Campaign hash
     * @param fundsNative : Amount in native currency e.g CELO
     * @param fundsERC20 : Amount in ERC20 currency e.g $GROW, $G. etc
     * @param platformToken : Amount in platform token e.g GROW token
    */
    function onCampaignValueChanged(
        uint weekId, 
        bytes32 hash_, 
        uint256 fundsNative, 
        uint256 fundsERC20,
        uint256 platformToken,
        address user
    ) external onlyApproved {
        // _validateCampaign(hash_, weekId);
        _setIsClaimed(user, weekId, hash_);
        GetCampaign memory res = _getCampaign(weekId, hash_);
        if(res.cp.data.fundsERC20 >= fundsERC20){
            res.cp.data.fundsERC20 -= fundsERC20;
        }
        if(res.cp.data.fundsNative >= fundsNative){
            res.cp.data.fundsNative -= fundsNative;
        }
        if(res.cp.data.platformToken >= platformToken){
            res.cp.data.platformToken -= platformToken;
        }
        res.cp.data.lastUpdated = _now();
        _setCampaign(res.slot, weekId, res.cp.data);
    }

    function _callback(CData memory _cp, uint platformToken) internal returns(CData memory cp) {
        cp = _cp;
        (uint native, uint256 erc20) = _rebalance(cp.token, cp.fundsNative, cp.fundsERC20);
        cp.fundsNative = native;
        cp.fundsERC20 = erc20;
        unchecked {
            cp.platformToken += platformToken;
        }
        cp.lastUpdated = _now();
    }
    
    /**
     * @dev Calculates user's share of the weekly payout
     * @param userPoints : Total points accumulated by the user
     * @param cp : Campaign 
     */
    function _calculateShare( 
        uint64 userPoints, 
        CData memory cp
    ) internal view returns(uint erc20Amount, uint nativeClaim, uint platform) {
        uint8 erc20Decimals;
        assert(cp.totalPoints >= userPoints);
        if(cp.totalPoints > 0 && cp.token != address(0)) { 
            erc20Decimals = IERC20Metadata(cp.token).decimals(); 
            unchecked {
                if(cp.fundsERC20 > 0) erc20Amount = cp.totalPoints.calculateShare(userPoints, cp.fundsERC20, erc20Decimals);
                if(cp.fundsNative > 0) nativeClaim = cp.totalPoints.calculateShare(userPoints, cp.fundsNative, 18);
                if(cp.platformToken > 0) {
                    erc20Decimals = IERC20Metadata(address(token)).decimals();
                    platform =  cp.totalPoints.calculateShare(userPoints, cp.platformToken, erc20Decimals);
                }
            }
        }
    }

    /**
     * Check reward eligibility for the requested week
     * @param user : Target user
     * @param weekId : Requested week Id
     * @param hash_ : Hash of the campaign name
     */
    function _getEligibility(address user, bytes32 hash_, uint weekId, bool nullifier, bool validate) 
        internal 
        view 
        returns(Eligibility memory elg) 
    {
        if(validate) _validateCampaign(hash_, weekId);
        if(!isClaimed[user][weekId][hash_]) {
            CData memory cp = _getCampaign(weekId, hash_).cp.data;
            Profile memory pf = _getProfile(weekId, hash_, user);
            uint64 totalScore;
            for(uint i = 0; i < pf.quizResults.length; i++) { 
                unchecked {
                    totalScore += pf.quizResults[i].other.score;
                }
            }
            (uint erc20, uint native, uint platform) = _calculateShare(nullifier? 0 : totalScore, cp);
            bool protocolVerified = mode == Mode.LIVE? _now() <= _getDeadline(weekId) && (cp.fundsNative > 0 || cp.fundsERC20 > 0) : true;
            bool isEligible = protocolVerified && (native > 0 || erc20 > 0 || platform > 0);
            elg = Eligibility(
                isEligible,
                erc20,  
                native, 
                platform,
                cp.token, 
                hash_,
                weekId
            );
        }
    }

    /**
     * @dev Assign 2% of payouts to the dev
     * @param token : ERC20 token to be used for payout
     * @return nativeBalance : Celo balance of this contract after dev share 
     * @return erc20Balance : ERC20 balance of this contract after dev share
     */
    function _rebalance(address token, uint256 native, uint256 erc20) internal returns(uint256 nativeBalance, uint256 erc20Balance) {
        uint8 devRate = 2;
        nativeBalance = native;
        erc20Balance = erc20;
        uint devShare;
        unchecked {
            if(nativeBalance > 0 && (address(this).balance >= nativeBalance)) {
                devShare = (nativeBalance * devRate) / 100;
                (bool done,) = dev.call{value: devShare}('');
                require(done, 'T.Failed');
                nativeBalance -= devShare;
            }
            if(erc20Balance > 0 && (IERC20(token).balanceOf(address(this)) >= erc20Balance)) {
                devShare = (erc20Balance * devRate) / 100;
                if(token != address(0)){
                    require(IERC20(token).transfer(dev, devShare), 'ERC20 TFailed');
                }
                erc20Balance -= devShare; 
            }
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    //                          READ-ONLY FUNCTIONS                                //
    /////////////////////////////////////////////////////////////////////////////////

    /**
     * Get users eligibility for all the campaigns for the previous weeks ended
     * @param user : User
     * @notice Claim will always be for the concluded 3 weeks back. The position must match and can be extracted directly from 
     * the frontend when reading the user's campaigns. Learner can only claim from the past three weeks campaign pool; 
     */
    function checkEligibility(address user) 
        external 
        view
        returns(Eligibilities memory result) 
    {
        uint weekId = _getState().weekId;
        if(weekId > 0) weekId -= 1;
        Campaign[] memory cps = _getCampaings(weekId);
        uint cSize = cps.length;
        result.elgs = new Eligibility[](cSize);
        result.weekId = weekId;
        for(uint j = 0; j < cSize; j++){
            bool nullifier = false;
            // If useKey is enabled, learners must have created a key for all the campaigns they subscribed to
            if(useKey){
                if(!_getProfile(weekId, cps[j].data.data.hash_, user).other.haskey) nullifier = true;
            }
            result.elgs[j] = _getEligibility(user, cps[j].data.data.hash_, weekId, nullifier, false);
        }

        return result;
    } 

    // Fetch past claims
    function getData(address user) public view returns(ReadData memory data) {
        data.state = _getState();
        data.approved = _getApprovedCampaigns();
        uint weekIds = data.state.weekId;
        weekIds ++;
        data.wd = new WeekData[](weekIds);
        data.profileData = new WeekProfileData[](weekIds);
        uint hashSize = data.approved.length; 
        for(uint i = 0; i < weekIds; i++) {
            data.wd[i].campaigns = _getCampaings(i);
            data.wd[i].claimDeadline = _getDeadline(i);
            ReadProfile[] memory _userCampaigns = new ReadProfile[](hashSize);
            if(user != address(0)) {
                data.profileData[i].weekId = i;
                for(uint hashId = 0; hashId < hashSize; hashId++) { 
                    bytes32 hash_ = data.approved[hashId].hash_;
                    bool nullifier = false;
                    // If useKey is enabled, learners must have created a key for all the first campaign they joined
                    if(useKey){
                        if(!_getProfile(i, hash_, user).other.haskey) nullifier = true;
                    }
                    _userCampaigns[hashId] = ReadProfile( 
                        _getEligibility(user, hash_, i, nullifier, false),
                        _getProfile(i, hash_, user), 
                        isClaimed[user][i][hash_],
                        hash_
                    );
                }
                data.profileData[i].campaigns = _userCampaigns;
            }
        }
        return data;
    } 
}
