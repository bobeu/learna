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


// File contracts/interfaces/IVerifier.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;

interface IVerifier {
    function isVerified(address user) external view returns(bool);
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


// File contracts/v3/Interfacer.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.28;
contract Interfacer is IInterfacer {
    // ERRORS
    error OnlyOwner();
    error PointClaimed();
    error NotVerified();
    error NoApproval();
    error OperationFailed();
    error ZeroAddress();
    error InvalidCampaignIndex();

    struct ReadData {
        address factory;
        address verifier;
        address owner;
    }

    struct Point {
        bool isClaimed;
        uint64 point;
        uint lastSyncedEpoch;
    }
    
    // CampaignFactory
    ICampaignFactory public factory;

    ///@notice Approval factory contract
    IApprovalFactory private approvalFactory;

    // Verifier contract
    IVerifier private verifier;

    address private owner;

    ///@notice User campaigns
    mapping(address => ICampaignFactory.UserCampaign[]) private userCampaigns;

    ///@notice Users' registered campaign
    mapping(address => mapping(address => bool)) private isRegisteredCampaign;

    /// Mapping of user to points earned
    mapping(address => Point) internal points;

    modifier onlyOwner {
        if(_msgSender() != owner) revert OnlyOwner();
        _;
    }

    // ============== CONSTRUCTOR ==============
    constructor (IApprovalFactory _approvalFactory) {
        owner = _msgSender();
        if(address(_approvalFactory) == address(0)) revert ZeroAddress();
        approvalFactory = _approvalFactory;
    }

    function _msgSender() internal view returns(address sender) {
        sender = msg.sender;
    }

    function _onlyCampaignCreator(address creator) internal view {
        if(_msgSender() != creator) {
            if(!approvalFactory.hasApproval(_msgSender())) revert NoApproval();
        }
    }

    /// @notice Ensure that the result of an operation succeed. The result must evaluate to boolean value.
    function _ensureOperation(bool result) internal pure returns(bool _result) {
        if(!result) revert OperationFailed();
        _result = result;
    }

    /**
     * @dev Get a campaign from the factory using an index or position
     * @notice It returns empty campaign if the index is not correct or out of bound
     */
    function _getAndValidateCampaign(uint index, bool enforeCreator) internal view returns(ICampaignFactory.Campaign memory cmp) {
        cmp = factory.getCampaign(index);
        if(cmp.identifier == address(0)) revert InvalidCampaignIndex();
        if(enforeCreator) _onlyCampaignCreator(cmp.creator);
    }

    function setFactory(address _factory) public onlyOwner returns(bool) {
        if(_factory == address(0)) revert ZeroAddress();
        factory = ICampaignFactory(_factory);
        return true;
    }
    
    /**@dev Set new Verifier contract 
        @param newVerifier : New Verifier contract
    */
    function setVerifier(address newVerifier) external onlyOwner returns(bool) {
        if(newVerifier != address(verifier)) {
            verifier = IVerifier(newVerifier);
            return true;
        } else {
            return false;
        }
    }

    function setNewOwner(address newOwner) public onlyOwner returns(bool) {
        require(newOwner != address(0), "New owner is zero");
        owner = newOwner;
        return true;
    }

    /**@dev Set new approval contract 
        @param newApprovalFactory : New Approval contract
     */
    function setApprovalFactory(address newApprovalFactory) external returns(bool) {
        if(!approvalFactory.hasApproval(_msgSender())) revert NoApproval();
        if(newApprovalFactory != address(approvalFactory)){
            approvalFactory = IApprovalFactory(newApprovalFactory);
            return true;
        } else {
            return false;
        }
    }

    /**@dev Update setting for current epoch
        @param arg : Setting of type EpochSettingInput
        @param rwType: Reward type
        @param campaignIndex : Campaign index
    */
    function epochSetting(ICampaignTemplate.EpochSettingInput memory arg, ICampaignTemplate.RewardType rwType, uint campaignIndex) external payable returns(bool){
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, true).identifier).epochSetting{value: msg.value}(arg, rwType));
    }

    /**@dev Record points based on learning outcome
        @param poa : Proof of assimilation object
        @param rating : Performance rating for completing a path
        @param campaignIndex : Campaign index
     */
    function proveAssimilation(ICampaignTemplate.ProofOfAssimilation memory poa, ICampaignTemplate.Performance memory rating, uint campaignIndex) external returns(bool){
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, false).identifier).proveAssimilation(poa, rating, _msgSender()));
    }

    /**@dev Claim reward for proof of assimilation
        @param fundIndex : The position of the erc20 token in the list of erc20 funds.
        @param epoch : Epoch to claim from .
        @param campaignIndex : Campaign index
        @notice Learners can only claim from an epoch if the epoch deadline has passed.
    */
    function claimRewardForPOASS(uint8 fundIndex, uint epoch, uint campaignIndex) external returns(bool){
        address sender = _msgSender();
        if(!verifier.isVerified(sender)) revert NotVerified();
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, false).identifier).claimRewardForPOASS(fundIndex, epoch, sender));
    }

    /**@dev Claim reward for proof of integration 
        @param fundIndex : The position of the erc20 token in the list of erc20 funds
        @param epoch : Epoch to claim from
        @param campaignIndex : Campaign index
        @notice Learners can only claim from an epoch if the epoch deadline has passed
     */
    function claimRewardForPOINT(uint8 fundIndex, uint epoch, uint campaignIndex) external returns(bool){
        address sender = _msgSender();
        if(!verifier.isVerified(sender)) revert NotVerified();
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, false).identifier).claimRewardForPOINT(fundIndex, epoch, sender));
    }
    
    /**@dev Builders submit proof on integration 
     * @param campaignIndex : Campaign index
     * @param links : Array of links to the proof. This could be any valid link e.g Github, Figma, etc
     * @notice Builder can submit at most 3 links before the epoch ends. Continous submission will override existing links which allow
        them to edit as many time as they wish. Builder must have proof assimilation before they can submit proof of integration.
     */
    function submitProofOfIntegration(string[3] memory links, uint campaignIndex) external returns(bool){
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, false).identifier).submitProofOfIntegration(links, _msgSender()));
    }

    
    /**@dev Owner or approved account can explicitly approve proof of integration reward for learners/builders
        @param targets : Array of target addresses
        @param _points : Points earned as proof of integration
        @param epoch : Epoch Id
        @param campaignIndex : Campaign index
        @notice Targets array size must tally with that of points. 
     */
    function approveIntegration(address[] memory targets, uint32[] memory _points, uint epoch, uint campaignIndex) external returns(bool){
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, true).identifier).approveIntegration(targets, _points, epoch, _msgSender()));
    }

    /**@dev Add funds to campaign
        @param token: Token address
        @param rwType: Reward type
        @param campaignIndex : Campaign index
        @notice Only operator or approved account can add funds
    */
    function addFund(address token, ICampaignTemplate.RewardType rwType, uint campaignIndex) external payable returns(bool){
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, true).identifier).addFund{value: msg.value}(token, _msgSender(), rwType));
    }

    /**@dev Set metadata
        @param _meta: New metadata
        @param campaignIndex : Campaign index
     */
    function editMetaData(ICampaignTemplate.MetadataInput memory _meta, uint campaignIndex) external returns(bool){
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, true).identifier).editMetaData(_meta));
    }

    /**
     * @dev Stop execution of a campaign
     * @param campaignIndex : Campaign index
     */
    function pause(uint campaignIndex) external returns(bool) {
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, true).identifier).pause());
    }

    /**
     * @dev Continue execution of a campaign
     * @param campaignIndex : Campaign index
     */
    function unpause(uint campaignIndex) external returns(bool) {
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, true).identifier).unpause());
    }

    function updateUserCampaign(address user) external {
        address _sender = _msgSender();
        if(isRegisteredCampaign[address(this)][_sender]) {
            if(!isRegisteredCampaign[user][_sender]) {
                isRegisteredCampaign[user][_sender] = true;
                userCampaigns[user].push(ICampaignFactory.UserCampaign(user, _sender, false));
            }
        }
    }

    function getUserCampaigns(address target) external view returns(ICampaignFactory.UserCampaign[] memory) {
        return userCampaigns[target];
    }

    /**@dev Claim points for user. 
        @notice : Learners can only claim once per epoch, hence they are adviced to claim 
        their points only when the epoch is completed otherwise they may lose the real points.
     */
    function claimPoint(uint epoch, uint campaignIndex) external returns(bool) {
        address sender = _msgSender();
        Point storage _p = points[sender];
        if(_p.isClaimed) revert PointClaimed();
        uint64 proofs = ICampaignTemplate(_getAndValidateCampaign(campaignIndex, true).identifier).getUserPoints(epoch, sender);
        if(_p.lastSyncedEpoch == epoch) {
            if(proofs > 0) {
                unchecked {
                    _p.point += proofs;
                    _p.lastSyncedEpoch += 1;
                }
            }
        }
        return true;
    }

    /**@dev Sync claim status for the target user.
        @param target : Account making claim
        @notice Only approved account can make claim
    */
    function syncClaim(address target) external returns(bool) {
        if(!approvalFactory.hasApproval(_msgSender())) revert NoApproval();
        Point storage _p = points[target];
        if(_p.isClaimed) revert PointClaimed();
        _p.isClaimed = true;
        return true;
    }

    function registerCampaign(address _campaign) external {
        require(_msgSender() == address(factory), "NotAllowed");
        isRegisteredCampaign[address(this)][_campaign] = true;
    }

    function getInterfacerData() public view returns(ReadData memory) {
        return ReadData(
            address(factory),
            address(verifier),
            owner
        );
    }

}
