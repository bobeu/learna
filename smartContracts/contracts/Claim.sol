// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";

// import { IIdentityVerificationHubV2 } from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";
// import { SelfStructs } from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import { AttestationId } from "@selfxyz/contracts/contracts/constants/AttestationId.sol";

// import { SelfCircuitLibrary } from "@selfxyz/contracts/contracts/libraries/SelfCircuitLibrary.sol";
// import { Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ILearna } from "./interfaces/ILearna.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { Approved } from "./Approved.sol";

/**
 * @title Claim
 *  Inspired by Self protocol.See https://github.com/selfxyz/self/blob/main/contracts/contracts/example/Airdrop.sol for more information
 */
contract Claim is SelfVerificationRoot, Approved, ReentrancyGuard {
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
    event UserIdentifierVerified(address indexed registeredUserIdentifier, bytes32 indexed campaignHash);
    event MerkleRootUpdated(bytes32 newMerkleRoot);

    // Learna contract
    ILearna public learna;

    /// @notice Verification config ID for identity verification
    bytes32 public configId;

    /// @notice Merkle root used to validate reward claims.
    bytes32 public merkleRoot;

    ///@notice When this flag is turned off, user will need no verification to claim reward
    bool public useSelf;

    // /// @notice Maps of campaigns to user identifiers to registration status
    mapping(bytes32 campaignHash => mapping(address user => ILearna.Eligibility)) internal claimables;

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

    function getClaimable(bytes32 campaignHash, address user) external view returns(ILearna.Eligibility memory) {
        return claimables[campaignHash][user];
    }

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
     * @param campaignHash  : Hash of the selected campaign
     * @notice Users cannot claim for the current week. They can only claim for the week that has ended
     */
    function claimReward(bytes32 campaignHash) external nonReentrant returns(bool done) {
        ILearna.Eligibility memory clm = claimables[campaignHash][_msgSender()];
        if(useSelf){
            if(!clm.isVerified) revert NotVerified();
        }
        if(clm.isClaimed) revert AlreadyClaimed();
        clm.isClaimed = true;
        claimables[campaignHash][_msgSender()] = clm;
        require(clm.erc20Amount > 0 || clm.nativeAmount > 0, "No claim found");
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
    function _setClaim(bytes32 campaignHash, address user) internal returns(bool) {
        ILearna.Eligibility memory oldElg = claimables[campaignHash][user];
        ILearna.Eligibility memory newElg = learna.checkEligibility(user, campaignHash);
        if(oldElg.weekId == newElg.weekId) revert EligibilityCheckDenied();
        if(!newElg.canClaim) revert ILearna.NotEligible();
        unchecked {
            if((newElg.nativeAmount + newElg.erc20Amount) == 0) revert NoClaimable();
        }
        if(newElg.token == address(0)) revert ILearna.InvalidAddress(newElg.token);
        claimables[campaignHash][user] = newElg;

        return true;
    }

    /**
     * @dev Registers user for the claim. 
     * @param campaignHash : Campaign hash
     * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
     * user cannot make eligibity check twice in the same week.
     * @notice Should be called by anyone provided they subscribed to the campaign already
     */
    function setClaim(bytes32 campaignHash) external whenNotUseSelf returns(bool) {
        return _setClaim(campaignHash, _msgSender());
    }

    /**
     * @dev Registers user for the claim. 
     * @param campaignHash : Campaign hash
     * @notice This is expected to be the data parse as userData to the verification hook. To prevent attack,
     * user cannot make eligibity check twice in the same week.
     * @notice Should be called only by the approved account provided the parsed user had subscribed to the campaign already
     */
    function setClaim(bytes32 campaignHash, address user) external whenNotUseSelf onlyApproved returns(bool) {
        return _setClaim(campaignHash, user);
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
        (uint8 action, bytes32 campaignHash) = abi.decode(userData, (uint8, bytes32));
        
        if(action == 1) {
            if(output.userIdentifier == 0) {
                revert InvalidUserIdentifier();
            }
            // bytes32 campaignHash = bytes32(userDefinedData[1:33]);
            if(claimables[campaignHash][user].isVerified) {
                revert UserIdentifierAlreadyVerified();
            }

            if(bytes(output.nationality).length == 0) revert NationalityRequired();
            // Check that user age is min 16

            _setClaim(campaignHash, user);
            claimables[campaignHash][user].isVerified = true;

        }

    
        // address user = address(uint160(output.userIdentifier));
        // // bytes memory userDefinedData = userData[64:];

        // Emit registration event
        emit UserIdentifierVerified(user, campaignHash);
    }

    /**
     * @dev Update learna contract instance address
     */
    function setLearna(address _learna) public onlyOwner {
        require(_learna != address(learna), "Address is the same");
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
}

// https://docs.self.xyz/concepts/user-context-data
//  unchecked {
//             if (!MerkleProof.verify(
//                 merkleProof, 
//                 merkleRoot, 
//                 keccak256(abi.encodePacked(claimIndex, _msgSender(), clm.erc20Amount + clm.nativeAmount))
//             )) revert InvalidProof();
//         }