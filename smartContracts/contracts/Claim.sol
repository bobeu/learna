// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import { AttestationId } from "@selfxyz/contracts/contracts/constants/AttestationId.sol";
import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ILearna } from "./interfaces/ILearna.sol";
import { Admins } from "./Admins.sol";

interface IVerifier {
    function getVerificationStatus(address user) external view returns(bool _isVerified, bool _isBlacklisted);
}
/**
 * @title Claim
 *  Inspired by Self protocol.See https://github.com/selfxyz/self/blob/main/contracts/contracts/example/Airdrop.sol for more information
 */
contract Verifier is SelfVerificationRoot, IVerifier, Admins, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Events
    event UserVerified(address indexed registeredUserIdentifier);

    /// @notice Verification config ID for identity verification
    bytes32 public configId;

    ///@notice When this flag is turned off, user will need no verification to claim reward
    bool public isWalletVerificationRequired; // default is true in the constructor, meaning user must verify before claiming

    /// @dev User's registered claim. We use this to prevent users from trying to verify twice
    mapping(address user => bool) internal verificationStatus;

    // Blacklist
    mapping(address => bool) internal blacklisted;

    modifier whenWalletRequired() {
        require(isWalletVerificationRequired, "Wallet verification required");
        _;
    }

    /**
     * @dev Constructor
     * @param identityVerificationHubAddress : Hub verification address
     * @notice We set the scope to zero value hoping to set the real value immediately after deployment. This saves 
     * us the headache of generating the contract address ahead of time 
     */
    constructor(address identityVerificationHubAddress) SelfVerificationRoot(identityVerificationHubAddress, 0) {
        isWalletVerificationRequired = true; 
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

    /**@dev Return user's verification status
        * @param user : User's account
     */
    function getVerificationStatus(address user) external view returns(bool _isVerified, bool _isBlacklisted) {
        return (verificationStatus[user], blacklisted[user]);
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
    function verify() external whenWalletRequired returns(bool) {
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
    function verifyByApproved(address user) external whenWalletRequired onlyApproved returns(bool) {
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
        require(output.userIdentifier > 0, "InvalidUserIdentifier");
        require(output.olderThan >= 16, "You should be at least 16 yrs");
        bool[3] memory ofacs = output.ofac;
        for(uint8 i = 0; i < ofacs.length; i++) {
            require(ofacs[i], "Sanction individual");
        }
 
        _verify(user);

        emit UserVerified(user);
    }

    /**
     * @dev Update the isWalletVerificationRequired = true; flag
     */
    function toggleUseWalletVerification() public onlyApproved {
       isWalletVerificationRequired = !isWalletVerificationRequired;
    }

    /**
     * @dev Emergency withdrawal of funds
     * @param to : Recipient
     * @param amount : Native amount
     * @param token : ERC20 token if needed
     * @param tokenAmount : Amount of ERC20 token to withdraw
     */
    function withdraw(address to, uint amount, address token, uint tokenAmount) public onlyOwner returns(bool) {
        if(address(this).balance > 0) {
            (bool done,) = to.call{value: amount}('');
            require(done, "Transfer failed");
        }
        if(tokenAmount > 0) {
            if(token != address(0)) {
                IERC20 tk = IERC20(token);
                uint balance = tk.balanceOf(address(this));
                if(balance >= tokenAmount){
                    tk.transfer(to, tokenAmount);
                }
            }
        }
        return true;
    }

    /**
     * @dev Remove or add users from the list of campaigns in the current week
     * @param users : List of users 
     * @notice Only owner function
    */
    function banOrUnbanUser(address[] memory users) public onlyAdmin whenNotPaused  returns(bool) {
        uint size = users.length;
        bool[] memory statuses = new bool[](size);
        for(uint i = 0; i < size; i++) {
            address user = users[i]; 
            bool status = blacklisted[user];
            statuses[i] = !status;
            blacklisted[user] = !status;
        }
        emit ILearna.UserStatusChanged(users, statuses);
        return true;
    } 

}
