// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";

import { IIdentityVerificationHubV2 } from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";
// import { SelfStructs } from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import { AttestationId } from "@selfxyz/contracts/contracts/constants/AttestationId.sol";

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

    // Errors
    error NativeClaimUnsuccessful();
    error TokenIsZeroAddress();
    error WeekNotReady();
    error NoClaimable();
    error ClaimUnsuccessful();
    error NationalityRequired();
    error EligibilityCheckDenied();
    error InvalidProof();
    error InvalidUserIdentifier();
    error UserIdentifierAlreadyVerified();

    // Events
    event UserIdentifierVerified(uint256 indexed registeredUserIdentifier, uint256 indexed nullifier);
    event MerkleRootUpdated(bytes32 newMerkleRoot);

    // Learna contract
    ILearna public learna;

    /// @notice Verification config ID for identity verification
    bytes32 public configId;

    /// @notice Merkle root used to validate reward claims.
    bytes32 public merkleRoot;

    /// @notice Maps nullifiers to user identifiers for registration tracking
    mapping(uint256 nullifier => uint256 userIdentifier) internal _nullifierToUserIdentifier;

    // /// @notice Maps user identifiers to registration status
    mapping(uint256 userIdentifier => bool registered) internal verified;
    // _registeredUserIdentifiers[uint256(uint160(registeredAddress))];  ///////////////////////// converts user address to idenfitiers

    mapping(address user => ILearna.Eligibility) private claimables;

    /**
     * @dev Constructor
     * @param identityVerificationHubAddress : Hub verification address
     * @notice We set the scope to zero value hoping to set the real value immediately after deployment. This saves 
     * us the headache of generating the contract address ahead of time 
     */
    constructor(address identityVerificationHubAddress)
        SelfVerificationRoot(identityVerificationHubAddress, 0)
        Ownable(_msgSender())
    { }

    function getConfigId(
        bytes32 destinationChainId,
        bytes32 userIdentifier, 
        bytes memory userDefinedData // Custom data from the qr code configuration
    ) public view override returns (bytes32) {
        // Return your app's configuration ID
        return configId;
    }

    // function setVerificationConfig(
    //     ISelfVerificationRoot.VerificationConfig memory newVerificationConfig
    // ) external onlyOwner {
    //     _setVerificationConfig(newVerificationConfig);
    // }

    // Set verification config ID
    function setConfigId(bytes32 _configId) external onlyOwner {
        configId = _configId;
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
     * @notice Updates the scope used for verification.
     * @dev Only callable by the contract owner.
     * @param newScope The new scope to set.
     */
    function setScope(uint256 newScope) external onlyOwner {
        _setScope(newScope);
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
     * @param claimIndex: position og the claim in the merkle tree
     * @param merkleProof  : Hash of the merkle proof
     * @notice Users cannot claim for the current week. They can only claim for the week that has ended
     */
    function claimReward(uint256 claimIndex, bytes32[] memory merkleProof) external nonReentrant returns(bool done) {
        ILearna.Eligibility memory clm = claimables[_msgSender()];
        claimables[_msgSender()] = ILearna.Eligibility(false, 0, 0, 0, address(0), bytes32(0));
        unchecked {
            if (!MerkleProof.verify(
                merkleProof, 
                merkleRoot, 
                keccak256(abi.encodePacked(claimIndex, _msgSender(), clm.erc20Amount + clm.nativeAmount))
            )) revert InvalidProof();
        }
        done = learna.onClaimed(clm, _msgSender());
        if(clm.erc20Amount > 0) _claimErc20(_msgSender(), clm.erc20Amount, IERC20(clm.token)); 
        if(clm.nativeAmount > 0) _claimNativeToken(_msgSender(), clm.nativeAmount);
        return done; 
    }

    /**
     * @dev Registers user for the claim. 
     * @param campaignHash : Campaign hash
     * @param user : User account
     * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
     * user cannot make eligibity check twice in the same week.
     */
    function setClaim(bytes32 campaignHash, address user) external returns(bool) {
        ILearna.Eligibility memory elg = learna.checkEligibility(user, campaignHash);
        ILearna.Eligibility memory amt = claimables[user];
        if(amt.weekId == elg.weekId) revert EligibilityCheckDenied();
        if(!elg.canClaim) revert ILearna.NotEligible();
        unchecked {
            if((elg.nativeAmount + elg.erc20Amount) == 0) revert NoClaimable();
        }
        if(elg.token == address(0)) revert ILearna.InvalidAddress(elg.token);
        claimables[user] = elg;

        return true;
    }

    /**
     * @notice Hook called after successful verification - handles user registration
     * @dev Validates registration conditions and registers the user for both E-Passport and EUID attestations
     * @param output The verification output containing user data
    */
//    struct GenericDiscloseOutputV2 {
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
    
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory /* userData */
    ) internal override {

        // // Check if nullifier has already been registered
        // if (_nullifierToUserIdentifier[output.nullifier] != 0) {
        //     revert RegisteredNullifier();
        // }

        // Check if user identifier is valid
        if(output.userIdentifier == 0) {
            revert InvalidUserIdentifier();
        }

        // Check if user identifier has already been registered
        if(verified[output.userIdentifier]) {
            revert UserIdentifierAlreadyVerified();
        }

        // _nullifierToUserIdentifier[output.nullifier] = output.userIdentifier;
        if(bytes(output.nationality).length == 0) revert NationalityRequired();
        verified[output.userIdentifier] = true;

        // Emit registration event
        emit UserIdentifierVerified(output.userIdentifier, output.nullifier);
    }

    /**
     * @dev Update learna contract instance address
     */
    function setLearna(address _learna) public onlyOwner {
        require(_learna != address(learna), "Address is the same");
        learna = ILearna(_learna);
    }
}

// https://docs.self.xyz/concepts/user-context-data