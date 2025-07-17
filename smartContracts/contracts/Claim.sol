// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
// import { SelfCircuitLibrary } from "@selfxyz/contracts/contracts/libraries/SelfCircuitLibrary.sol";
import { Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ILearna } from "./ILearna.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title Claim
 *  Inspired by Self protocol.See https://github.com/selfxyz/self/blob/main/contracts/contracts/example/Airdrop.sol for more information
 */
contract Claim is SelfVerificationRoot, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error NativeClaimUnsuccessful();
    error TokenIsZeroAddress();
    error ClaimUnsuccessful();
    // error RegisteredNullifier();

    /// @notice Reverts when an invalid Merkle proof is provided.
    error InvalidProof();

    /// @notice Reverts when an invalid user identifier is provided.
    error InvalidUserIdentifier();

    /// @notice Reverts when a user identifier has already been registered
    error UserIdentifierAlreadyRegistered();

    /// @notice Emitted when a user identifier is registered.
    event UserIdentifierRegistered(uint256 indexed registeredUserIdentifier, uint256 indexed nullifier);

    /// @notice Emitted when the Merkle root is updated.
    event MerkleRootUpdated(bytes32 newMerkleRoot);

    ILearna public learna;

    /// @notice Merkle root used to validate airdrop claims.
    bytes32 public merkleRoot;

    /// @notice Maps nullifiers to user identifiers for registration tracking
    mapping(uint256 nullifier => uint256 userIdentifier) internal _nullifierToUserIdentifier;

    /// @notice Maps user identifiers to registration status
    mapping(uint256 userIdentifier => bool registered) internal _registeredUserIdentifiers;

    constructor(
        address identityVerificationHubAddress,
        uint256 scopeValue
    )
        SelfVerificationRoot(identityVerificationHubAddress, scopeValue)
        Ownable(_msgSender())
    { }

    /**
     * @notice Updates the scope used for verification.
     * @dev Only callable by the contract owner.
     * @param newScope The new scope to set.
     */
    function setScope(uint256 newScope) external onlyOwner {
        _setScope(newScope);
    }

    /**
     * @notice Retrieves the expected proof scope.
     * @return The scope value used for registration verification.
     */
    function getScope() external view returns (uint256) {
        return _scope;
    }

    /**
     * @notice Sets the Merkle root for claim validation.
     * @dev Only callable by the contract owner.
     * @param newMerkleRoot The new Merkle root.
     */
    function setMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
        merkleRoot = newMerkleRoot;
        emit MerkleRootUpdated(newMerkleRoot);
    }

    /**
     * @dev Claim ero20 token
     * @param recipient : Recipient
     * @param amount : Amount to transfer
     * @param token : token contract
     */
    function _claimErc20(address recipient, uint amount, IERC20 token) internal {
        if(address(token) != address(0)) {
            uint balance = token.balanceOf(address(this));
            if(balance > 0 && balance >= amount) {
                token.safeTransfer(recipient, amount);
            }
        }
    }

    /**
     * @dev Claim ero20 token
     * @param recipient : Recipient
     * @param amount : Amount to transfer
     */
    function _claimNativeToken(address recipient, uint amount) internal {
        uint balance = address(this).balance;
        if(balance > 0 && balance >= amount) {
            (bool done,) = recipient.call{value: amount}('');
            if(!done) revert NativeClaimUnsuccessful();
        }
    }

    /**
     * @dev claim reward
     * @param weekId : Week id for the specific week user want to withdraw from
     * @param campaignHash : Hash of the campaign to claim from.
     * @param token  : Token address to claim from if any
     * @notice Users cannot claim for the current week. They can only claim for the week that has ended
     */
    function claimReward(
        uint weekId, 
        bytes32 campaignHash, 
        IERC20 token
        uint256 claimIndex, 
        uint256 amount, 
        bytes32[] memory merkleProof
    ) 
        external
        nonReentrant 
        returns(bool) 
    {
        address sender = _msgSender();
        ILearna.Eligibility memory _e = learna.checkEligibility(weekId, sender, campaignHash);
        require(_e.canClaim, "Cannot claim at this time");
        require(!_e.profile.other.claimed, 'Already claimed for the given week Id');
        _e.profile.other.claimed = true;
        if(_e.mode == Mode.LIVE) require(_now() <= _e.campaign.claimActiveUntil, 'Claim ended'); 
        
        unchecked {
            if(_e.campaign.fundsNative > _e.nativeAmount) _e.campaign.fundsNative -= _e.nativeAmount;
            if(_e.campaign.fundsERC20 > _e.nativeAmount) _e.campaign.fundsERC20 -= _e.erc20Amount;
            _e.profile.other.amountClaimedInNative += _e.nativeAmount;
            _e.profile.other.amountClaimedInERC20 += _e.erc20Amount;
        }
        
        if(!learna.onClaimed(weekId, sender, campaignHash, _e)) revert ClaimUnsuccessful();

        // Verify the Merkle proof.
        bytes32 node = keccak256(abi.encodePacked(claimIndex, msg.sender, amount));
        if (!MerkleProof.verify(merkleProof, merkleRoot, node)) revert InvalidProof();

        if(_e.erc20Amount > 0) {
            if(token == address(0)) revert TokenIsZeroAddress();
            _claimErc20(sender, _e.erc20Amount, IERC20(_e.campaign.token)); 
        }
        if(_e.nativeAmount > 0) _claimNativeToken(sender, _e.nativeAmount);
        return true; 
    }

    /**
     * @notice Hook called after successful verification - handles user registration
     * @dev Validates registration conditions and registers the user for both E-Passport and EUID attestations
     * @param output The verification output containing user data
    */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory /* userData */
    ) internal override {
        // Check if registration is open
        // if (!isRegistrationOpen) {
        //     revert RegistrationNotOpen();
        // }

        // // Check if nullifier has already been registered
        // if (_nullifierToUserIdentifier[output.nullifier] != 0) {
        //     revert RegisteredNullifier();
        // }

        // Check if user identifier is valid
        if (output.userIdentifier == 0) {
            revert InvalidUserIdentifier();
        }

        // Check if user identifier has already been registered
        if (_registeredUserIdentifiers[output.userIdentifier]) {
            revert UserIdentifierAlreadyRegistered();
        }

        _nullifierToUserIdentifier[output.nullifier] = output.userIdentifier;
        _registeredUserIdentifiers[output.userIdentifier] = true;

        // Emit registration event
        emit UserIdentifierRegistered(output.userIdentifier, output.nullifier);
    }

    /**
     * @dev Update learna contract instance address
     */
    function setLearna(address _learna) public onlyOwner {
        require(_learna != learna, "Address is the same");
        learna = ILearna(_learna);
    }
}