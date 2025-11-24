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
