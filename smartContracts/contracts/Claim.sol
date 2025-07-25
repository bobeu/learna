// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import { AttestationId } from "@selfxyz/contracts/contracts/constants/AttestationId.sol";
import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ILearna } from "./interfaces/ILearna.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { Admins } from "./Admins.sol";

/**
 * @title Claim
 *  Inspired by Self protocol.See https://github.com/selfxyz/self/blob/main/contracts/contracts/example/Airdrop.sol for more information
 */
contract Claim is SelfVerificationRoot, Admins, ReentrancyGuard {
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
    error NotVerified();
    error AlreadyClaimed();
    error UserIdentifierAlreadyVerified();

    // Events
    event UserIdentifierVerified(address indexed registeredUserIdentifier);
    event MerkleRootUpdated(bytes32 newMerkleRoot);

    /// @notice Structured data for reading Claimable results 
    struct ClaimResult {
        ILearna.Eligibility[] elgs;
        uint weekId;
        bool isVerified;
        bool barred;
        bool claimed;
    }

    // Learna contract
    ILearna public learna;

    /// @notice Verification config ID for identity verification
    bytes32 public configId;

    /// @notice Merkle root used to validate reward claims.
    // bytes32 public merkleRoot;

    ///@notice When this flag is turned off, user will need no verification to claim reward
    bool public useSelf;

    // /// @notice Maps of campaigns to user identifiers to registration status
    mapping(uint weekId => mapping(address user => ILearna.Eligibility[])) internal claimables;

    /// @dev User's registered claim. We use this to prevent users from trying to verify twice
    mapping(uint weekId => mapping(address user => bool)) internal isVerifiedClaim;

    /// @dev User's claim status. We use this to prevent users from trying to claim twice
    mapping(uint weekId => mapping(address user => bool)) internal isClaimed;

    // Blacklist
    mapping(address => bool) internal blacklisted;

    modifier whenNotUseSelf {
        require(!useSelf, "In verify mode");
        _;
    }

    /**
     * @dev Constructor
     * @param identityVerificationHubAddress : Hub verification address
     * @notice We set the scope to zero value hoping to set the real value immediately after deployment. This saves 
     * us the headache of generating the contract address ahead of time 
     */
    constructor(address identityVerificationHubAddress)
        SelfVerificationRoot(identityVerificationHubAddress, 0)
    {
        useSelf = true; 
    }

    receive() external payable {}

    function getConfigId(
        bytes32 destinationChainId,
        bytes32 userIdentifier, 
        bytes memory userDefinedData // Custom data from the qr code configuration
    ) public view override returns (bytes32) {
        // Return your app's configuration ID
        return configId;
    }

    ///@dev Fetches claimable data for all the wweeks except the current week, specifically the concluded week if any.
    function getClaimable(address user) public view returns(ClaimResult[] memory result) {
        uint weekIds = learna.getWeek();
        if(weekIds > 0) {
            result = new ClaimResult[](weekIds);
            for(uint i = 0; i < weekIds; i++){
                result[i] = ClaimResult(
                    claimables[i][user], 
                    i, 
                    isVerifiedClaim[i][user],
                    blacklisted[user],
                    isClaimed[i][user]
                );
            }
        }
        return result;
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
     * @param weekId  : The very weekId user want to claim from
     * @notice Users cannot claim for the current week. They can only claim for the week that has ended
     */
    function claimReward(uint weekId) external nonReentrant returns(bool done) {
        address user = _msgSender();
        ILearna.Eligibility[] memory claims = claimables[weekId][user];
        require(isVerifiedClaim[weekId][user] && !blacklisted[user], "Not verified or blacklisted");
        require(claims.length > 0, "Nothing to claim"); 
        require(!isClaimed[weekId][user], "Nothing to claim"); 
        isClaimed[weekId][user] = true;
        for(uint i = 0; i < claims.length; i++) {
            ILearna.Eligibility memory claim = claims[i];
            if(claim.protocolVerified){
                claimables[weekId][user][i].erc20Amount = 0;
                claimables[weekId][user][i].nativeAmount = 0;
                if(claim.erc20Amount > 0) _claimErc20(user, claim.erc20Amount, IERC20(claim.token)); 
                if(claim.nativeAmount > 0) _claimNativeToken(user, claim.nativeAmount);
            }
        }

        return done; 
    }

    /**
     * @dev Registers user for the claim. 
     * @param user : User account
     * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
     * user cannot make eligibity check twice in the same week. 
     * Note: User cannot verify eligibility for a week twice.
     */
    function _setClaim(address user) internal returns(bool _return) {
        (ILearna.Eligibility[] memory eligibilities, uint weekId) = learna.checkEligibility(user);
        require(!isVerifiedClaim[weekId][user], "Claim already registered");
        isVerifiedClaim[weekId][user] = true;
        for(uint i = 0; i < eligibilities.length; i++) {
            claimables[weekId][user].push(eligibilities[i]); 
        }
        _return = true;
    }

    /**
     * @dev Registers user for the claim. 
     * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
     * user cannot make eligibity check twice in the same week.
     * @notice Should be called by anyone provided they subscribed to the campaign already
     */
    function setClaim() external whenNotUseSelf returns(bool) {
        return _setClaim(_msgSender());
    }
 
    /**
     * @dev Manually registers user for the claim. 
     * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
     * user cannot make eligibity check twice in the same week.
     * @notice Should be called only by the approved account provided the parsed user had subscribed to the campaign already.
     * Must not be using Self verification.
     */
    function setClaim(address user) external whenNotUseSelf onlyApproved returns(bool) {
        return _setClaim(user);
    }
 
    /**
     * @notice Hook called after successful verification - handles user registration
     * @dev Validates registration conditions and registers the user for both E-Passport and EUID attestations
     * @param output The verification output containing user data
    */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData 
    ) internal override {
        require(useSelf, "Not in verify mode");
        address user = address(uint160(output.userIdentifier));
        require(output.userIdentifier > 0, "InvalidUserIdentifier");

        // if(bytes(output.nationality).length == 0) revert NationalityRequired();
        // Check that user age is min 16
 
        _setClaim(user);

        emit UserIdentifierVerified(user);
    }

    /**
     * @dev Update learna contract instance address
     */
    function setLearna(address _learna) public onlyOwner {
        require(_learna != address(learna) && _learna != address(0), "Address is the same or empty");
        learna = ILearna(_learna);
    }

    /**
     * @dev Update the useSelf flag
     */
    function toggleUseSelfFlag() public onlyApproved {
       useSelf = !useSelf;
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
