// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

// import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import { Utils } from "../libraries/Utils.sol";
// import { CampaignsV2, IERC20 } from "./CampaignsV2.sol";
import { IERC20Metadata, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IApprovalFactory } from "./ApprovalFactory.sol";
import { IVerifier } from "../interfaces/IVerifier.sol";

interface ICampaignTemplate {
    error OnlyOperator();
    error NotVerified();

    event Proof(ProofOfAssimilation poa, address indexed sender);
    event ERC20FundAdded(bytes32 indexed hash_, address indexed _token, uint amount);

    struct ProofOfAssimilation {
        uint8 questionSize;
        uint32 score;
        uint64 totalPoints;
        uint16 percentage;
        uint64 timeSpent;
        bytes completedAt;
    }

    struct ProofOfIntegration {
        bytes link; // Can be any link to learner's portfolio e.g Githuh, figma etc
        bool ok; // Flag showing that the learner's link has be curated and approved by an admin or any designated 
        uint64 submittedAt; 
        uint64 approvedAt; 
    }

    struct Rating {
        uint64 value; 
        uint64 ratedAt; // Date rated
        address rateBy; // Account that gave rating;
    }
        // ProofOfIntegration poi; // Link to proof of integration if user has taken SDK test
        // ProofOfAssimilation poa;

    // This should be a link to user portfolio such as github or any link to proof that user integrate or learn something valuable;
    // Proof of assimilation is achieved when user successfully complete a short training section with our Agent and take the short test to proof that they understand what they just learnt. They in turn earn POINT token as reward. They earn other asset provided by the campaign operator when they successfully integrate what they learned
    // When users take a test to proof they understand what the learned about a particular subject, they can always retake it. Retaking will override their previous scores. They can continue to retake the test until they find the best scores.
    // Our AI agent provides feedback, possible areas of improvement and ratings to learners before they send the scores to the blockchain. 
    // Note, ratings are hidden until saved onchain. Feedbacks are shown to learners in an instant.
    struct Learner {
        address id;
        Rating[] ratings;
        ProofOfIntegration point;
        ProofOfAssimilation[] poass;
    }
    
    struct ERC20Token {
        address token;
        bytes tokenName;
        bytes tokenSymbol;
        uint256 amount;
    }

    struct Metadata {
        bytes32 hash_; // Keccack256 value of the campaign name with the 
        bytes name; // Campaign name e.g Divvi
        bytes link; // Any other relevant link
        bytes description; // Max length is 300
        bytes campaignId; // Can be a UUID or any uniquely generated identity for each campaign
        bytes imageUrl;
    }

    // // Offchain
    // struct Metric {
    //     bytes identifier;
    //     uint24 length;
    //     uint32 totalLearners;
    //     uint32 numOfIntegration;
    //     uint256 nativeFunds;
    //     ERC20Token[] tokenFunds;
    //     //////////////////////////////////////////////////////////////////////Add more metrics and deliverables
    // }

    struct Spot {
        uint value;
        bool hasValue;
    }

    struct Funds {
        ERC20Token[] erc20;
        uint256 native;
    } 

    struct EpochSetting {
        uint24 maxProof; // Maximum assimilation learners can prove in a day
        uint64 createdAt;
        uint64 activatedAt;
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

    // struct CampaignData {
    //     bool active;
    //     address operator;
    //     Funds funds;
    //     Metadata metadata;
    // }

    function editMetaData(Metadata memory _meta) public returns(bool);

    struct EpochSettingInput {
        uint24 maxProof; // Maximum assimilation learners can prove in a day
        bool isEditing;
        uint64 activatedAt;
        uint24 endInHr;
        address[] tokens;
    }
}

contract CampaignTemplate is ICampaignTemplate, Ownable, Pausable {
    /**@dev Stage of this campaign
        @notice Campaign can be configured to have names for each epoch
     */
    uint internal epoches;

    // Account operating the campaign
    address internal operator;

    // Verifier contract
    IVerifier public immutable verifier;

    ///@notice Approval factory contract
    ApprovalFactory public immutable approvalFactory;

    // Campaign information such as name, etc. 
    Metadata internal metadata;

    ///@notice Data that controls how learners stream proof of assimilation to this contract
    // ProofMeta internal proofMeta;

    ///@notice Funds in the campaign can accept at most 3 erc20 tokens
    // ERC20Token[] internal tokens;

    ///@notice Learners 
    // Learners internal learners;

    ///@notice Campaign metrics
    // mapping(uint => Metric) internal metrics;

    ///@notice Mapping of epoch to learners' points based on proof of assimilation result
    // mapping(uint epoch => Learner[]) internal learners;

    ///@notice Frequencies at which learners save proof of assimilation in every 24 hours 
    mapping(address => Frequency) internal frequencies;

    ///@notice Position of current user in the list of learners in a given epoch
    mapping(address => mapping(uint epoch => Spot)) internal spots;

    ///@notice Mapping showing if learner has claimed reward for an epoch or not
    mapping(uint epoch => mapping(address => bool)) public isClaimed;

    ///@notice Total prooved points for each epoch
    mapping(uint epoch => EpochData) internal epochData;
    

    ///@dev Only operator function
    modifier onlyOperator {
        if(_msgSender() != operator) revert OnlyOperator();
        _;
    }

    // Only approved account is allowed
    modifier onlyApproved {
        require(approvalFactory.hasApproval(_msgSender()), "No approval");
        _;
    }

    ///@dev Only operator function
    modifier onlyOperatorOrApproved {
        if(_msgSender() != operator) {
            require(approvalFactory.hasApproval(_msgSender()), "No approval");
        } else {
            revert OnlyOperator();
        }
        _;
    }

    ///@notice Constructor
    constructor(address initialOperator, IApprovalFactory _approvalFactory, IVerifier _verifier) Ownable(_msgSender()) {
        _setOperator(initialOperator);
        assert(address(_verifier) != address(0));
        assert(address(_approvalFactory) != address(0));
        approvalFactory = _approvalFactory;
        verifier = _verifier;
    }

    receive() external payable {}

    /**
     * @dev Calculates user's share of the weekly payout
     * @param userPoints : Total points accumulated by the user
     * @param cp : Campaign 
     */
    function _calculateShare(uint64 userProofs, uint64 totalProofs) internal view returns(uint erc20, uint native, uint platform) {
        uint8 dec;
        if(userProofs > totalProofs) revert BalanceAnomally();
        if(totalProofs > 0) { 
            unchecked {
                if(cp.fundsNative > 0) native = cp.totalPoints.calculateShare(userPoints, cp.fundsNative, 18);
                if(cp.fundsERC20 > 0) {
                    if(cp.token != address(0)){
                        dec = IERC20Metadata(cp.token).decimals();
                        erc20 = cp.totalPoints.calculateShare(userPoints, cp.fundsERC20, dec);
                    }
                }
                if(cp.platformToken > 0) {
                    if(address(token) != address(0)){
                        dec = IERC20Metadata(address(token)).decimals();
                        platform =  cp.totalPoints.calculateShare(userPoints, cp.platformToken, dec);
                    }
                }
            }
        }
    }

    /**@dev Perform setting for current epoch
        @param arg : Setting of type EpochSettingInput
        @param operator: New operator account address
     */
    function epochSetting(EpochSettingInput memory arg, address operator) public payable onlyOperatorOrApproved returns(bool) {
        uint epoch = epoches;
        EpochSetting memory eps = epochData[epoch].setting;
        if(arg.maxProof != eps.maxProof) eps.maxProof = arg.maxProof;
        unchecked {
            if(arg.endInHr > 0) eps.endDate = (_now() + arg.endInHr * 1 hours);
            epochData[epoch].setting.funds.native += msg.value;
        }
        if(!arg.isEditing) {
            eps.createdAt = _now();
        }
        eps.activatedAt = _now();
        epochData[epoch].setting = eps;
        if(arg.tokens.length > 0) {
            for(uint i = 0; i < arg.tokens.length; i++) {
                _setUpERC20Funds(arg.tokens[i], operator, epoch);
            }
        }

        return true;
    }

    ///@dev Set proofMeta information
    function _metadataSetting(Metadata memory _meta) internal {
        if(_meta.activatedAt.length > 0) metadata.activatedAt = _meta.activatedAt;
        if(_meta.description.length > 0) metadata.description = _meta.description;
        if(_meta.name.length > 0) {
            metadata.name = _meta.name;
            metadata.hash_ = keccak256(abi.encodePacked(_meta.name, address(this)));
        }
        if(_meta.endDate.length > 0) metadata.endDate = _meta.endDate;
        if(_meta.imageUrl.length > 0) metadata.imageUrl = _meta.imageUrl;
        if(_meta.link.length > 0) metadata.link = _meta.link;
    }

    ///@dev Change the campaign operator
    function _setOperator(address newOperator) internal {
        require(newOperator != operator, "New operator is the existing address");
        operator = newOperator;
    }

    function _now() internal view returns(uint64 currentTime){
        currentTime = uint64(block.timestamp);
    }

    /**@dev Record points based on learning outcome
        @param poa : Proof of assimilation object
     */
    function proofAssimilation(ProofOfAssimilation memory poa) public whenNotPaused returns(bool) {
        uint epoch = epoches;
        address sender = _msgSender();
        Spot memory spot = spots[user][epoch];
        if(!spot.hasValue) {
            spot.hasValue = true;
            spot.value = epochData[epoch].learners.length;
            epochData[epoch].learners.push();
            spots[user][epoch] = spot;
            learners[epoch][spot.value].id = sender;
        }
        // Learner memory lnr = learners[epoch][spot.value];
        Frequency memory fq = frequencies[sender];
        unchecked {
            if(fq.lastSeen > 0) {
                if((_now() - fq.lastSeen) < 24 hours) {
                    if(proofMeta.maxProof > 0) require(fq.times <= proofMeta.maxProof, "Learner exceeds max proof per day");
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

        emit Proof(poa, sender);
    }

    function claimReward() public whenNotPaused returns(bool) {
        address sender = _msgSender();
        uint epoch = epoches;
        if(isClaimed[epoch][sender]) revert RewardClaimed();
        isClaimed[epoch][sender] = true;
        if(!verifier.isVerified(sender)) revert NotVerified();
        uint64 totalPoints = epochData[epoch].totalProofs;
        (uint erc20, uint native, uint platform) = _calculateShare(nullifier? 0 : totalScore, cp);
    }

    /**@dev Add erc20 funds to this campaign
        @param _token: Token address
        @param op: Operator's address
     */
    function _setUpERC20Funds(address _token, address op, uint epoch) internal {
        uint8 tokenCount = uint8(epochData[epoch].setting.funds.erc20.length;)
        require(tokenCount < 3, "Max of 3 erc20 funds exceeded");
        if(_token != address(0)){
            uint allowance = IERC20(_token).allowance(op, address(this));
            if(allowance > 0) {
                IERC20(_token).transferFrom(op, address(this), allowance);
                epochData[epoch].setting.funds.erc20.push(
                    ERC20Token {
                        _token,
                        IERC20(_token).name(),
                        IERC20(_token).symbol(),
                        allowance
                    }
                );
            }
            emit ERC20FundAdded(metadata.hash_, _token, allowance);
        }
    }

    // /**@dev Set metadata
    //     @param _token: Token address
    //  */
    // function addFund(address _token) external payable onlyOperator whenNoPaused returns(bool) {
    //     _setUpERC20Funds(_token, _msgSender());
    //     return true;
    // }

    /**@dev Set metadata
        @param _meta: New metadata
     */
    function editMetaData(Metadata memory _meta) public onlyOperatorOrApproved returns(bool) {
        _metadataSetting(_meta);
        return true;
    }

    /**
     * @dev Calculates user's share of the weekly payout
     * @param userPoints : Total points accumulated by the user
     * @param cp : Campaign 
     */
    function _calculateShare( 
        uint64 userPoints, 
        CData memory cp
    ) internal view returns(uint erc20, uint native, uint platform) {
        uint8 dec;
        if(userPoints > cp.totalPoints) revert BalanceAnomally();
        if(cp.totalPoints > 0) { 
            unchecked {
                if(cp.fundsNative > 0) native = cp.totalPoints.calculateShare(userPoints, cp.fundsNative, 18);
                if(cp.fundsERC20 > 0) {
                    if(cp.token != address(0)){
                        dec = IERC20Metadata(cp.token).decimals();
                        erc20 = cp.totalPoints.calculateShare(userPoints, cp.fundsERC20, dec);
                    }
                }
                if(cp.platformToken > 0) {
                    if(address(token) != address(0)){
                        dec = IERC20Metadata(address(token)).decimals();
                        platform =  cp.totalPoints.calculateShare(userPoints, cp.platformToken, dec);
                    }
                }
            }
        }
    }

    function pause() public onlyApproved {
        _pause();
    }

    function unpause() public onlyApproved {
        _pause();
    }
}