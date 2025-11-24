// Sources flattened with hardhat v2.26.3 https://hardhat.org

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


// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)

pragma solidity >=0.4.16;

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File @openzeppelin/contracts/interfaces/IERC165.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC165.sol)

pragma solidity >=0.4.16;


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


// File @openzeppelin/contracts/interfaces/IERC20.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC20.sol)

pragma solidity >=0.4.16;


// File @openzeppelin/contracts/interfaces/IERC1363.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC1363.sol)

pragma solidity >=0.6.2;


/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
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


// File @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol@v5.4.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC20/utils/SafeERC20.sol)

pragma solidity ^0.8.20;


/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Opposedly, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturnBool} that reverts if call fails to meet the requirements.
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            let success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            // bubble errors
            if iszero(success) {
                let ptr := mload(0x40)
                returndatacopy(ptr, 0, returndatasize())
                revert(ptr, returndatasize())
            }
            returnSize := returndatasize()
            returnValue := mload(0)
        }

        if (returnSize == 0 ? address(token).code.length == 0 : returnValue != 1) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silently catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0)
        }
        return success && (returnSize == 0 ? address(token).code.length > 0 : returnValue == 1);
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


// File contracts/v3/ApprovalFactory.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.28;
interface IApprovalFactory {
    error AddressIsZero();
    error AddressHasApproval();
    error AddressHasNoApproval();

    event Approval(address[]);
    event ApprovalRemoved(address[]);

    function hasApproval(address target) external view returns(bool);
    function getInterfacer() external view returns(address);
}

contract ApprovalFactory is IApprovalFactory, Ownable {
    address public interfacer;

    // Mapping of account to approvals
    mapping (address => bool) private approval;

    constructor() Ownable(_msgSender()) {
        _setApprovalFor(_msgSender());
    }

    function getInterfacer() external view returns(address){
        require(interfacer != address(0),"Interfacer is zero");
        return interfacer;
    }

    function setInterfacer(address newInterfacer) public onlyOwner returns(bool) {
        require(newInterfacer != address(0), "New interfacer is zero");
        interfacer = newInterfacer;
        _setApprovalFor(newInterfacer);
        return true;
    }

    /**
     * @dev Set approval for
     * @param target : Account to set approval for
     */
    function _setApprovalFor(address target) internal {
        if(target == address(0)) revert AddressIsZero();
        if(_isApproved(target)) revert AddressHasApproval();
        approval[target] = true;
    }

    /**
     * @dev Remove approval for
     * @param target : Account to set approval for
     */
    function _removeApprovalFor(address target) internal {
        if(!_isApproved(target)) revert AddressHasNoApproval();
        approval[target] = false;
    }

    /**
     * @dev Set approval for target
     * @param targets : Accounts to set approval for
     */
    function setApproval(address[] memory targets) public onlyOwner {
        for(uint i = 0; i < targets.length; i++) {
            _setApprovalFor(targets[i]);
        }
        emit Approval(targets);
    }

    /**
     * @dev Set approval for target
     * @param targets : Accounts to set approval for
     */
    function removeApproval(address[] memory targets) public onlyOwner {
        for(uint i = 0; i < targets.length; i++) {
            _removeApprovalFor(targets[i]);
        }
        emit ApprovalRemoved(targets);
    }

    /**
     * @dev Set approval for target
     * @param target : Account to set approval for
     */
    function _isApproved(address target) internal view returns(bool result) {
        result = approval[target];
    }

    /**
     * @dev Check approval for target
     * @param target : Account to set approval for
     */
    function hasApproval(address target) external view returns(bool) {
        return _isApproved(target);
    }
}


// File contracts/interfaces/Common.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;

interface Common {
    struct ShareOut {
        uint erc20;
        uint native;
        address token;
    }
}


// File contracts/v3/interfaces/ICampaignTemplate.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;
interface ICampaignFactory { 
    error FeetoIsTheSame();
    error ZeroAddress();
    error InsufficientValue();
    error NoApproval();

    event NewCampaign(address indexed sender, address indexed campaign);

    struct Campaign {
        address creator;
        address identifier;
    }

    struct UserCampaign {
        address user;
        address campaign;
        bool isCreator;
    }

    struct ReadData {
        address dev;
        address feeTo;
        uint creationFee;
        IApprovalFactory approvalFactory;
        Campaign[] campaigns;
    }

    function getCampaign(uint index) external view returns(Campaign memory);
}

interface IInterfacer {
    function updateUserCampaign(address user) external;
    function registerCampaign(address _campaign) external;
    function syncClaim(address target) external returns(bool);
}

interface ICampaignTemplate {
    error InvalidEpoch();
    error ClaimNotReady();
    error BalanceAnomally();
    error NotTheOperator();
    error InsufficientValue();
    error NoProofOfLearning();
    error MaxFundDepthExceeded();
    error CannotShareZeroValue();
    error MaxProofPerDayExceeded();

    event Claimed(address indexed sender, Common.ShareOut);
    event Proof(ProofOfAssimilation poa, address indexed sender);
    event ERC20FundAdded(bytes32 indexed hash_, address indexed _token, uint amount);
    event PointsUpdated(address[] targets, uint32[] points, uint epoch);

    // POASS - Proof Of Assimilation, POINT - Proof Of Integration
    enum RewardType { POASS, POINT }

    struct ProofOfAssimilation {
        uint8 questionSize;
        uint32 score;
        uint64 totalPoints;
        uint16 percentage;
        uint64 timeSpent;
        bytes completedAt;
    }

    struct Link {
        bytes value;
        uint64 submittedAt;
    }

    struct ProofOfIntegration {
        Link[3] links; // Can be any link to learner's portfolio e.g Githuh, figma etc
        uint64 approvedAt; 
        uint64 score; // This is the point earned for integration not the actual token amount. Calculation is based on the total points for the campaign/epoch
        bool verified; // Link must be verified before builder can be eligible for their reward
    }

    ///@dev Expected to be rated by AI after quiz or test completion
    struct Performance {
        uint64 value; 
        bytes ratedAt; // Date rated
    }

    // This should be a link to user portfolio such as github or any link to proof that user integrate or learn something valuable;
    // Proof of assimilation is achieved when user successfully complete a short training section with our Agent and take the short test to proof that they understand what they just learnt. They in turn earn POINT token as reward. They earn other asset provided by the campaign operator when they successfully integrate what they learned
    // When users take a test to proof they understand what the learned about a particular subject, they can always retake it. Retaking will override their previous scores. They can continue to retake the test until they find the best scores.
    // Our AI agent provides feedback, possible areas of improvement and ratings to learners before they send the scores to the blockchain. 
    // Note, ratings are hidden until saved onchain. Feedbacks are shown to learners in an instant.
    struct Learner {
        address id;
        Performance[] ratings;
        ProofOfIntegration point;
        ProofOfAssimilation[] poass;
    }
    
    struct ERC20Token {
        address token;
        bytes tokenName;
        bytes tokenSymbol;
        uint256 amount;
        uint8 decimals;
    }

    struct Metadata {
        bytes32 hash_; // Keccack256 value of the campaign name with the 
        bytes name; // Campaign name e.g Divvi
        bytes link; // Any other relevant link
        bytes description; // Max length is 300
        bytes imageUrl;
        uint64 startDate;
        uint64 endDate;
    }

    struct MetadataInput {
        string name; // Campaign name. Ex. Celo
        string link; // Any other relevant link
        string description; // Max length is 300
        string imageUrl;
        uint64 endDateInHr;
    }

    struct Spot {
        uint value;
        bool hasValue;
    }

    struct Funds {
        ERC20Token[] erc20Ass;
        ERC20Token[] erc20Int;
        uint256 nativeAss; // Proof Of Assimilation native reward
        uint256 nativeInt; // Proof of integration native reward
    }

    struct EpochSetting {
        uint24 maxProof; // Maximum assimilation learners can prove in a day
        uint64 endDate;
        Funds funds;
    }

    struct EpochData {
        uint64 totalProofs;
        EpochSetting setting;
        Learner[] learners;
    }

    struct Frequency {
        uint64 lastSeen;
        uint8 times;
    }

    struct EpochSettingInput {
        uint24 maxProof; // Maximum assimilation learners can prove in a day
        // bool isEditing;
        uint24 endInHr;
        address[] tokens;
        address newOperator;
    }

    struct ReadData {
        EpochData[] epochData;
        Metadata metadata;
        IApprovalFactory approvalFactory;
        uint epoches;
        address owner;
        bool[] isPoassClaimed;
        bool[] isPointClaimed;
    }

    function epochSetting(EpochSettingInput memory arg, RewardType rwType) external payable returns(bool);
    function proveAssimilation(ProofOfAssimilation memory poa, Performance memory rating, address user) external returns(bool);
    function claimRewardForPOASS(uint8 fundIndex, uint epoch, address user) external returns(bool);
    function claimRewardForPOINT(uint8 fundIndex, uint epoch, address user) external returns(bool);
    function submitProofOfIntegration(string[3] memory links, address user) external returns(bool);
    function approveIntegration(address[] memory targets, uint32[]memory points, uint epoch, address op) external returns(bool);
    function addFund(address token, address op, RewardType rwType) external payable returns(bool);
    function editMetaData(MetadataInput memory _meta) external returns(bool);
    function pause() external returns(bool);
    function unpause() external returns(bool);
    function getUserPoints(uint epoch, address user) external view returns(uint64 points);
}


// File contracts/v3/CampaignMetadata.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;
abstract contract CampaignMetadata is ICampaignTemplate, Pausable {
    // Campaign information such as name, etc. 
    Metadata internal metadata;

    ///@notice Approval factory contract
    IApprovalFactory internal approvalFactory;

    ///@notice Operator address
    address internal operator;

    ///@dev Only operator function
    modifier onlyApproved(address target) {
        require(approvalFactory.hasApproval(_msgSender()), "No approval");
        if(target != address(0)) {
            require(target == operator || approvalFactory.hasApproval(target), "No approval for target");
        }
        _;
    }

    ///@notice Constructor
    constructor(
        IApprovalFactory _approvalFactory, 
        MetadataInput memory meta,
        address _operator
    ) payable {
        approvalFactory = _approvalFactory;
        _setMetadata(meta, true);
        operator = _operator;
    }

    ///@dev Set proofMeta information
    function _setMetadata(MetadataInput memory _meta, bool editStartDate) internal {
        if(bytes(_meta.description).length > 0) {
            if(bytes(_meta.description).length < 501) metadata.description = bytes(_meta.description);
        }
        if(bytes(_meta.name).length > 0) {
            metadata.name = bytes(_meta.name);
            metadata.hash_ = keccak256(abi.encodePacked(bytes(_meta.name), address(this)));
        }
        if(bytes(_meta.imageUrl).length > 0) metadata.imageUrl = bytes(_meta.imageUrl);
        if(bytes(_meta.link).length > 0) metadata.link = bytes(_meta.link);
        unchecked {
            if(_meta.endDateInHr > 0) metadata.endDate = uint64(_now() + (_meta.endDateInHr * 1 hours));
            if(editStartDate) metadata.startDate = uint64(_now());
        }
    }

    /**@dev Set metadata
        @param _meta: New metadata
     */
    function editMetaData(MetadataInput memory _meta) external onlyApproved(address(0)) returns(bool) {
        _setMetadata(_meta, false);
        return true;
    }

    ///@dev Only approved account can pause execution
    function pause() external onlyApproved(address(0)) returns(bool) {
        _pause();
        return true;
    }

    ///@dev Only approved account can continue execution
    function unpause() external onlyApproved(address(0)) returns(bool) {
        _pause();
        return true;
    }

    ///@dev Only approved account can continue execution
    function _now() internal view returns(uint64 currentTime) {
        currentTime = uint64(block.timestamp);
    }
}


// File contracts/v3/UtilsV3.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;
library UtilsV3 {
    using SafeERC20 for IERC20;
    
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

    /**
     * @dev Claim ero20 token
     * @param recipient : Recipient
     * @param amount : Amount to transfer
     * @param token : token contract
     */
    function _sendErc20(address recipient, uint amount, address token) internal {
        if(token != address(0)) {
            uint balance = IERC20(token).balanceOf(address(this));
            if(balance > 0 && balance >= amount) {
                IERC20(token).safeTransfer(recipient, amount);
            }
        }
    }

    /**
     * Forward value to a specific address
     * @param amount : Amount to forward
     * @param to : Address to forward the fee to
     */
    function _sendValue(address to, uint amount) internal {
        if(amount > 0) {
            if(address(this).balance >= amount){
                if(to != address(0)){
                    (bool s,) = to.call{value: amount}('');
                    require(s, "Failed");
                }
            }
        }
    }

    
    /**
     * @dev Assign 5% of payouts to the dev
     * @param dev : Dev address
     * @param _in : Share data of type Common.ShareOut
     */
    function _rebalance(address dev, Common.ShareOut memory _in) internal returns(Common.ShareOut memory out) {
        uint8 devRate = 5;
        out = _in;
        uint devShare;
        unchecked {
            if(out.native > 0 && (address(this).balance >= out.native)) {
                devShare = (out.native * devRate) / 100;
                _sendValue(dev, devShare);
                out.native -= devShare;
            }
            if(out.erc20 > 0 && (IERC20(out.token).balanceOf(address(this)) >= out.erc20)) {
                devShare = (out.erc20 * devRate) / 100;
                _sendErc20(dev, devShare, out.token);
                out.erc20 -= devShare; 
            }
        }
    } 
}


// File contracts/v3/CampaignTemplate.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;
contract CampaignTemplate is ICampaignTemplate, CampaignMetadata {
    using UtilsV3 for *;

    /**@dev Stage of this campaign
        @notice Campaign can be configured to have names for each epoch
     */
    uint private epoches;

    address private dev;

    /**@dev Mapping showing whether user has claimed reward for an epoch or not
        @notice We use address(this) to represent 3rd key in the mapping for the native coin e.g Celo. Since there can be more than one reward token in a campign,
        we use the address for each token as 3rd key in the mapping.
     */
    mapping(RewardType => mapping(uint epoch => mapping(address user => mapping(address token => bool)))) private isClaimed;

    ///@notice Frequencies at which learners save proof of assimilation in every 24 hours 
    mapping(address => Frequency) private frequencies;

    ///@notice Position of current user in the list of learners in a given epoch
    mapping(address => mapping(uint epoch => Spot)) private spots;

    ///@notice Total prooved points for each epoch
    mapping(uint epoch => EpochData) private epochData;

    modifier validateEpochInput(uint epoch) {
        if(epoch > epoches) revert InvalidEpoch();
        _;
    }

    /** Constructor
     * @notice By default funds are added to the native asset for proof of assimilation if any
     */
    constructor(
        address _operator, 
        address _dev, 
        IApprovalFactory _approvalFactory, 
        MetadataInput memory meta
    ) payable CampaignMetadata(_approvalFactory, meta, _operator) {
        dev = _dev;
        unchecked {
            if(msg.value > 0) epochData[epoches].setting.funds.nativeAss += msg.value;
            if(meta.endDateInHr > 0) {
                metadata.endDate = _now() + uint64(meta.endDateInHr * 1 hours);
            }
        }
    }

    receive() external payable {
        unchecked {
            epochData[epoches].setting.funds.nativeInt += msg.value;
        }
    }

    /**@notice Fetch the type of funds from the storage
        @param rwType : Type of reward
        @param fundIndex : The position of the fund in the array
        @param epoch : Epoch Id
     */
    function _getFunds(
        RewardType rwType, 
        uint fundIndex, 
        uint epoch
    ) internal view returns(ERC20Token memory erc20, uint256 native) {
        uint fundSize;
        if(rwType == RewardType.POASS) {
            fundSize = epochData[epoch].setting.funds.erc20Ass.length;
            if(fundSize > 0 && fundIndex < fundSize){
                erc20 = epochData[epoch].setting.funds.erc20Ass[fundIndex];
            }
            native = epochData[epoch].setting.funds.nativeAss;
        } else {
            fundSize = epochData[epoch].setting.funds.erc20Int.length;
            if(fundSize > 0 && fundIndex < fundSize){
                erc20 = epochData[epoch].setting.funds.erc20Int[fundIndex];
            }
            native = epochData[epoch].setting.funds.nativeInt;
        }
    }

    /**
     * @dev Calculates user's share of the payout
     * @param rwType Typeof reward i.e POINT or POASS
     * @param userProofs : Total proved points accumulated by the learner over the campaign preiod 
     * @param totalProofs : Total assimilation proved for the period/epoch;
     * @param fundIndex : The position of the ERC20 fund to claim in the fund array if any. This should be correctly parsed from the frontend, otherwis it fails.
     * @param epoch : Current epoch
     * @param target : Target account
     */
    function _calculateShare(
        RewardType rwType,
        uint64 userProofs, 
        uint64 totalProofs, 
        uint8 fundIndex, 
        uint epoch, 
        address target
    ) internal view returns(Common.ShareOut memory sh) {
        uint8 dec;
        if(totalProofs >= userProofs) {
            if(totalProofs > 0 && userProofs > 0) { 
                unchecked {
                    (ERC20Token memory erc, uint256 native) = _getFunds(rwType, fundIndex, epoch);
                    if(!isClaimed[rwType][epoch][target][address(this)]){
                        if(native > 0) sh.native = totalProofs.calculateShare(userProofs, native, 18);
                    }
                    if(erc.amount > 0) {
                        if(erc.token != address(0)){
                            sh.token = erc.token;
                            if(!isClaimed[rwType][epoch][target][erc.token]) {
                                dec = IERC20Metadata(erc.token).decimals();
                                sh.erc20 = totalProofs.calculateShare(userProofs, erc.amount, dec);
                            }
                        }
                    }
                }
            }
        }
    }

    /** @dev Get total points for user for specific epoch
        @param epoch : Epoch Id
        @param user: Target address
     */
    function getUserPoints(uint epoch, address user) external view returns(uint64 points) {
        return _aggregateProofs(epoch, spots[user][epoch].value);
    }

    /**@dev Aggregate all proofs for the current learner
        @param epoch: Epoch Id
        @param userIndex : Position of the learner in the Learners' array
     */
    function _aggregateProofs(uint epoch, uint userIndex) internal view returns(uint64 userProofs) {
        ProofOfAssimilation[] memory poass = epochData[epoch].learners[userIndex].poass;
        for(uint i = 0; i < poass.length; i++) {
            unchecked {
                userProofs += poass[i].score;
            }
        }
    }

    /**@dev Aggregate all proof of integration
        @param epoch: Epoch Id
     */
    function _getProofsOfInt(uint epoch) internal view returns(uint64 totalProofs) {
        Learner[] memory lnr = epochData[epoch].learners;
        for(uint i = 0; i < lnr.length; i++) {
            unchecked {
                totalProofs += lnr[i].point.score;
            }
        }
    }

    function _tryStartAndReturnEpoch() private returns(uint newEpoch) {
        uint64 currentTime = _now();
        if(currentTime >= metadata.endDate) {
            epoches += 1;
            metadata.startDate = currentTime;
        }
        newEpoch = epoches;
    }

    /**@dev Perform setting for current epoch
        @param arg : Setting of type EpochSettingInput
        @param rwType: Reward type
    */
    function epochSetting(EpochSettingInput memory arg, RewardType rwType) external payable onlyApproved(address(0)) returns(bool) {
        uint epoch = _tryStartAndReturnEpoch();
        EpochSetting storage eps = epochData[epoch].setting;
        if(arg.maxProof != eps.maxProof) eps.maxProof = arg.maxProof;
        unchecked {
            if(arg.endInHr > 0) {
                uint64 newEndDate = _now() + uint64(arg.endInHr * 1 hours);
                metadata.endDate = newEndDate;
                eps.endDate = newEndDate;
            }
        }

        if(arg.tokens.length > 0) {
            for(uint i = 0; i < arg.tokens.length; i++) {
                _setUpERC20Funds(arg.tokens[i], arg.newOperator, rwType, msg.value);
            }
        }

        return true;
    }

    /**@dev Record points based on learning outcome
        @param poa : Proof of assimilation object
        @param rating : Performance rating for completing a path
     */
    function proveAssimilation(ProofOfAssimilation memory poa, Performance memory rating, address user) external onlyApproved(address(0)) whenNotPaused returns(bool) {
        uint epoch = _tryStartAndReturnEpoch();
        Spot storage spot = spots[user][epoch];
        if(!spot.hasValue) {
            spot.hasValue = true;
            spot.value = epochData[epoch].learners.length;
            epochData[epoch].learners.push();
            epochData[epoch].learners[spot.value].id = user;
        }
        Frequency storage fq = frequencies[user];
        uint24 maxProof = epochData[epoch].setting.maxProof;
        unchecked {
            if(fq.lastSeen > 0) {
                if((_now() - fq.lastSeen) < 24 hours) {
                    if(maxProof > 0) {
                        if(fq.times > maxProof) revert MaxProofPerDayExceeded();
                    }
                } else{
                    fq.lastSeen = _now();
                }
            } else {
                fq.lastSeen = _now();
            }
            fq.times += 1;
            epochData[epoch].totalProofs += poa.score;
        }
        epochData[epoch].learners[spot.value].poass.push(poa);
        epochData[epoch].learners[spot.value].ratings.push(rating);
        IInterfacer(approvalFactory.getInterfacer()).updateUserCampaign(user);

        emit Proof(poa, user);
        return true;
    }

    /**@dev Claim reward for proof of assimilation
        @param fundIndex : The position of the erc20 token in the list of erc20 funds.
        @param epoch : Epoch to claim from .
        @notice Learners can only claim from an epoch if the epoch deadline has passed.
     */
    function claimRewardForPOASS(uint8 fundIndex, uint epoch, address user) external onlyApproved(address(0)) whenNotPaused validateEpochInput(epoch) returns(bool) {
        if(_now() < epochData[epoch].setting.endDate) revert ClaimNotReady();
        _tryStartAndReturnEpoch();
        Spot memory spot = spots[user][epoch];
        Common.ShareOut memory sh = dev._rebalance(
            _calculateShare(
                RewardType.POASS,
                _aggregateProofs(epoch, spot.value), 
                epochData[epoch].totalProofs, 
                fundIndex, 
                epoch, 
                user
            )
        );
        unchecked {
            if(sh.erc20 > 0) {
                isClaimed[RewardType.POASS][epoch][user][sh.token] = true;
                epochData[epoch].setting.funds.erc20Ass[fundIndex].amount -= sh.erc20;
                user._sendErc20(sh.erc20, sh.token);
            }
            if(sh.native > 0) {
                isClaimed[RewardType.POASS][epoch][user][address(this)] = true;
                epochData[epoch].setting.funds.nativeAss -= sh.native;
                user._sendValue(sh.native);
            }
        }
        emit Claimed(user, sh);
        return true;
    }

    /**@dev Claim reward for proof of integration 
        @param fundIndex : The position of the erc20 token in the list of erc20 funds.
        @param epoch : Epoch to claim from .
        @notice Learners can only claim from an epoch if the epoch deadline has passed.
     */
    function claimRewardForPOINT(
        uint8 fundIndex, 
        uint epoch,
        address user
    ) external onlyApproved(address(0)) whenNotPaused validateEpochInput(epoch) returns(bool) {
        if(_now() < epochData[epoch].setting.endDate) revert ClaimNotReady();
        Spot memory spot = spots[user][epoch];
        Common.ShareOut memory sh = dev._rebalance(
            _calculateShare(
                RewardType.POINT,
                epochData[epoch].learners[spot.value].point.score, 
                _getProofsOfInt(epoch), 
                fundIndex, 
                epoch, 
                user
            )
        );
        unchecked {
            if(sh.erc20 > 0) {
                isClaimed[RewardType.POINT][epoch][user][sh.token] = true;
                epochData[epoch].setting.funds.erc20Int[fundIndex].amount -= sh.erc20;
                user._sendErc20(sh.erc20, sh.token);
            }
            if(sh.native > 0) {
                isClaimed[RewardType.POINT][epoch][user][address(this)] = true;
                epochData[epoch].setting.funds.nativeInt -= sh.native;
                user._sendValue(sh.native);
            }
        }
        emit Claimed(user, sh);
        return true;
    }

    /**@dev Add erc20 funds to this campaign
        @param token: Token address
        @param op: Operator's address
        @param rwType: Reward type
     */
    function _setUpERC20Funds(
        address token, 
        address op, 
        RewardType rwType,
        uint nativeValue
    ) internal {
        uint epoch = epoches;
        if(nativeValue > 0) rwType == RewardType.POASS? epochData[epoch].setting.funds.nativeAss += nativeValue : epochData[epoch].setting.funds.nativeInt += nativeValue;
        if(token != address(0)) {
            uint8 tokenCount = rwType == RewardType.POASS? uint8(epochData[epoch].setting.funds.erc20Ass.length) : uint8(epochData[epoch].setting.funds.erc20Int.length);
            if(tokenCount < 3) {
                uint allowance = IERC20(token).allowance(op, address(this));
                if(allowance > 0) {
                    IERC20(token).transferFrom(op, address(this), allowance);
                    if(rwType == RewardType.POASS) {
                        epochData[epoch].setting.funds.erc20Ass.push(
                            ERC20Token (
                                token,
                                bytes(IERC20Metadata(token).name()),
                                bytes(IERC20Metadata(token).symbol()),
                                allowance,
                                IERC20Metadata(token).decimals()
                            )
                        );
                    } else {
                        epochData[epoch].setting.funds.erc20Int.push(
                            ERC20Token (
                                token,
                                bytes(IERC20Metadata(token).name()),
                                bytes(IERC20Metadata(token).symbol()),
                                allowance,
                                IERC20Metadata(token).decimals()
                            )
                        );
                    }
                    emit ERC20FundAdded(metadata.hash_, token, allowance);
                }
            }
        }
    }

    /**@dev Builders submit proof on integration 
        @param links : Array of links to the proof. This could be any valid link e.g Github, Figma, etc
        @notice Builder can submit at most 3 links before the epoch ends. Continous submission will override existing links which allow
        them to edit as many time as they wish. Builder must have proof assimilation before they can submit proof of integration.
     */
    function submitProofOfIntegration(string[3] memory links, address user) external whenNotPaused onlyApproved(address(0)) returns(bool) {
        uint epoch = _tryStartAndReturnEpoch();
        Spot memory spot = spots[user][epoch];
        if(!spot.hasValue) revert NoProofOfLearning();
        for(uint8 i = 0; i < links.length; i++) {
            epochData[epoch].learners[spot.value].point.links[i] = Link(bytes(links[i]), _now());
        }
        return true;
    }

    /**@dev Owner or approved account can explicitly approve proof of integration reward for learners/builders
        @param targets : Array of target addresses
        @param points : Points earned as proof of integration
        @param epoch : Epoch Id
        @notice Targets array size must tally with that of points. 
     */
    function approveIntegration(
        address[] memory targets, 
        uint32[]memory points, 
        uint epoch,
        address op
    ) external onlyApproved(op) whenNotPaused returns(bool) {
        if(targets.length == points.length) {
            for(uint32 i = 0; i < targets.length; i++) {
                Spot memory spot = spots[targets[i]][epoch];
                if(targets[i] != address(0)) {
                    epochData[epoch].learners[spot.value].point.verified = true;
                    unchecked {
                        epochData[epoch].learners[spot.value].point.score += points[i];
                    }
                }
            }
            emit PointsUpdated(targets, points, epoch);
        }
        return true;
    }

    /**@dev Add funds to campaign
        @param token: Token address
        @param op: Address funding the campaign
        @param rwType: Reward type
     */
    function addFund(
        address token,
        address op,
        RewardType rwType
    ) external payable onlyApproved(op) whenNotPaused returns(bool) {
        _setUpERC20Funds(token, op, rwType, msg.value);
        return true;
    }

    function getCampaignData(address target, address token) external view returns(ReadData memory data) {
        uint _epoches = epoches + 1;
        data.metadata = metadata;
        data.owner = operator;
        data.approvalFactory = approvalFactory;
        data.epoches = epoches;
        data.epochData = new EpochData[](_epoches);
        data.isPoassClaimed = new bool[](_epoches);
        data.isPointClaimed = new bool[](_epoches);
        for(uint i = 0; i < _epoches; i++){
            data.epochData[i] = epochData[i];
            data.isPoassClaimed[i] = isClaimed[RewardType.POASS][i][target][token];
            data.isPointClaimed[i] = isClaimed[RewardType.POINT][i][target][address(this)];
        }
        return data;
    }
}


// File contracts/v3/CampaignFactory.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;
contract CampaignFactory is ICampaignFactory{
    using UtilsV3 for *;
    
    ///@notice Dev address
    address private dev;

    ///@notice Fee receiver
    address private feeTo;

    ///@notice Campaign creation fee
    uint private creationFee;

    ///@notice All campaigns
    Campaign[] private campaigns;

    ///@notice Approval factory contract
    IApprovalFactory private approvalFactory;

    // Only approved account is allowed
    modifier onlyApproved {
        if(!approvalFactory.hasApproval(msg.sender)) revert NoApproval();
        _;
    }

    constructor(
        address _dev, 
        uint _creationFee,
        IApprovalFactory _approvalFactory
    ) {
        approvalFactory = _approvalFactory;
        dev = _dev;
        _setCreationFee(_creationFee);
    }

    ///@dev Get message sender
    function _msgSender() internal view returns(address _sender) {
        _sender = msg.sender;
    }

    ///@dev Set new creation fee
    function _setCreationFee(uint newFee) internal {
        creationFee = newFee;
    }

    /**@dev Set new fee 
        @param newFee : New Fee
     */
    function setCreationFee(uint newFee) external onlyApproved returns(bool) {
        _setCreationFee(newFee);
        return true;
    }

    /**@dev Set new fee 
        @param newFeeTo : New Fee receiver
     */
    function setFeeTo(address newFeeTo) external onlyApproved returns(bool) {
        if(newFeeTo != feeTo) {
            feeTo = newFeeTo;
            return true;
        } else {
            return false;
        }
    }

    /**@dev Set new approval contract 
        @param newApprovalFactory : New Approval contract
     */
    function setApprovalFactory(address newApprovalFactory) external onlyApproved returns(bool) {
        if(newApprovalFactory != address(approvalFactory)){
            approvalFactory = IApprovalFactory(newApprovalFactory);
            return true;
        } else {
            return false;
        }
    }

    /**@dev Create new campaign
        @param metadata : Campaign metadata
     */
    function createCampaign(ICampaignTemplate.MetadataInput memory metadata) external payable returns(bool) {
        if(msg.value >= creationFee) {
            if(feeTo != address(0)) {
                feeTo._sendValue(creationFee);
                address sender = msg.sender;
                unchecked {
                    address campaign = address(new CampaignTemplate{value: msg.value - creationFee}(sender, dev, approvalFactory, metadata));
                    campaigns.push(Campaign(sender, campaign));
                    IInterfacer(approvalFactory.getInterfacer()).registerCampaign(campaign);
                    emit NewCampaign(sender, campaign);
                }
            }
        } else {
            revert InsufficientValue();
        }

        return true;
    }

    function getCampaign(uint index) external view returns(Campaign memory cmp) {
        if(index < campaigns.length) {
            cmp = campaigns[index];
        }
        return cmp;
    }

    ///@dev Get campaign data
    function getFactoryData() public view returns(ReadData memory data) {
        data = ReadData(
            dev,
            feeTo,
            creationFee,
            approvalFactory,
            campaigns
        );
        return data;
    }

}
