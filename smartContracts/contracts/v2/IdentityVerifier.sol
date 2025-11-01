// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import { AttestationId } from "@selfxyz/contracts/contracts/constants/AttestationId.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Approved } from "../Approved.sol";
import { IVerifier } from "../interfaces/IVerifier.sol";

/**
 * @title IdentityVerifier.sol
 * @notice This contract handles identity verification using Self protocol's Verification system.
 * It allows users to verify their identity and claim rewards while preventing multiple verifications.
 * Users can be blacklisted to restrict access. They can also be verified via temporary wallet verification.
 * @dev Inherits from SelfVerificationRoot for Self protocol integration, Approved for access control, and ReentrancyGuard for security.
 * @author Bobeu && Self Protocol
 */
contract IdentityVerifier is SelfVerificationRoot, IVerifier, Approved, ReentrancyGuard {
    // Events
    event UserVerified(address indexed registeredUserIdentifier);

    /// @notice Verification config ID for identity verification
    bytes32 public configId;

    ///@notice When this flag is false, user will need to use Self verification
    bool public useWalletVerification; //Whether to use wallet verification or not

    /// @dev User's registered claim. We use this to prevent users from trying to verify twice
    mapping(address => bool) internal verificationStatus;

    // Blacklist
    mapping(address => bool) internal blacklisted;

    /**
     * @dev Constructor
     * @param identityVerificationHubAddress : Hub verification address
     * @notice We set the scope to zero value hoping to set the real value immediately after deployment. This saves 
     * us the headache of generating the contract address ahead of time 
     */
    constructor(address identityVerificationHubAddress) SelfVerificationRoot(identityVerificationHubAddress, 0) {
        useWalletVerification = true; 
    }

    receive() external payable {}

    function getConfigId(
        bytes32 /**unused-param */,
        bytes32 /**unused-param */, 
        bytes memory /**unused-param */ 
    ) public view override returns (bytes32) {
        // Return your app's configuration ID
        return configId;
    }

    // Set verification config ID
    function setConfigId(bytes32 _configId) external onlyOwner {
        configId = _configId;
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
     * @dev Verify and register users for unclaim rewards. 
     * @param user : User account
     * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
     * user cannot make eligibity check twice in the same week. 
     * Note: User cannot verify eligibility for a week twice.
     */
    function _verify(address user) internal {
        require(user != address(0), "Zero address");
        require(!blacklisted[user], "Blacklisted user");
        require(!verificationStatus[user], "Already verified");
        verificationStatus[user] = true;
    }

    /**
     * @dev Registers user for the claim. 
     * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
     * user cannot make eligibity check twice in the same week.
     * @notice Should be called by anyone provided they subscribed to the campaign already
     */
    function verify() external returns(bool) {
        require(useWalletVerification, "Use wallet verification not activated");
        _verify(_msgSender());
        return true;
    }
 
    /**
     * @dev Manually registers user for the claim. 
     * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
     * user cannot make eligibity check twice in the same week.
     * @notice Should be called only by the approved account provided the parsed user had subscribed to the campaign already.
     * Must not be using Self verification.
     */
    function verifyByApproved(address user) external onlyApproved returns(bool) {
        _verify(user);
        return true;
    }
 
    /**
     * @notice Hook called after successful verification - handles user registration
     * @dev Validates registration conditions and registers the user for both E-Passport and EUID attestations
     * @param output The verification output containing user data
    */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory /**unused-param */
    ) internal override {
        address user = address(uint160(output.userIdentifier));
        _verify(user);

        emit UserVerified(user);
    }

    /**
     * @dev Update the useWalletVerification
     */
    function toggleUseWalletVerification() public onlyApproved {
       useWalletVerification = !useWalletVerification;
    }

    function isVerified(address user) external view returns(bool) {
        return verificationStatus[user] && !blacklisted[user];
    }

    /**
     * @dev Remove or add users from the list of campaigns in the current week
     * @param users : List of users 
     * @notice Only owner function
    */
    function banOrUnbanUser(address[] memory users) public onlyApproved whenNotPaused  returns(bool) {
        uint size = users.length;
        for(uint i = 0; i < size; i++) {
            address user = users[i]; 
            bool status = blacklisted[user];
            blacklisted[user] = !status;
        }
        return true;
    } 

}
