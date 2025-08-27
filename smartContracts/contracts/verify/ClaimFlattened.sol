// [dotenv@17.2.1] injecting env (16) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
// // Sources flattened with hardhat v2.26.3 https://hardhat.org

// // SPDX-License-Identifier: MIT

// // File @openzeppelin/contracts/utils/Context.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

// pragma solidity ^0.8.20;

// /**
//  * @dev Provides information about the current execution context, including the
//  * sender of the transaction and its data. While these are generally available
//  * via msg.sender and msg.data, they should not be accessed in such a direct
//  * manner, since when dealing with meta-transactions the account sending and
//  * paying for execution may not be the actual sender (as far as an application
//  * is concerned).
//  *
//  * This contract is only required for intermediate, library-like contracts.
//  */
// abstract contract Context {
//     function _msgSender() internal view virtual returns (address) {
//         return msg.sender;
//     }

//     function _msgData() internal view virtual returns (bytes calldata) {
//         return msg.data;
//     }

//     function _contextSuffixLength() internal view virtual returns (uint256) {
//         return 0;
//     }
// }


// // File @openzeppelin/contracts/access/Ownable.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

// pragma solidity ^0.8.20;

// /**
//  * @dev Contract module which provides a basic access control mechanism, where
//  * there is an account (an owner) that can be granted exclusive access to
//  * specific functions.
//  *
//  * The initial owner is set to the address provided by the deployer. This can
//  * later be changed with {transferOwnership}.
//  *
//  * This module is used through inheritance. It will make available the modifier
//  * `onlyOwner`, which can be applied to your functions to restrict their use to
//  * the owner.
//  */
// abstract contract Ownable is Context {
//     address private _owner;

//     /**
//      * @dev The caller account is not authorized to perform an operation.
//      */
//     error OwnableUnauthorizedAccount(address account);

//     /**
//      * @dev The owner is not a valid owner account. (eg. `address(0)`)
//      */
//     error OwnableInvalidOwner(address owner);

//     event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

//     /**
//      * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
//      */
//     constructor(address initialOwner) {
//         if (initialOwner == address(0)) {
//             revert OwnableInvalidOwner(address(0));
//         }
//         _transferOwnership(initialOwner);
//     }

//     /**
//      * @dev Throws if called by any account other than the owner.
//      */
//     modifier onlyOwner() {
//         _checkOwner();
//         _;
//     }

//     /**
//      * @dev Returns the address of the current owner.
//      */
//     function owner() public view virtual returns (address) {
//         return _owner;
//     }

//     /**
//      * @dev Throws if the sender is not the owner.
//      */
//     function _checkOwner() internal view virtual {
//         if (owner() != _msgSender()) {
//             revert OwnableUnauthorizedAccount(_msgSender());
//         }
//     }

//     /**
//      * @dev Leaves the contract without owner. It will not be possible to call
//      * `onlyOwner` functions. Can only be called by the current owner.
//      *
//      * NOTE: Renouncing ownership will leave the contract without an owner,
//      * thereby disabling any functionality that is only available to the owner.
//      */
//     function renounceOwnership() public virtual onlyOwner {
//         _transferOwnership(address(0));
//     }

//     /**
//      * @dev Transfers ownership of the contract to a new account (`newOwner`).
//      * Can only be called by the current owner.
//      */
//     function transferOwnership(address newOwner) public virtual onlyOwner {
//         if (newOwner == address(0)) {
//             revert OwnableInvalidOwner(address(0));
//         }
//         _transferOwnership(newOwner);
//     }

//     /**
//      * @dev Transfers ownership of the contract to a new account (`newOwner`).
//      * Internal function without access restriction.
//      */
//     function _transferOwnership(address newOwner) internal virtual {
//         address oldOwner = _owner;
//         _owner = newOwner;
//         emit OwnershipTransferred(oldOwner, newOwner);
//     }
// }


// // File @openzeppelin/contracts/utils/introspection/IERC165.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)

// pragma solidity >=0.4.16;

// /**
//  * @dev Interface of the ERC-165 standard, as defined in the
//  * https://eips.ethereum.org/EIPS/eip-165[ERC].
//  *
//  * Implementers can declare support of contract interfaces, which can then be
//  * queried by others ({ERC165Checker}).
//  *
//  * For an implementation, see {ERC165}.
//  */
// interface IERC165 {
//     /**
//      * @dev Returns true if this contract implements the interface defined by
//      * `interfaceId`. See the corresponding
//      * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
//      * to learn more about how these ids are created.
//      *
//      * This function call must use less than 30 000 gas.
//      */
//     function supportsInterface(bytes4 interfaceId) external view returns (bool);
// }


// // File @openzeppelin/contracts/interfaces/IERC165.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC165.sol)

// pragma solidity >=0.4.16;


// // File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)

// pragma solidity >=0.4.16;

// /**
//  * @dev Interface of the ERC-20 standard as defined in the ERC.
//  */
// interface IERC20 {
//     /**
//      * @dev Emitted when `value` tokens are moved from one account (`from`) to
//      * another (`to`).
//      *
//      * Note that `value` may be zero.
//      */
//     event Transfer(address indexed from, address indexed to, uint256 value);

//     /**
//      * @dev Emitted when the allowance of a `spender` for an `owner` is set by
//      * a call to {approve}. `value` is the new allowance.
//      */
//     event Approval(address indexed owner, address indexed spender, uint256 value);

//     /**
//      * @dev Returns the value of tokens in existence.
//      */
//     function totalSupply() external view returns (uint256);

//     /**
//      * @dev Returns the value of tokens owned by `account`.
//      */
//     function balanceOf(address account) external view returns (uint256);

//     /**
//      * @dev Moves a `value` amount of tokens from the caller's account to `to`.
//      *
//      * Returns a boolean value indicating whether the operation succeeded.
//      *
//      * Emits a {Transfer} event.
//      */
//     function transfer(address to, uint256 value) external returns (bool);

//     /**
//      * @dev Returns the remaining number of tokens that `spender` will be
//      * allowed to spend on behalf of `owner` through {transferFrom}. This is
//      * zero by default.
//      *
//      * This value changes when {approve} or {transferFrom} are called.
//      */
//     function allowance(address owner, address spender) external view returns (uint256);

//     /**
//      * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
//      * caller's tokens.
//      *
//      * Returns a boolean value indicating whether the operation succeeded.
//      *
//      * IMPORTANT: Beware that changing an allowance with this method brings the risk
//      * that someone may use both the old and the new allowance by unfortunate
//      * transaction ordering. One possible solution to mitigate this race
//      * condition is to first reduce the spender's allowance to 0 and set the
//      * desired value afterwards:
//      * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
//      *
//      * Emits an {Approval} event.
//      */
//     function approve(address spender, uint256 value) external returns (bool);

//     /**
//      * @dev Moves a `value` amount of tokens from `from` to `to` using the
//      * allowance mechanism. `value` is then deducted from the caller's
//      * allowance.
//      *
//      * Returns a boolean value indicating whether the operation succeeded.
//      *
//      * Emits a {Transfer} event.
//      */
//     function transferFrom(address from, address to, uint256 value) external returns (bool);
// }


// // File @openzeppelin/contracts/interfaces/IERC20.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC20.sol)

// pragma solidity >=0.4.16;


// // File @openzeppelin/contracts/interfaces/IERC1363.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC1363.sol)

// pragma solidity >=0.6.2;


// /**
//  * @title IERC1363
//  * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
//  *
//  * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
//  * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
//  */
// interface IERC1363 is IERC20, IERC165 {
//     /*
//      * Note: the ERC-165 identifier for this interface is 0xb0202a11.
//      * 0xb0202a11 ===
//      *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
//      *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
//      *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
//      *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
//      *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
//      *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
//      */

//     /**
//      * @dev Moves a `value` amount of tokens from the caller's account to `to`
//      * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
//      * @param to The address which you want to transfer to.
//      * @param value The amount of tokens to be transferred.
//      * @return A boolean value indicating whether the operation succeeded unless throwing.
//      */
//     function transferAndCall(address to, uint256 value) external returns (bool);

//     /**
//      * @dev Moves a `value` amount of tokens from the caller's account to `to`
//      * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
//      * @param to The address which you want to transfer to.
//      * @param value The amount of tokens to be transferred.
//      * @param data Additional data with no specified format, sent in call to `to`.
//      * @return A boolean value indicating whether the operation succeeded unless throwing.
//      */
//     function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

//     /**
//      * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
//      * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
//      * @param from The address which you want to send tokens from.
//      * @param to The address which you want to transfer to.
//      * @param value The amount of tokens to be transferred.
//      * @return A boolean value indicating whether the operation succeeded unless throwing.
//      */
//     function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

//     /**
//      * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
//      * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
//      * @param from The address which you want to send tokens from.
//      * @param to The address which you want to transfer to.
//      * @param value The amount of tokens to be transferred.
//      * @param data Additional data with no specified format, sent in call to `to`.
//      * @return A boolean value indicating whether the operation succeeded unless throwing.
//      */
//     function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

//     /**
//      * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
//      * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
//      * @param spender The address which will spend the funds.
//      * @param value The amount of tokens to be spent.
//      * @return A boolean value indicating whether the operation succeeded unless throwing.
//      */
//     function approveAndCall(address spender, uint256 value) external returns (bool);

//     /**
//      * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
//      * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
//      * @param spender The address which will spend the funds.
//      * @param value The amount of tokens to be spent.
//      * @param data Additional data with no specified format, sent in call to `spender`.
//      * @return A boolean value indicating whether the operation succeeded unless throwing.
//      */
//     function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
// }


// // File @openzeppelin/contracts/interfaces/draft-IERC6093.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.4.0) (interfaces/draft-IERC6093.sol)
// pragma solidity >=0.8.4;

// /**
//  * @dev Standard ERC-20 Errors
//  * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-20 tokens.
//  */
// interface IERC20Errors {
//     /**
//      * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
//      * @param sender Address whose tokens are being transferred.
//      * @param balance Current balance for the interacting account.
//      * @param needed Minimum amount required to perform a transfer.
//      */
//     error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);

//     /**
//      * @dev Indicates a failure with the token `sender`. Used in transfers.
//      * @param sender Address whose tokens are being transferred.
//      */
//     error ERC20InvalidSender(address sender);

//     /**
//      * @dev Indicates a failure with the token `receiver`. Used in transfers.
//      * @param receiver Address to which tokens are being transferred.
//      */
//     error ERC20InvalidReceiver(address receiver);

//     /**
//      * @dev Indicates a failure with the `spender`’s `allowance`. Used in transfers.
//      * @param spender Address that may be allowed to operate on tokens without being their owner.
//      * @param allowance Amount of tokens a `spender` is allowed to operate with.
//      * @param needed Minimum amount required to perform a transfer.
//      */
//     error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);

//     /**
//      * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
//      * @param approver Address initiating an approval operation.
//      */
//     error ERC20InvalidApprover(address approver);

//     /**
//      * @dev Indicates a failure with the `spender` to be approved. Used in approvals.
//      * @param spender Address that may be allowed to operate on tokens without being their owner.
//      */
//     error ERC20InvalidSpender(address spender);
// }

// /**
//  * @dev Standard ERC-721 Errors
//  * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-721 tokens.
//  */
// interface IERC721Errors {
//     /**
//      * @dev Indicates that an address can't be an owner. For example, `address(0)` is a forbidden owner in ERC-20.
//      * Used in balance queries.
//      * @param owner Address of the current owner of a token.
//      */
//     error ERC721InvalidOwner(address owner);

//     /**
//      * @dev Indicates a `tokenId` whose `owner` is the zero address.
//      * @param tokenId Identifier number of a token.
//      */
//     error ERC721NonexistentToken(uint256 tokenId);

//     /**
//      * @dev Indicates an error related to the ownership over a particular token. Used in transfers.
//      * @param sender Address whose tokens are being transferred.
//      * @param tokenId Identifier number of a token.
//      * @param owner Address of the current owner of a token.
//      */
//     error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

//     /**
//      * @dev Indicates a failure with the token `sender`. Used in transfers.
//      * @param sender Address whose tokens are being transferred.
//      */
//     error ERC721InvalidSender(address sender);

//     /**
//      * @dev Indicates a failure with the token `receiver`. Used in transfers.
//      * @param receiver Address to which tokens are being transferred.
//      */
//     error ERC721InvalidReceiver(address receiver);

//     /**
//      * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
//      * @param operator Address that may be allowed to operate on tokens without being their owner.
//      * @param tokenId Identifier number of a token.
//      */
//     error ERC721InsufficientApproval(address operator, uint256 tokenId);

//     /**
//      * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
//      * @param approver Address initiating an approval operation.
//      */
//     error ERC721InvalidApprover(address approver);

//     /**
//      * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
//      * @param operator Address that may be allowed to operate on tokens without being their owner.
//      */
//     error ERC721InvalidOperator(address operator);
// }

// /**
//  * @dev Standard ERC-1155 Errors
//  * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-1155 tokens.
//  */
// interface IERC1155Errors {
//     /**
//      * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
//      * @param sender Address whose tokens are being transferred.
//      * @param balance Current balance for the interacting account.
//      * @param needed Minimum amount required to perform a transfer.
//      * @param tokenId Identifier number of a token.
//      */
//     error ERC1155InsufficientBalance(address sender, uint256 balance, uint256 needed, uint256 tokenId);

//     /**
//      * @dev Indicates a failure with the token `sender`. Used in transfers.
//      * @param sender Address whose tokens are being transferred.
//      */
//     error ERC1155InvalidSender(address sender);

//     /**
//      * @dev Indicates a failure with the token `receiver`. Used in transfers.
//      * @param receiver Address to which tokens are being transferred.
//      */
//     error ERC1155InvalidReceiver(address receiver);

//     /**
//      * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
//      * @param operator Address that may be allowed to operate on tokens without being their owner.
//      * @param owner Address of the current owner of a token.
//      */
//     error ERC1155MissingApprovalForAll(address operator, address owner);

//     /**
//      * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
//      * @param approver Address initiating an approval operation.
//      */
//     error ERC1155InvalidApprover(address approver);

//     /**
//      * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
//      * @param operator Address that may be allowed to operate on tokens without being their owner.
//      */
//     error ERC1155InvalidOperator(address operator);

//     /**
//      * @dev Indicates an array length mismatch between ids and values in a safeBatchTransferFrom operation.
//      * Used in batch transfers.
//      * @param idsLength Length of the array of token identifiers
//      * @param valuesLength Length of the array of token amounts
//      */
//     error ERC1155InvalidArrayLength(uint256 idsLength, uint256 valuesLength);
// }


// // File @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/extensions/IERC20Metadata.sol)

// pragma solidity >=0.6.2;

// /**
//  * @dev Interface for the optional metadata functions from the ERC-20 standard.
//  */
// interface IERC20Metadata is IERC20 {
//     /**
//      * @dev Returns the name of the token.
//      */
//     function name() external view returns (string memory);

//     /**
//      * @dev Returns the symbol of the token.
//      */
//     function symbol() external view returns (string memory);

//     /**
//      * @dev Returns the decimals places of the token.
//      */
//     function decimals() external view returns (uint8);
// }


// // File @openzeppelin/contracts/token/ERC20/ERC20.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/ERC20.sol)

// pragma solidity ^0.8.20;




// /**
//  * @dev Implementation of the {IERC20} interface.
//  *
//  * This implementation is agnostic to the way tokens are created. This means
//  * that a supply mechanism has to be added in a derived contract using {_mint}.
//  *
//  * TIP: For a detailed writeup see our guide
//  * https://forum.openzeppelin.com/t/how-to-implement-erc20-supply-mechanisms/226[How
//  * to implement supply mechanisms].
//  *
//  * The default value of {decimals} is 18. To change this, you should override
//  * this function so it returns a different value.
//  *
//  * We have followed general OpenZeppelin Contracts guidelines: functions revert
//  * instead returning `false` on failure. This behavior is nonetheless
//  * conventional and does not conflict with the expectations of ERC-20
//  * applications.
//  */
// abstract contract ERC20 is Context, IERC20, IERC20Metadata, IERC20Errors {
//     mapping(address account => uint256) private _balances;

//     mapping(address account => mapping(address spender => uint256)) private _allowances;

//     uint256 private _totalSupply;

//     string private _name;
//     string private _symbol;

//     /**
//      * @dev Sets the values for {name} and {symbol}.
//      *
//      * Both values are immutable: they can only be set once during construction.
//      */
//     constructor(string memory name_, string memory symbol_) {
//         _name = name_;
//         _symbol = symbol_;
//     }

//     /**
//      * @dev Returns the name of the token.
//      */
//     function name() public view virtual returns (string memory) {
//         return _name;
//     }

//     /**
//      * @dev Returns the symbol of the token, usually a shorter version of the
//      * name.
//      */
//     function symbol() public view virtual returns (string memory) {
//         return _symbol;
//     }

//     /**
//      * @dev Returns the number of decimals used to get its user representation.
//      * For example, if `decimals` equals `2`, a balance of `505` tokens should
//      * be displayed to a user as `5.05` (`505 / 10 ** 2`).
//      *
//      * Tokens usually opt for a value of 18, imitating the relationship between
//      * Ether and Wei. This is the default value returned by this function, unless
//      * it's overridden.
//      *
//      * NOTE: This information is only used for _display_ purposes: it in
//      * no way affects any of the arithmetic of the contract, including
//      * {IERC20-balanceOf} and {IERC20-transfer}.
//      */
//     function decimals() public view virtual returns (uint8) {
//         return 18;
//     }

//     /// @inheritdoc IERC20
//     function totalSupply() public view virtual returns (uint256) {
//         return _totalSupply;
//     }

//     /// @inheritdoc IERC20
//     function balanceOf(address account) public view virtual returns (uint256) {
//         return _balances[account];
//     }

//     /**
//      * @dev See {IERC20-transfer}.
//      *
//      * Requirements:
//      *
//      * - `to` cannot be the zero address.
//      * - the caller must have a balance of at least `value`.
//      */
//     function transfer(address to, uint256 value) public virtual returns (bool) {
//         address owner = _msgSender();
//         _transfer(owner, to, value);
//         return true;
//     }

//     /// @inheritdoc IERC20
//     function allowance(address owner, address spender) public view virtual returns (uint256) {
//         return _allowances[owner][spender];
//     }

//     /**
//      * @dev See {IERC20-approve}.
//      *
//      * NOTE: If `value` is the maximum `uint256`, the allowance is not updated on
//      * `transferFrom`. This is semantically equivalent to an infinite approval.
//      *
//      * Requirements:
//      *
//      * - `spender` cannot be the zero address.
//      */
//     function approve(address spender, uint256 value) public virtual returns (bool) {
//         address owner = _msgSender();
//         _approve(owner, spender, value);
//         return true;
//     }

//     /**
//      * @dev See {IERC20-transferFrom}.
//      *
//      * Skips emitting an {Approval} event indicating an allowance update. This is not
//      * required by the ERC. See {xref-ERC20-_approve-address-address-uint256-bool-}[_approve].
//      *
//      * NOTE: Does not update the allowance if the current allowance
//      * is the maximum `uint256`.
//      *
//      * Requirements:
//      *
//      * - `from` and `to` cannot be the zero address.
//      * - `from` must have a balance of at least `value`.
//      * - the caller must have allowance for ``from``'s tokens of at least
//      * `value`.
//      */
//     function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
//         address spender = _msgSender();
//         _spendAllowance(from, spender, value);
//         _transfer(from, to, value);
//         return true;
//     }

//     /**
//      * @dev Moves a `value` amount of tokens from `from` to `to`.
//      *
//      * This internal function is equivalent to {transfer}, and can be used to
//      * e.g. implement automatic token fees, slashing mechanisms, etc.
//      *
//      * Emits a {Transfer} event.
//      *
//      * NOTE: This function is not virtual, {_update} should be overridden instead.
//      */
//     function _transfer(address from, address to, uint256 value) internal {
//         if (from == address(0)) {
//             revert ERC20InvalidSender(address(0));
//         }
//         if (to == address(0)) {
//             revert ERC20InvalidReceiver(address(0));
//         }
//         _update(from, to, value);
//     }

//     /**
//      * @dev Transfers a `value` amount of tokens from `from` to `to`, or alternatively mints (or burns) if `from`
//      * (or `to`) is the zero address. All customizations to transfers, mints, and burns should be done by overriding
//      * this function.
//      *
//      * Emits a {Transfer} event.
//      */
//     function _update(address from, address to, uint256 value) internal virtual {
//         if (from == address(0)) {
//             // Overflow check required: The rest of the code assumes that totalSupply never overflows
//             _totalSupply += value;
//         } else {
//             uint256 fromBalance = _balances[from];
//             if (fromBalance < value) {
//                 revert ERC20InsufficientBalance(from, fromBalance, value);
//             }
//             unchecked {
//                 // Overflow not possible: value <= fromBalance <= totalSupply.
//                 _balances[from] = fromBalance - value;
//             }
//         }

//         if (to == address(0)) {
//             unchecked {
//                 // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
//                 _totalSupply -= value;
//             }
//         } else {
//             unchecked {
//                 // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
//                 _balances[to] += value;
//             }
//         }

//         emit Transfer(from, to, value);
//     }

//     /**
//      * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
//      * Relies on the `_update` mechanism
//      *
//      * Emits a {Transfer} event with `from` set to the zero address.
//      *
//      * NOTE: This function is not virtual, {_update} should be overridden instead.
//      */
//     function _mint(address account, uint256 value) internal {
//         if (account == address(0)) {
//             revert ERC20InvalidReceiver(address(0));
//         }
//         _update(address(0), account, value);
//     }

//     /**
//      * @dev Destroys a `value` amount of tokens from `account`, lowering the total supply.
//      * Relies on the `_update` mechanism.
//      *
//      * Emits a {Transfer} event with `to` set to the zero address.
//      *
//      * NOTE: This function is not virtual, {_update} should be overridden instead
//      */
//     function _burn(address account, uint256 value) internal {
//         if (account == address(0)) {
//             revert ERC20InvalidSender(address(0));
//         }
//         _update(account, address(0), value);
//     }

//     /**
//      * @dev Sets `value` as the allowance of `spender` over the `owner`'s tokens.
//      *
//      * This internal function is equivalent to `approve`, and can be used to
//      * e.g. set automatic allowances for certain subsystems, etc.
//      *
//      * Emits an {Approval} event.
//      *
//      * Requirements:
//      *
//      * - `owner` cannot be the zero address.
//      * - `spender` cannot be the zero address.
//      *
//      * Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument.
//      */
//     function _approve(address owner, address spender, uint256 value) internal {
//         _approve(owner, spender, value, true);
//     }

//     /**
//      * @dev Variant of {_approve} with an optional flag to enable or disable the {Approval} event.
//      *
//      * By default (when calling {_approve}) the flag is set to true. On the other hand, approval changes made by
//      * `_spendAllowance` during the `transferFrom` operation set the flag to false. This saves gas by not emitting any
//      * `Approval` event during `transferFrom` operations.
//      *
//      * Anyone who wishes to continue emitting `Approval` events on the`transferFrom` operation can force the flag to
//      * true using the following override:
//      *
//      * ```solidity
//      * function _approve(address owner, address spender, uint256 value, bool) internal virtual override {
//      *     super._approve(owner, spender, value, true);
//      * }
//      * ```
//      *
//      * Requirements are the same as {_approve}.
//      */
//     function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
//         if (owner == address(0)) {
//             revert ERC20InvalidApprover(address(0));
//         }
//         if (spender == address(0)) {
//             revert ERC20InvalidSpender(address(0));
//         }
//         _allowances[owner][spender] = value;
//         if (emitEvent) {
//             emit Approval(owner, spender, value);
//         }
//     }

//     /**
//      * @dev Updates `owner`'s allowance for `spender` based on spent `value`.
//      *
//      * Does not update the allowance value in case of infinite allowance.
//      * Revert if not enough allowance is available.
//      *
//      * Does not emit an {Approval} event.
//      */
//     function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
//         uint256 currentAllowance = allowance(owner, spender);
//         if (currentAllowance < type(uint256).max) {
//             if (currentAllowance < value) {
//                 revert ERC20InsufficientAllowance(spender, currentAllowance, value);
//             }
//             unchecked {
//                 _approve(owner, spender, currentAllowance - value, false);
//             }
//         }
//     }
// }


// // File @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.3.0) (token/ERC20/utils/SafeERC20.sol)

// pragma solidity ^0.8.20;


// /**
//  * @title SafeERC20
//  * @dev Wrappers around ERC-20 operations that throw on failure (when the token
//  * contract returns false). Tokens that return no value (and instead revert or
//  * throw on failure) are also supported, non-reverting calls are assumed to be
//  * successful.
//  * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
//  * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
//  */
// library SafeERC20 {
//     /**
//      * @dev An operation with an ERC-20 token failed.
//      */
//     error SafeERC20FailedOperation(address token);

//     /**
//      * @dev Indicates a failed `decreaseAllowance` request.
//      */
//     error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

//     /**
//      * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
//      * non-reverting calls are assumed to be successful.
//      */
//     function safeTransfer(IERC20 token, address to, uint256 value) internal {
//         _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
//     }

//     /**
//      * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
//      * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
//      */
//     function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
//         _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
//     }

//     /**
//      * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
//      */
//     function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
//         return _callOptionalReturnBool(token, abi.encodeCall(token.transfer, (to, value)));
//     }

//     /**
//      * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
//      */
//     function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
//         return _callOptionalReturnBool(token, abi.encodeCall(token.transferFrom, (from, to, value)));
//     }

//     /**
//      * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
//      * non-reverting calls are assumed to be successful.
//      *
//      * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
//      * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
//      * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
//      * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
//      */
//     function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
//         uint256 oldAllowance = token.allowance(address(this), spender);
//         forceApprove(token, spender, oldAllowance + value);
//     }

//     /**
//      * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
//      * value, non-reverting calls are assumed to be successful.
//      *
//      * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
//      * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
//      * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
//      * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
//      */
//     function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
//         unchecked {
//             uint256 currentAllowance = token.allowance(address(this), spender);
//             if (currentAllowance < requestedDecrease) {
//                 revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
//             }
//             forceApprove(token, spender, currentAllowance - requestedDecrease);
//         }
//     }

//     /**
//      * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
//      * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
//      * to be set to zero before setting it to a non-zero value, such as USDT.
//      *
//      * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
//      * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
//      * set here.
//      */
//     function forceApprove(IERC20 token, address spender, uint256 value) internal {
//         bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

//         if (!_callOptionalReturnBool(token, approvalCall)) {
//             _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
//             _callOptionalReturn(token, approvalCall);
//         }
//     }

//     /**
//      * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
//      * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
//      * targeting contracts.
//      *
//      * Reverts if the returned value is other than `true`.
//      */
//     function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
//         if (to.code.length == 0) {
//             safeTransfer(token, to, value);
//         } else if (!token.transferAndCall(to, value, data)) {
//             revert SafeERC20FailedOperation(address(token));
//         }
//     }

//     /**
//      * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
//      * has no code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
//      * targeting contracts.
//      *
//      * Reverts if the returned value is other than `true`.
//      */
//     function transferFromAndCallRelaxed(
//         IERC1363 token,
//         address from,
//         address to,
//         uint256 value,
//         bytes memory data
//     ) internal {
//         if (to.code.length == 0) {
//             safeTransferFrom(token, from, to, value);
//         } else if (!token.transferFromAndCall(from, to, value, data)) {
//             revert SafeERC20FailedOperation(address(token));
//         }
//     }

//     /**
//      * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
//      * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
//      * targeting contracts.
//      *
//      * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
//      * Opposedly, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
//      * once without retrying, and relies on the returned value to be true.
//      *
//      * Reverts if the returned value is other than `true`.
//      */
//     function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
//         if (to.code.length == 0) {
//             forceApprove(token, to, value);
//         } else if (!token.approveAndCall(to, value, data)) {
//             revert SafeERC20FailedOperation(address(token));
//         }
//     }

//     /**
//      * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
//      * on the return value: the return value is optional (but if data is returned, it must not be false).
//      * @param token The token targeted by the call.
//      * @param data The call data (encoded using abi.encode or one of its variants).
//      *
//      * This is a variant of {_callOptionalReturnBool} that reverts if call fails to meet the requirements.
//      */
//     function _callOptionalReturn(IERC20 token, bytes memory data) private {
//         uint256 returnSize;
//         uint256 returnValue;
//         assembly ("memory-safe") {
//             let success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
//             // bubble errors
//             if iszero(success) {
//                 let ptr := mload(0x40)
//                 returndatacopy(ptr, 0, returndatasize())
//                 revert(ptr, returndatasize())
//             }
//             returnSize := returndatasize()
//             returnValue := mload(0)
//         }

//         if (returnSize == 0 ? address(token).code.length == 0 : returnValue != 1) {
//             revert SafeERC20FailedOperation(address(token));
//         }
//     }

//     /**
//      * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
//      * on the return value: the return value is optional (but if data is returned, it must not be false).
//      * @param token The token targeted by the call.
//      * @param data The call data (encoded using abi.encode or one of its variants).
//      *
//      * This is a variant of {_callOptionalReturn} that silently catches all reverts and returns a bool instead.
//      */
//     function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
//         bool success;
//         uint256 returnSize;
//         uint256 returnValue;
//         assembly ("memory-safe") {
//             success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
//             returnSize := returndatasize()
//             returnValue := mload(0)
//         }
//         return success && (returnSize == 0 ? address(token).code.length > 0 : returnValue == 1);
//     }
// }


// // File @openzeppelin/contracts/utils/Pausable.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.3.0) (utils/Pausable.sol)

// pragma solidity ^0.8.20;

// /**
//  * @dev Contract module which allows children to implement an emergency stop
//  * mechanism that can be triggered by an authorized account.
//  *
//  * This module is used through inheritance. It will make available the
//  * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
//  * the functions of your contract. Note that they will not be pausable by
//  * simply including this module, only once the modifiers are put in place.
//  */
// abstract contract Pausable is Context {
//     bool private _paused;

//     /**
//      * @dev Emitted when the pause is triggered by `account`.
//      */
//     event Paused(address account);

//     /**
//      * @dev Emitted when the pause is lifted by `account`.
//      */
//     event Unpaused(address account);

//     /**
//      * @dev The operation failed because the contract is paused.
//      */
//     error EnforcedPause();

//     /**
//      * @dev The operation failed because the contract is not paused.
//      */
//     error ExpectedPause();

//     /**
//      * @dev Modifier to make a function callable only when the contract is not paused.
//      *
//      * Requirements:
//      *
//      * - The contract must not be paused.
//      */
//     modifier whenNotPaused() {
//         _requireNotPaused();
//         _;
//     }

//     /**
//      * @dev Modifier to make a function callable only when the contract is paused.
//      *
//      * Requirements:
//      *
//      * - The contract must be paused.
//      */
//     modifier whenPaused() {
//         _requirePaused();
//         _;
//     }

//     /**
//      * @dev Returns true if the contract is paused, and false otherwise.
//      */
//     function paused() public view virtual returns (bool) {
//         return _paused;
//     }

//     /**
//      * @dev Throws if the contract is paused.
//      */
//     function _requireNotPaused() internal view virtual {
//         if (paused()) {
//             revert EnforcedPause();
//         }
//     }

//     /**
//      * @dev Throws if the contract is not paused.
//      */
//     function _requirePaused() internal view virtual {
//         if (!paused()) {
//             revert ExpectedPause();
//         }
//     }

//     /**
//      * @dev Triggers stopped state.
//      *
//      * Requirements:
//      *
//      * - The contract must not be paused.
//      */
//     function _pause() internal virtual whenNotPaused {
//         _paused = true;
//         emit Paused(_msgSender());
//     }

//     /**
//      * @dev Returns to normal state.
//      *
//      * Requirements:
//      *
//      * - The contract must be paused.
//      */
//     function _unpause() internal virtual whenPaused {
//         _paused = false;
//         emit Unpaused(_msgSender());
//     }
// }


// // File @selfxyz/contracts/contracts/constants/AttestationId.sol@v1.2.0

// // Original license: SPDX_License_Identifier: MIT
// pragma solidity 0.8.28;

// /**
//  * @title AttestationId Library
//  * @notice This library provides attestation identifiers used across contracts.
//  * @dev Currently, it contains the constant E_PASSPORT which represents the identifier
//  * for an E-PASSPORT attestation computed as Poseidon("E-PASSPORT").
//  */
// library AttestationId {
//     /**
//      * @notice Identifier for an E-PASSPORT attestation.
//      * @dev The identifier is computed based on the hash of "E-PASSPORT" using the Poseidon hash function.
//      * Here it is hardcoded as bytes32(uint256(1)) for demonstration purposes.
//      */
//     bytes32 constant E_PASSPORT = bytes32(uint256(1));
//     bytes32 constant EU_ID_CARD = bytes32(uint256(2));
// }


// // File @selfxyz/contracts/contracts/constants/CircuitConstantsV2.sol@v1.2.0

// // Original license: SPDX_License_Identifier: MIT
// pragma solidity 0.8.28;

// /**
//  * @title Circuit Constants Library
//  * @notice This library defines constants representing indices used to access public signals
//  *         of various circuits such as register, DSC, and VC/Disclose.
//  * @dev These indices map directly to specific data fields in the corresponding circuits proofs.
//  */
// library CircuitConstantsV2 {
//     // ---------------------------
//     // Register Circuit Constants
//     // ---------------------------

//     /**
//      * @notice Index to access the nullifier in the register circuit public signals.
//      */
//     uint256 constant REGISTER_NULLIFIER_INDEX = 0;

//     /**
//      * @notice Index to access the commitment in the register circuit public signals.
//      */
//     uint256 constant REGISTER_COMMITMENT_INDEX = 1;

//     /**
//      * @notice Index to access the Merkle root in the register circuit public signals.
//      */
//     uint256 constant REGISTER_MERKLE_ROOT_INDEX = 2;

//     // ---------------------------
//     // DSC Circuit Constants
//     // ---------------------------

//     /**
//      * @notice Index to access the tree leaf in the DSC circuit public signals.
//      */
//     uint256 constant DSC_TREE_LEAF_INDEX = 0;

//     /**
//      * @notice Index to access the CSCA root in the DSC circuit public signals.
//      */
//     uint256 constant DSC_CSCA_ROOT_INDEX = 1;

//     // -------------------------------------
//     // VC and Disclose Circuit Constants
//     // -------------------------------------

//     /**
//      * @notice Structure containing circuit indices for a specific attestation type.
//      */
//     struct DiscloseIndices {
//         uint256 revealedDataPackedIndex;
//         uint256 forbiddenCountriesListPackedIndex;
//         uint256 nullifierIndex;
//         uint256 attestationIdIndex;
//         uint256 merkleRootIndex;
//         uint256 currentDateIndex;
//         uint256 namedobSmtRootIndex;
//         uint256 nameyobSmtRootIndex;
//         uint256 scopeIndex;
//         uint256 userIdentifierIndex;
//         uint256 passportNoSmtRootIndex; // Only for passport, 99 for ID card
//     }

//     /**
//      * @notice Returns the circuit indices for a given attestation type.
//      * @param attestationId The attestation identifier.
//      * @return indices The DiscloseIndices struct containing all relevant indices.
//      */
//     function getDiscloseIndices(bytes32 attestationId) internal pure returns (DiscloseIndices memory indices) {
//         if (attestationId == AttestationId.E_PASSPORT) {
//             return
//                 DiscloseIndices({
//                     revealedDataPackedIndex: 0,
//                     forbiddenCountriesListPackedIndex: 3,
//                     nullifierIndex: 7,
//                     attestationIdIndex: 8,
//                     merkleRootIndex: 9,
//                     currentDateIndex: 10,
//                     namedobSmtRootIndex: 17,
//                     nameyobSmtRootIndex: 18,
//                     scopeIndex: 19,
//                     userIdentifierIndex: 20,
//                     passportNoSmtRootIndex: 16
//                 });
//         } else if (attestationId == AttestationId.EU_ID_CARD) {
//             return
//                 DiscloseIndices({
//                     revealedDataPackedIndex: 0,
//                     forbiddenCountriesListPackedIndex: 4,
//                     nullifierIndex: 8,
//                     attestationIdIndex: 9,
//                     merkleRootIndex: 10,
//                     currentDateIndex: 11,
//                     namedobSmtRootIndex: 17,
//                     nameyobSmtRootIndex: 18,
//                     scopeIndex: 19,
//                     userIdentifierIndex: 20,
//                     passportNoSmtRootIndex: 99
//                 });
//         } else {
//             revert("Invalid attestation ID");
//         }
//     }
// }


// // File @selfxyz/contracts/contracts/interfaces/IDscCircuitVerifier.sol@v1.2.0

// // Original license: SPDX_License_Identifier: MIT
// pragma solidity 0.8.28;

// /**
//  * @title IDscCircuitVerifier
//  * @notice Interface for verifying zero-knowledge proofs related to the DSC circuit.
//  * @dev This interface defines the structure of a DSC circuit proof and exposes a function to verify such proofs.
//  */
// interface IDscCircuitVerifier {
//     /**
//      * @notice Represents a DSC circuit proof.
//      * @param a An array of two unsigned integers representing the proof component 'a'.
//      * @param b A 2x2 array of unsigned integers representing the proof component 'b'.
//      * @param c An array of two unsigned integers representing the proof component 'c'.
//      * @param pubSignals An array of two unsigned integers representing the public signals associated with the proof.
//      */
//     struct DscCircuitProof {
//         uint[2] a;
//         uint[2][2] b;
//         uint[2] c;
//         uint[2] pubSignals;
//     }

//     /**
//      * @notice Verifies a given DSC circuit zero-knowledge proof.
//      * @dev This function checks the validity of the provided DSC proof parameters.
//      * @param pA The 'a' component of the proof.
//      * @param pB The 'b' component of the proof.
//      * @param pC The 'c' component of the proof.
//      * @param pubSignals The public signals associated with the proof.
//      * @return A boolean value indicating whether the provided proof is valid (true) or not (false).
//      */
//     function verifyProof(
//         uint[2] calldata pA,
//         uint[2][2] calldata pB,
//         uint[2] calldata pC,
//         uint[2] calldata pubSignals
//     ) external view returns (bool);
// }


// // File @selfxyz/contracts/contracts/interfaces/IRegisterCircuitVerifier.sol@v1.2.0

// // Original license: SPDX_License_Identifier: MIT
// pragma solidity 0.8.28;
// /**
//  * @title IRegisterCircuitVerifier
//  * @notice Interface for verifying register circuit proofs.
//  * @dev This interface defines the structure of a register circuit proof and exposes a function to verify such proofs.
//  */
// interface IRegisterCircuitVerifier {
//     /**
//      * @notice Represents a register circuit proof.
//      * @dev This structure encapsulates the required proof elements.
//      * @param a An array of two unsigned integers representing the proof component 'a'.
//      * @param b A 2x2 array of unsigned integers representing the proof component 'b'.
//      * @param c An array of two unsigned integers representing the proof component 'c'.
//      * @param pubSignals An array of three unsigned integers representing the public signals associated with the proof.
//      */
//     struct RegisterCircuitProof {
//         uint[2] a;
//         uint[2][2] b;
//         uint[2] c;
//         uint[3] pubSignals;
//     }

//     /**
//      * @notice Verifies a given register circuit proof.
//      * @dev This function checks the validity of the provided proof parameters.
//      * @param a The 'a' component of the proof.
//      * @param b The 'b' component of the proof.
//      * @param c The 'c' component of the proof.
//      * @param pubSignals The public signals associated with the proof.
//      * @return isValid A boolean value indicating whether the provided proof is valid (true) or not (false).
//      */
//     function verifyProof(
//         uint[2] calldata a,
//         uint[2][2] calldata b,
//         uint[2] calldata c,
//         uint[3] calldata pubSignals
//     ) external view returns (bool isValid);
// }


// // File @selfxyz/contracts/contracts/libraries/SelfStructs.sol@v1.2.0

// // Original license: SPDX_License_Identifier: MIT
// pragma solidity 0.8.28;

// /**
//  * @title SelfStructs
//  * @dev Library containing data structures for Self protocol identity verification
//  * @notice Defines structs for passport verification, EU ID verification, and generic disclosure outputs
//  */
// library SelfStructs {
//     /**
//      * @dev Header structure for Hub input containing contract version and scope information
//      * @param contractVersion Version of the contract being used
//      * @param scope Scope identifier for the verification request
//      * @param attestationId Unique identifier for the attestation
//      */
//     struct HubInputHeader {
//         uint8 contractVersion;
//         uint256 scope;
//         bytes32 attestationId;
//     }

//     /**
//      * @dev Output structure for passport verification results
//      * @param attestationId Unique identifier for the attestation
//      * @param revealedDataPacked Packed binary data of revealed information
//      * @param userIdentifier Unique identifier for the user
//      * @param nullifier Cryptographic nullifier to prevent double-spending
//      * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
//      */
//     struct PassportOutput {
//         uint256 attestationId;
//         bytes revealedDataPacked;
//         uint256 userIdentifier;
//         uint256 nullifier;
//         uint256[4] forbiddenCountriesListPacked;
//     }

//     /**
//      * @dev Output structure for EU ID verification results
//      * @param attestationId Unique identifier for the attestation
//      * @param revealedDataPacked Packed binary data of revealed information
//      * @param userIdentifier Unique identifier for the user
//      * @param nullifier Cryptographic nullifier to prevent double-spending
//      * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
//      */
//     struct EuIdOutput {
//         uint256 attestationId;
//         bytes revealedDataPacked;
//         uint256 userIdentifier;
//         uint256 nullifier;
//         uint256[4] forbiddenCountriesListPacked;
//     }

//     /// @dev OFAC verification mode: Passport number only
//     uint256 constant passportNoOfac = 0;
//     /// @dev OFAC verification mode: Name and date of birth
//     uint256 constant nameAndDobOfac = 1;
//     /// @dev OFAC verification mode: Name and year of birth
//     uint256 constant nameAndYobOfac = 2;

//     /**
//      * @dev Generic disclosure output structure (Version 2) with detailed personal information
//      * @param attestationId Unique identifier for the attestation
//      * @param userIdentifier Unique identifier for the user
//      * @param nullifier Cryptographic nullifier to prevent double-spending
//      * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
//      * @param issuingState Country or state that issued the document
//      * @param name Array of name components (first, middle, last names)
//      * @param idNumber Government-issued identification number
//      * @param nationality Nationality of the document holder
//      * @param dateOfBirth Date of birth in string format
//      * @param gender Gender of the document holder
//      * @param expiryDate Document expiration date in string format
//      * @param olderThan Minimum age verification result
//      * @param ofac Array of OFAC (Office of Foreign Assets Control) verification results for different modes
//      */
//     struct GenericDiscloseOutputV2 {
//         bytes32 attestationId;
//         uint256 userIdentifier;
//         uint256 nullifier;
//         uint256[4] forbiddenCountriesListPacked;
//         string issuingState;
//         string[] name;
//         string idNumber;
//         string nationality;
//         string dateOfBirth;
//         string gender;
//         string expiryDate;
//         uint256 olderThan;
//         bool[3] ofac;
//     }

//     /**
//      * @dev Verification configuration structure (Version 1)
//      * @param olderThanEnabled Whether minimum age verification is enabled
//      * @param olderThan Minimum age requirement
//      * @param forbiddenCountriesEnabled Whether forbidden countries check is enabled
//      * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
//      * @param ofacEnabled Array of boolean flags for different OFAC verification modes
//      */
//     struct VerificationConfigV1 {
//         bool olderThanEnabled;
//         uint256 olderThan;
//         bool forbiddenCountriesEnabled;
//         uint256[4] forbiddenCountriesListPacked;
//         bool[3] ofacEnabled;
//     }

//     /**
//      * @dev Verification configuration structure (Version 2)
//      * @param olderThanEnabled Whether minimum age verification is enabled
//      * @param olderThan Minimum age requirement
//      * @param forbiddenCountriesEnabled Whether forbidden countries check is enabled
//      * @param forbiddenCountriesListPacked Packed list of forbidden countries (4 uint256 array)
//      * @param ofacEnabled Array of boolean flags for different OFAC verification modes
//      */
//     struct VerificationConfigV2 {
//         bool olderThanEnabled;
//         uint256 olderThan;
//         bool forbiddenCountriesEnabled;
//         uint256[4] forbiddenCountriesListPacked;
//         bool[3] ofacEnabled;
//     }
// }


// // File @selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol@v1.2.0

// // Original license: SPDX_License_Identifier: MIT
// pragma solidity 0.8.28;



// /**
//  * @title IIdentityVerificationHubV2
//  * @notice Interface for the Identity Verification Hub V2 for verifying zero-knowledge proofs.
//  * @dev Defines all external and public functions from IdentityVerificationHubImplV2.
//  */
// interface IIdentityVerificationHubV2 {
//     // ====================================================
//     // External Functions
//     // ====================================================

//     /**
//      * @notice Registers a commitment using a register circuit proof.
//      * @dev Verifies the register circuit proof and then calls the Identity Registry to register the commitment.
//      * @param attestationId The attestation ID.
//      * @param registerCircuitVerifierId The identifier for the register circuit verifier to use.
//      * @param registerCircuitProof The register circuit proof data.
//      */
//     function registerCommitment(
//         bytes32 attestationId,
//         uint256 registerCircuitVerifierId,
//         IRegisterCircuitVerifier.RegisterCircuitProof memory registerCircuitProof
//     ) external;

//     /**
//      * @notice Registers a DSC key commitment using a DSC circuit proof.
//      * @dev Verifies the DSC proof and then calls the Identity Registry to register the dsc key commitment.
//      * @param attestationId The attestation ID.
//      * @param dscCircuitVerifierId The identifier for the DSC circuit verifier to use.
//      * @param dscCircuitProof The DSC circuit proof data.
//      */
//     function registerDscKeyCommitment(
//         bytes32 attestationId,
//         uint256 dscCircuitVerifierId,
//         IDscCircuitVerifier.DscCircuitProof memory dscCircuitProof
//     ) external;

//     /**
//      * @notice Sets verification config in V2 storage (owner only)
//      * @dev The configId is automatically generated from the config content using sha256(abi.encode(config))
//      * @param config The verification configuration
//      * @return configId The generated config ID
//      */
//     function setVerificationConfigV2(
//         SelfStructs.VerificationConfigV2 memory config
//     ) external returns (bytes32 configId);

//     /**
//      * @notice Main verification function with new structured input format
//      * @param baseVerificationInput The base verification input data
//      * @param userContextData The user context data
//      */
//     function verify(bytes calldata baseVerificationInput, bytes calldata userContextData) external;

//     /**
//      * @notice Updates the registry address.
//      * @param attestationId The attestation ID.
//      * @param registryAddress The new registry address.
//      */
//     function updateRegistry(bytes32 attestationId, address registryAddress) external;

//     /**
//      * @notice Updates the VC and Disclose circuit verifier address.
//      * @param attestationId The attestation ID.
//      * @param vcAndDiscloseCircuitVerifierAddress The new VC and Disclose circuit verifier address.
//      */
//     function updateVcAndDiscloseCircuit(bytes32 attestationId, address vcAndDiscloseCircuitVerifierAddress) external;

//     /**
//      * @notice Updates the register circuit verifier for a specific signature type.
//      * @param attestationId The attestation identifier.
//      * @param typeId The signature type identifier.
//      * @param verifierAddress The new register circuit verifier address.
//      */
//     function updateRegisterCircuitVerifier(bytes32 attestationId, uint256 typeId, address verifierAddress) external;

//     /**
//      * @notice Updates the DSC circuit verifier for a specific signature type.
//      * @param attestationId The attestation identifier.
//      * @param typeId The signature type identifier.
//      * @param verifierAddress The new DSC circuit verifier address.
//      */
//     function updateDscVerifier(bytes32 attestationId, uint256 typeId, address verifierAddress) external;

//     /**
//      * @notice Batch updates register circuit verifiers.
//      * @param attestationIds An array of attestation identifiers.
//      * @param typeIds An array of signature type identifiers.
//      * @param verifierAddresses An array of new register circuit verifier addresses.
//      */
//     function batchUpdateRegisterCircuitVerifiers(
//         bytes32[] calldata attestationIds,
//         uint256[] calldata typeIds,
//         address[] calldata verifierAddresses
//     ) external;

//     /**
//      * @notice Batch updates DSC circuit verifiers.
//      * @param attestationIds An array of attestation identifiers.
//      * @param typeIds An array of signature type identifiers.
//      * @param verifierAddresses An array of new DSC circuit verifier addresses.
//      */
//     function batchUpdateDscCircuitVerifiers(
//         bytes32[] calldata attestationIds,
//         uint256[] calldata typeIds,
//         address[] calldata verifierAddresses
//     ) external;

//     // ====================================================
//     // External View Functions
//     // ====================================================

//     /**
//      * @notice Returns the registry address for a given attestation ID.
//      * @param attestationId The attestation ID to query.
//      * @return The registry address associated with the attestation ID.
//      */
//     function registry(bytes32 attestationId) external view returns (address);

//     /**
//      * @notice Returns the disclose verifier address for a given attestation ID.
//      * @param attestationId The attestation ID to query.
//      * @return The disclose verifier address associated with the attestation ID.
//      */
//     function discloseVerifier(bytes32 attestationId) external view returns (address);

//     /**
//      * @notice Returns the register circuit verifier address for a given attestation ID and type ID.
//      * @param attestationId The attestation ID to query.
//      * @param typeId The type ID to query.
//      * @return The register circuit verifier address associated with the attestation ID and type ID.
//      */
//     function registerCircuitVerifiers(bytes32 attestationId, uint256 typeId) external view returns (address);

//     /**
//      * @notice Returns the DSC circuit verifier address for a given attestation ID and type ID.
//      * @param attestationId The attestation ID to query.
//      * @param typeId The type ID to query.
//      * @return The DSC circuit verifier address associated with the attestation ID and type ID.
//      */
//     function dscCircuitVerifiers(bytes32 attestationId, uint256 typeId) external view returns (address);

//     /**
//      * @notice Returns the merkle root timestamp for a given attestation ID and root.
//      * @param attestationId The attestation ID to query.
//      * @param root The merkle root to query.
//      * @return The merkle root timestamp associated with the attestation ID and root.
//      */
//     function rootTimestamp(bytes32 attestationId, uint256 root) external view returns (uint256);

//     /**
//      * @notice Returns the identity commitment merkle root for a given attestation ID.
//      * @param attestationId The attestation ID to query.
//      * @return The identity commitment merkle root associated with the attestation ID.
//      */
//     function getIdentityCommitmentMerkleRoot(bytes32 attestationId) external view returns (uint256);

//     /**
//      * @notice Checks if a verification config exists
//      * @param configId The configuration identifier
//      * @return exists Whether the config exists
//      */
//     function verificationConfigV2Exists(bytes32 configId) external view returns (bool exists);

//     // ====================================================
//     // Public Functions
//     // ====================================================

//     /**
//      * @notice Generates a config ID from a verification config
//      * @param config The verification configuration
//      * @return The generated config ID (sha256 hash of encoded config)
//      */
//     function generateConfigId(SelfStructs.VerificationConfigV2 memory config) external pure returns (bytes32);
// }


// // File @selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol@v1.2.0

// // Original license: SPDX_License_Identifier: MIT
// pragma solidity 0.8.28;

// /**
//  * @title ISelfVerificationRoot
//  * @notice Interface for self-verification infrastructure integration
//  * @dev Provides base functionality for verifying and disclosing identity credentials
//  */
// interface ISelfVerificationRoot {
//     /**
//      * @notice Structure containing proof data for disclose circuits
//      * @dev Contains the proof elements required for zero-knowledge verification
//      * @param a First proof element
//      * @param b Second proof element (2x2 matrix)
//      * @param c Third proof element
//      * @param pubSignals Array of 21 public signals for the circuit
//      */
//     struct DiscloseCircuitProof {
//         uint256[2] a;
//         uint256[2][2] b;
//         uint256[2] c;
//         uint256[21] pubSignals;
//     }

//     /**
//      * @notice Structure containing verified identity disclosure output data
//      * @dev Contains all disclosed identity information after successful verification
//      * @param attestationId Unique identifier for the identity documents
//      * @param userIdentifier Unique identifier for the user
//      * @param nullifier Unique nullifier to prevent double-spending
//      * @param forbiddenCountriesListPacked Packed representation of forbidden countries list
//      * @param issuingState The state/country that issued the identity document
//      * @param name Array of name components
//      * @param idNumber The identity document number
//      * @param nationality The nationality of the document holder
//      * @param dateOfBirth Date of birth in string format
//      * @param gender Gender of the document holder
//      * @param expiryDate Expiry date of the identity document
//      * @param olderThan Verified age threshold (e.g., 18 for adult verification)
//      * @param ofac Array of OFAC (Office of Foreign Assets Control) compliance flags
//      */
//     struct GenericDiscloseOutputV2 {
//         bytes32 attestationId;
//         uint256 userIdentifier;
//         uint256 nullifier;
//         uint256[4] forbiddenCountriesListPacked;
//         string issuingState;
//         string[] name;
//         string idNumber;
//         string nationality;
//         string dateOfBirth;
//         string gender;
//         string expiryDate;
//         uint256 olderThan;
//         bool[3] ofac;
//     }

//     /**
//      * @notice Verifies a self-proof using the bytes-based interface
//      * @dev Parses relayer data format and validates against contract settings before calling hub V2
//      * @param proofPayload Packed data from relayer in format: | 32 bytes attestationId | proof data |
//      * @param userContextData User-defined data in format: | 32 bytes configId | 32 bytes destChainId | 32 bytes userIdentifier | data |
//      */
//     function verifySelfProof(bytes calldata proofPayload, bytes calldata userContextData) external;

//     /**
//      * @notice Callback function called upon successful verification
//      * @dev Only the identity verification hub V2 contract should call this function
//      * @param output The verification output data containing disclosed identity information
//      * @param userData The user-defined data passed through the verification process
//      */
//     function onVerificationSuccess(bytes memory output, bytes memory userData) external;
// }


// // File @selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol@v1.2.0

// // Original license: SPDX_License_Identifier: MIT
// pragma solidity 0.8.28;




// /**
//  * @title SelfVerificationRoot
//  * @notice Abstract base contract to be integrated with self's verification infrastructure
//  * @dev Provides base functionality for verifying and disclosing identity credentials
//  * @author Self Team
//  */
// abstract contract SelfVerificationRoot is ISelfVerificationRoot {
//     // ====================================================
//     // Constants
//     // ====================================================

//     /// @notice Contract version identifier used in verification process
//     /// @dev This version is included in the hub data for protocol compatibility
//     uint8 constant CONTRACT_VERSION = 2;

//     // ====================================================
//     // Storage Variables
//     // ====================================================

//     /// @notice The scope value that proofs must match
//     /// @dev Used to validate that submitted proofs match the expected scope
//     uint256 internal _scope;

//     /// @notice Reference to the identity verification hub V2 contract
//     /// @dev Immutable reference used for bytes-based proof verification
//     IIdentityVerificationHubV2 internal immutable _identityVerificationHubV2;

//     // ====================================================
//     // Errors
//     // ====================================================

//     /// @notice Error thrown when the data format is invalid
//     /// @dev Triggered when the provided bytes data doesn't have the expected format
//     error InvalidDataFormat();

//     /// @notice Error thrown when onVerificationSuccess is called by an unauthorized address
//     /// @dev Only the identity verification hub V2 contract can call onVerificationSuccess
//     error UnauthorizedCaller();

//     // ====================================================
//     // Events
//     // ====================================================

//     /// @notice Emitted when the scope is updated
//     /// @param newScope The new scope value that was set
//     event ScopeUpdated(uint256 indexed newScope);

//     /**
//      * @notice Initializes the SelfVerificationRoot contract
//      * @dev Sets up the immutable reference to the hub contract and initial scope
//      * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
//      * @param scopeValue The expected proof scope for user registration
//      */
//     constructor(address identityVerificationHubV2Address, uint256 scopeValue) {
//         _identityVerificationHubV2 = IIdentityVerificationHubV2(identityVerificationHubV2Address);
//         _scope = scopeValue;
//     }

//     /**
//      * @notice Returns the current scope value
//      * @dev Public view function to access the current scope setting
//      * @return The scope value that proofs must match
//      */
//     function scope() public view returns (uint256) {
//         return _scope;
//     }

//     /**
//      * @notice Updates the scope value
//      * @dev Protected internal function to change the expected scope for proofs
//      * @param newScope The new scope value to set
//      */
//     function _setScope(uint256 newScope) internal {
//         _scope = newScope;
//         emit ScopeUpdated(newScope);
//     }

//     /**
//      * @notice Verifies a self-proof using the bytes-based interface
//      * @dev Parses relayer data format and validates against contract settings before calling hub V2
//      * @param proofPayload Packed data from relayer in format: | 32 bytes attestationId | proof data |
//      * @param userContextData User-defined data in format: | 32 bytes destChainId | 32 bytes userIdentifier | data |
//      * @custom:data-format proofPayload = | 32 bytes attestationId | proofData |
//      * @custom:data-format userContextData = | 32 bytes destChainId | 32 bytes userIdentifier | data |
//      * @custom:data-format hubData = | 1 bytes contract version | 31 bytes buffer | 32 bytes scope | 32 bytes attestationId | proofData |
//      */
//     function verifySelfProof(bytes calldata proofPayload, bytes calldata userContextData) public {
//         // Minimum expected length for proofData: 32 bytes attestationId + proof data
//         if (proofPayload.length < 32) {
//             revert InvalidDataFormat();
//         }

//         // Minimum userDefinedData length: 32 (destChainId) + 32 (userIdentifier) + 0 (userDefinedData) = 64 bytes
//         if (userContextData.length < 64) {
//             revert InvalidDataFormat();
//         }

//         bytes32 attestationId;
//         assembly {
//             // Load attestationId from the beginning of proofData (first 32 bytes)
//             attestationId := calldataload(proofPayload.offset)
//         }

//         bytes32 destinationChainId = bytes32(userContextData[0:32]);
//         bytes32 userIdentifier = bytes32(userContextData[32:64]);
//         bytes memory userDefinedData = userContextData[64:];

//         bytes32 configId = getConfigId(destinationChainId, userIdentifier, userDefinedData);

//         // Hub data should be | 1 byte contractVersion | 31 bytes buffer | 32 bytes scope | 32 bytes attestationId | proof data
//         bytes memory baseVerificationInput = abi.encodePacked(
//             // 1 byte contractVersion
//             CONTRACT_VERSION,
//             // 31 bytes buffer (all zeros)
//             bytes31(0),
//             // 32 bytes scope
//             _scope,
//             // 32 bytes attestationId
//             attestationId,
//             // proof data (starts after 32 bytes attestationId)
//             proofPayload[32:]
//         );

//         // Call hub V2 verification
//         _identityVerificationHubV2.verify(baseVerificationInput, bytes.concat(configId, userContextData));
//     }

//     /**
//      * @notice Callback function called upon successful verification by the hub contract
//      * @dev Only callable by the identity verification hub V2 contract for security
//      * @param output The verification output data containing disclosed identity information
//      * @param userData The user-defined data passed through the verification process
//      * @custom:security Only the authorized hub contract can call this function
//      * @custom:flow This function decodes the output and calls the customizable verification hook
//      */
//     function onVerificationSuccess(bytes memory output, bytes memory userData) public {
//         // Only allow the identity verification hub V2 to call this function
//         if (msg.sender != address(_identityVerificationHubV2)) {
//             revert UnauthorizedCaller();
//         }

//         ISelfVerificationRoot.GenericDiscloseOutputV2 memory genericDiscloseOutput = abi.decode(
//             output,
//             (ISelfVerificationRoot.GenericDiscloseOutputV2)
//         );

//         // Call the customizable verification hook
//         customVerificationHook(genericDiscloseOutput, userData);
//     }

//     /**
//      * @notice Generates a configId for the user
//      * @dev This function should be overridden by the implementing contract to provide custom configId logic
//      * @param destinationChainId The destination chain ID
//      * @param userIdentifier The user identifier
//      * @param userDefinedData The user defined data
//      * @return The configId
//      */
//     function getConfigId(
//         bytes32 destinationChainId,
//         bytes32 userIdentifier,
//         bytes memory userDefinedData
//     ) public view virtual returns (bytes32) {
//         // Default implementation reverts; must be overridden in derived contract
//         revert("SelfVerificationRoot: getConfigId must be overridden");
//     }

//     /**
//      * @notice Custom verification hook that can be overridden by implementing contracts
//      * @dev This function is called after successful verification and hub address validation
//      * @param output The verification output data from the hub containing disclosed identity information
//      * @param userData The user-defined data passed through the verification process
//      * @custom:override Override this function in derived contracts to add custom verification logic
//      * @custom:security This function is only called after proper authentication by the hub contract
//      */
//     function customVerificationHook(
//         ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
//         bytes memory userData
//     ) internal virtual {
//         // Default implementation is empty - override in derived contracts to add custom logic
//     }
// }


// // File contracts/Approved.sol

// // Original license: SPDX_License_Identifier: MIT
// pragma solidity 0.8.28;
// abstract contract Approved is Ownable, Pausable {
//     error AddressIsZero();
    
//     event Approval(address indexed);
//     event UnApproval(address indexed);

//     // Mapping of account to approvals
//     mapping (address => bool) private approval;

//     // Only approved account is allowed
//     modifier onlyApproved {
//         require(_isApproved(_msgSender()), "Not approved account");
//         _;
//     }

//     constructor() Ownable(_msgSender()) {
//        _setPermission(_msgSender(), true);
         
//     }
//     //    _approve(toApprove, true);

//     /**
//      * @dev Set approval for
//      * @param target : Account to set approval for
//      * @param value : Approval state - true or false
//      */
//     function _setPermission(address target, bool value) internal {
//         if(target == address(0)) revert AddressIsZero();
//         approval[target] = value;
//     }

//     /**
//      * @dev Set approval for target
//      * @param target : Account to set approval for
//      */
//     function setPermission(address target) public onlyOwner {
//         _setPermission(target, true);
//         emit Approval(target);
//     }

//     /**
//      * @dev Set approval for target
//      * @param target : Account to set approval for
//      */
//     function _isApproved(address target) internal view returns(bool result) {
//         result = approval[target];
//     }

//     /**
//      * @dev Set approval for target
//      * @param target : Account to set approval for
//      */
//     function isPermitted(address target) public view returns(bool) {
//         return _isApproved(target);
//     }

//     /**
//      * @dev Set approval for target
//      * @param target : Account to set approval for
//      */
//     function unApprove(address target) public onlyOwner {
//         _setPermission(target, false);
//         emit UnApproval(target);
//     }

// }


// // File contracts/Admins.sol

// // Original license: SPDX_License_Identifier: MIT

// pragma solidity 0.8.28;
// abstract contract Admins is Approved {
//     struct Admin {
//         address id;
//         bool active;
//     }

//     /// @dev Total number of admins
//     uint private adminCount;

//     /// Admins slots
//     mapping(uint8 => address) private slots;

//     /// @dev Mapping of slots to admin data
//     mapping(address => bool) private isAdmin;

//     /**
//      * @dev Only admin
//      * @notice Even if no admin is added, we will always byepass the out-of-bound error since 
//      * we already added at least one content to the admins array in the constructor, it wil always fetch zero slot.
//     */
//     modifier onlyAdmin() {
//         require(_isAdmin(_msgSender()), 'Only admin');
//         _; 
//     }

//     function _isAdmin(address target) internal view returns(bool result) {
//         result = isAdmin[target];
//     }
    
//     /**
//      * @dev Add admin and activate them
//      * @param target : Account to add
//      */
//     function _addAdmin(address target) internal {
//         require(!isAdmin[target], 'Admin already added');
//         isAdmin[target] = true;
//         uint8 slot = uint8(adminCount);
//         adminCount = slot + 1;
//         slots[slot] = target;
//     }

//     /**
//      * @dev Toggle admin status either activate or deactivate them by toggling back and forth. 
//      * @param target : Target account
//      */
//     function toggleAdminStatus(address target) public onlyOwner {
//         bool status = isAdmin[target];
//         isAdmin[target] = !status;
//     }

//     /// Initialize an empty slot in the admins array
//     function setAdmin(address target) public onlyOwner {
//         _addAdmin(target);
//     }

//     /// Return all admins
//     function getAdmins() public view returns(Admin[] memory _admins) {
//         uint8 _adminCount = uint8(adminCount);
//         if(_adminCount == 0) return _admins;
//         _admins = new Admin[](_adminCount);
//         for(uint8 i = 0; i < _adminCount; i++) {
//             address target = slots[i];
//             _admins[i] = Admin(target, isAdmin[target]);
//         }
//         return _admins;
//     }
// }


// // File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.4.0

// // Original license: SPDX_License_Identifier: MIT
// // OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

// pragma solidity ^0.8.20;

// /**
//  * @dev Contract module that helps prevent reentrant calls to a function.
//  *
//  * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
//  * available, which can be applied to functions to make sure there are no nested
//  * (reentrant) calls to them.
//  *
//  * Note that because there is a single `nonReentrant` guard, functions marked as
//  * `nonReentrant` may not call one another. This can be worked around by making
//  * those functions `private`, and then adding `external` `nonReentrant` entry
//  * points to them.
//  *
//  * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
//  * consider using {ReentrancyGuardTransient} instead.
//  *
//  * TIP: If you would like to learn more about reentrancy and alternative ways
//  * to protect against it, check out our blog post
//  * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
//  */
// abstract contract ReentrancyGuard {
//     // Booleans are more expensive than uint256 or any type that takes up a full
//     // word because each write operation emits an extra SLOAD to first read the
//     // slot's contents, replace the bits taken up by the boolean, and then write
//     // back. This is the compiler's defense against contract upgrades and
//     // pointer aliasing, and it cannot be disabled.

//     // The values being non-zero value makes deployment a bit more expensive,
//     // but in exchange the refund on every call to nonReentrant will be lower in
//     // amount. Since refunds are capped to a percentage of the total
//     // transaction's gas, it is best to keep them low in cases like this one, to
//     // increase the likelihood of the full refund coming into effect.
//     uint256 private constant NOT_ENTERED = 1;
//     uint256 private constant ENTERED = 2;

//     uint256 private _status;

//     /**
//      * @dev Unauthorized reentrant call.
//      */
//     error ReentrancyGuardReentrantCall();

//     constructor() {
//         _status = NOT_ENTERED;
//     }

//     /**
//      * @dev Prevents a contract from calling itself, directly or indirectly.
//      * Calling a `nonReentrant` function from another `nonReentrant`
//      * function is not supported. It is possible to prevent this from happening
//      * by making the `nonReentrant` function external, and making it call a
//      * `private` function that does the actual work.
//      */
//     modifier nonReentrant() {
//         _nonReentrantBefore();
//         _;
//         _nonReentrantAfter();
//     }

//     function _nonReentrantBefore() private {
//         // On the first call to nonReentrant, _status will be NOT_ENTERED
//         if (_status == ENTERED) {
//             revert ReentrancyGuardReentrantCall();
//         }

//         // Any calls to nonReentrant after this point will fail
//         _status = ENTERED;
//     }

//     function _nonReentrantAfter() private {
//         // By storing the original value once again, a refund is triggered (see
//         // https://eips.ethereum.org/EIPS/eip-2200)
//         _status = NOT_ENTERED;
//     }

//     /**
//      * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
//      * `nonReentrant` function in the call stack.
//      */
//     function _reentrancyGuardEntered() internal view returns (bool) {
//         return _status == ENTERED;
//     }
// }


// // File contracts/interfaces/ILearna.sol

// // Original license: SPDX_License_Identifier: MIT

// pragma solidity 0.8.28;
// interface ILearna {
//     enum Mode { LOCAL, LIVE }

//     error UserBlacklisted();
//     error NotEligible();
//     error ClaimEnded(uint64);
//     error InvalidAddress(address);
//     error CampaignClaimNotActivated();
//     error InsufficientAllowance(uint256);
//     error ClaimAddressNotSet();
//     error NotInitialized();

//     event NewCampaign(Campaign campaign);
//     event CampaignUpdated(Campaign campaign);
//     event PointRecorded(address indexed user, uint weekId, bytes32 campainHash, QuizResultInput quizResult);
//     event Sorted(uint _weekId, uint newWeekId, CampaignData[] campaigns);
//     event CampaignCreated(uint weekId, address indexed tipper, Campaign data, bytes32[] campainHashes);
//     event UserStatusChanged(address[] users, bool[] newStatus);

//     struct CData {
//         uint platformToken;
//         uint256 fundsNative;
//         uint256 fundsERC20;
//         uint96 totalPoints;
//         uint64 lastUpdated;
//         uint activeLearners; 
//         address operator;
//         address token;
//         CampaignData data;
//     }

//     struct Campaign {
//         CData data;
//         address[] users;
//     }

//     struct GetCampaign {
//         Campaign cp;
//         uint32 slot;
//     }

//     struct CampaignData {
//         bytes32 hash_;
//         bytes encoded;
//     }

//     struct WeekInitializer {
//         bool hasSlot;
//         uint32 slot;
//     }

//     struct WeekProfileData {
//         uint weekId;
//         ReadProfile[] campaigns;
//     }

//     struct ReadProfile {
//         Eligibility eligibility;
//         Profile profile;
//         bool isClaimed;
//         bytes32 hash_;
//     }

//     struct Answer {
//         bytes questionHash;
//         uint64 selected;
//         bool isUserSelected;
//     }

//     struct AnswerInput {
//         string questionHash;
//         uint64 selected;
//         bool isUserSelected;
//     }

//     struct QuizResultOther {
//         bytes id;
//         bytes quizId;
//         uint32 score;
//         bytes title;
//         uint64 totalPoints;
//         uint16 percentage;
//         uint64 timeSpent;
//         bytes completedAt;
//     }

//     struct QuizResultOtherInput {
//         string id;
//         string quizId;
//         uint32 score;
//         string title;
//         uint64 totalPoints;
//         uint16 percentage;
//         uint64 timeSpent;
//         string completedAt;
//     }

//     struct QuizResultInput {
//         AnswerInput[] answers;
//         QuizResultOtherInput other;
//     }

//     struct QuizResult {
//         Answer[] answers;
//         QuizResultOther other;
//     }

//     struct ProfileOther {
//         uint amountMinted;
//         uint8 totalQuizPerWeek;
//         bytes32 passkey;
//         bool haskey;
//     }

//     struct Profile {
//         QuizResult[] quizResults;
//         ProfileOther other;
//     }

//     struct WeekData {
//         uint weekId;
//         Campaign[] campaigns;
//         uint96 claimDeadline;
//     } 

//     // Readonly data
//     struct ReadData {
//         State state;
//         WeekData[] wd;
//         CampaignData[] approved;
//         WeekProfileData[] profileData;
//     }

//     struct State {
//         uint minimumToken;
//         uint64 transitionInterval;
//         uint64 transitionDate;
//         uint weekId;
//     }

//     struct Eligibility {
//         bool isEligible;
//         uint erc20Amount;
//         uint nativeAmount;
//         uint platform;
//         address token;
//         bytes32 hash_;
//         uint weekId;
//     }

//     // Eligibilities for the previous 3 weeks at most
//     struct Eligibilities {
//         Eligibility[] elgs;
//         uint weekId;
//     }

//     struct UserCampaigns {
//         uint weekId;
//         bytes32[] campaigns;
//     }

//     function checkEligibility(address user) external view returns (Eligibilities memory);
//     // function setIsClaimed(address user, uint weekId, bytes32 hash_) external;
//     function hasClaimed(address user, uint weekId, bytes32 hash_) external view returns(bool);
//     function getPlatformToken() external view returns(address);
//     function onCampaignValueChanged(
//         uint weekId, 
//         bytes32 hash_, 
//         uint256 fundsNative, 
//         uint256 fundsERC20,
//         uint256 platformToken,
//         address user
//     ) external;
// }


// // File contracts/Claim.sol

// // Original license: SPDX_License_Identifier: MIT
// pragma solidity 0.8.28;
// /**
//  * @title Claim
//  *  Inspired by Self protocol.See https://github.com/selfxyz/self/blob/main/contracts/contracts/example/Airdrop.sol for more information
//  */
// contract Claim is SelfVerificationRoot, Admins, ReentrancyGuard {
//     using SafeERC20 for IERC20;

//     // Errors
//     error NativeClaimUnsuccessful();

//     // Events
//     event UserVerified(address indexed registeredUserIdentifier);

//     // Learna contract
//     ILearna public learna;

//     /// @notice Verification config ID for identity verification
//     bytes32 public configId;

//     ///@notice When this flag is turned off, user will need no verification to claim reward
//     bool public isWalletVerificationRequired; // default is true in the constructor, meaning user must verify before claiming

//     /// @dev User's registered claim. We use this to prevent users from trying to verify twice
//     mapping(address user => bool) internal isVerified;

//     // Blacklist
//     mapping(address => bool) internal blacklisted;

//     modifier whenWalletRequired() {
//         require(isWalletVerificationRequired, "Wallet verification required");
//         _;
//     }

//     /**
//      * @dev Constructor
//      * @param identityVerificationHubAddress : Hub verification address
//      * @notice We set the scope to zero value hoping to set the real value immediately after deployment. This saves 
//      * us the headache of generating the contract address ahead of time 
//      */
//     constructor(address identityVerificationHubAddress) SelfVerificationRoot(identityVerificationHubAddress, 0) {
//         isWalletVerificationRequired = true; 
//     }

//     receive() external payable {}

//     function getConfigId(
//         bytes32 /**unused-param */,
//         bytes32 /**unused-param */, 
//         bytes memory /**unused-param */ 
//     ) public view override returns (bytes32) {
//         // Return your app's configuration ID
//         return configId;
//     }

//     /**@dev Return user's verification status
//         * @param user : User's account
//      */
//     function getVerificationStatus(address user) public view returns(bool _isVerified, bool _isBlacklisted) {
//         return (isVerified[user], blacklisted[user]);
//     }

//     // Set verification config ID
//     function setConfigId(bytes32 _configId) external onlyOwner {
//         configId = _configId;
//     }

//     /**
//      * @notice Updates the scope used for verification.
//      * @dev Only callable by the contract owner.
//      * @param newScope The new scope to set.
//      */
//     function setScope(uint256 newScope) external onlyOwner {
//         _setScope(newScope);
//     }
    
//     /**
//      * @dev Claim ero20 token
//      * @param recipient : Recipient
//      * @param amount : Amount to transfer
//      * @param token : token contract
//      */
//     function _claimErc20(address recipient, uint amount, IERC20 token) internal {
//         if(address(token) != address(0)) {
//             uint balance = token.balanceOf(address(this));
//             if(balance > 0 && balance >= amount) {
//                 token.safeTransfer(recipient, amount);
//             }
//         }
//     }

//     /**
//      * @dev Claim ero20 token
//      * @param recipient : Recipient
//      * @param amount : Amount to transfer
//      */
//     function _claimNativeToken(address recipient, uint amount) internal {
//         uint balance = address(this).balance;
//         if(balance > 0 && balance >= amount) {
//             (bool done,) = recipient.call{value: amount}('');
//             if(!done) revert NativeClaimUnsuccessful();
//         }
//     }

//     /**
//      * @dev claim reward
//      * @notice Users cannot claim for the current week. They can only claim for the week that has ended
//      */
//     function claimReward() external nonReentrant returns(bool) {
//         address user = _msgSender();
//         ILearna.Eligibilities memory unclaims = learna.checkEligibility(user);
//         require(isVerified[user] && !blacklisted[user], "Not verified or blacklisted");
//         require(unclaims.elgs.length > 0, "Nothing to claim");
//         uint weekId = unclaims.weekId;
//         for(uint j = 0; j < unclaims.elgs.length; j++) {
//             ILearna.Eligibility memory claim = unclaims.elgs[j];
//             if(!learna.hasClaimed(user, weekId, claim.hash_)) {
//                 if(claim.isEligible){
//                     learna.onCampaignValueChanged(weekId, claim.hash_, claim.nativeAmount, claim.erc20Amount, claim.platform, user);
//                     if(claim.nativeAmount > 0) {
//                         _claimNativeToken(user, claim.nativeAmount);
//                     }
//                     if(claim.erc20Amount > 0) {
//                         _claimErc20(user, claim.erc20Amount, IERC20(claim.token));
//                     } 
//                     if(claim.platform > 0) {
//                         _claimErc20(user, claim.platform, IERC20(learna.getPlatformToken()));
//                     }
//                 }
//             }
//         }

//         return true; 
//     }

//     /**
//      * @dev Verify and register users for unclaim rewards. 
//      * @param user : User account
//      * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
//      * user cannot make eligibity check twice in the same week. 
//      * Note: User cannot verify eligibility for a week twice.
//      */
//     function _verify(address user) internal {
//         require(user != address(0), "Zero address");
//         require(!blacklisted[user], "Blacklisted user");
//         require(!isVerified[user], "Already verified");
//         isVerified[user] = true;
//     }

//     /**
//      * @dev Registers user for the claim. 
//      * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
//      * user cannot make eligibity check twice in the same week.
//      * @notice Should be called by anyone provided they subscribed to the campaign already
//      */
//     function verify() external whenWalletRequired returns(bool) {
//         _verify(_msgSender());
//         return true;
//     }
 
//     /**
//      * @dev Manually registers user for the claim. 
//      * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
//      * user cannot make eligibity check twice in the same week.
//      * @notice Should be called only by the approved account provided the parsed user had subscribed to the campaign already.
//      * Must not be using Self verification.
//      */
//     function verifyByApproved(address user) external whenWalletRequired onlyApproved returns(bool) {
//         _verify(user);
//         return true;
//     }
 
//     /**
//      * @notice Hook called after successful verification - handles user registration
//      * @dev Validates registration conditions and registers the user for both E-Passport and EUID attestations
//      * @param output The verification output containing user data
//     */
//     function customVerificationHook(
//         ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
//         bytes memory /**unused-param */
//     ) internal override {
//         address user = address(uint160(output.userIdentifier));
//         require(output.userIdentifier > 0, "InvalidUserIdentifier");
//         require(output.olderThan >= 16, "You should be at least 16 yrs");
//         bool[3] memory ofacs = output.ofac;
//         for(uint8 i = 0; i < ofacs.length; i++) {
//             require(ofacs[i], "Sanction individual");
//         }
 
//         _verify(user);

//         emit UserVerified(user);
//     }

//     /**
//      * @dev Update learna contract instance address
//      */
//     function setLearna(address _learna) public onlyOwner {
//         require(_learna != address(learna) && _learna != address(0), "Address is the same or empty");
//         learna = ILearna(_learna);
//     }

//     /**
//      * @dev Update the isWalletVerificationRequired = true; flag
//      */
//     function toggleUseWalletVerification() public onlyApproved {
//        isWalletVerificationRequired = !isWalletVerificationRequired;
//     }

//     /**
//      * @dev Emergency withdrawal of funds
//      * @param to : Recipient
//      * @param amount : Native amount
//      * @param token : ERC20 token if needed
//      * @param tokenAmount : Amount of ERC20 token to withdraw
//      */
//     function withdraw(address to, uint amount, address token, uint tokenAmount) public onlyOwner returns(bool) {
//         if(address(this).balance > 0) {
//             (bool done,) = to.call{value: amount}('');
//             require(done, "Transfer failed");
//         }
//         if(tokenAmount > 0) {
//             if(token != address(0)) {
//                 IERC20 tk = IERC20(token);
//                 uint balance = tk.balanceOf(address(this));
//                 if(balance >= tokenAmount){
//                     tk.transfer(to, tokenAmount);
//                 }
//             }
//         }
//         return true;
//     }

//     /**
//      * @dev Remove or add users from the list of campaigns in the current week
//      * @param users : List of users 
//      * @notice Only owner function
//     */
//     function banOrUnbanUser(address[] memory users) public onlyAdmin whenNotPaused  returns(bool) {
//         uint size = users.length;
//         bool[] memory statuses = new bool[](size);
//         for(uint i = 0; i < size; i++) {
//             address user = users[i]; 
//             bool status = blacklisted[user];
//             statuses[i] = !status;
//             blacklisted[user] = !status;
//         }
//         emit ILearna.UserStatusChanged(users, statuses);
//         return true;
//     } 

// }
