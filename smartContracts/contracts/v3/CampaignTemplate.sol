// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20Metadata, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IVerifier } from "../interfaces/IVerifier.sol";
import { UtilsV3 } from "./UtilsV3.sol";
import { Common } from "../interfaces/Common.sol";
import { ICampaignTemplate, ICampaignFactory } from "./interfaces/ICampaignTemplate.sol";
import { CampaignMetadata, IApprovalFactory } from "./CampaignMetadata.sol";

contract CampaignTemplate is ICampaignTemplate, CampaignMetadata, ReentrancyGuard {
    using UtilsV3 for *;

    /**@dev Stage of this campaign
        @notice Campaign can be configured to have names for each epoch
     */
    uint private epoches;

    address private dev;

    // Verifier contract
    IVerifier private verifier;

    /**@dev Mapping showing whether user has claimed reward for an epoch or not
        @notice We use address(this) to represent 3rd key in the mapping for the native coin e.g Celo. Since there can be more than one reward token in a campign,
        we use the address for each token as 3rd key in the mapping.
     */
    mapping(RewardType => mapping(uint epoch => mapping(address user => mapping(address token => bool)))) private isClaimed;

    ///@notice Frequencies at which learners save proof of assimilation in every 24 hours 
    mapping(address => Frequency) private frequencies;

    ///@notice Position of current user in the list of learners in a given epoch
    mapping(address => mapping(uint epoch => Spot)) private spots;

    ///@notice Total prooved points for each epoch
    mapping(uint epoch => EpochData) private epochData;

    modifier validateEpochInput(uint epoch) {
        if(epoch > epoches) revert InvalidEpoch();
        _;
    }

    // // Only approved account is allowed
    // modifier onlyApproved {
    //     require(approvalFactory.hasApproval(_msgSender()), "No approval");
    //     _;
    // }

    ///@notice Constructor
    constructor(
        address _dev, 
        address _operator, 
        IApprovalFactory _approvalFactory, 
        IVerifier _verifier,
        MetadataInput memory meta
    ) payable CampaignMetadata(_operator, _approvalFactory, meta) {
        // assert(address(_verifier) != address(0));
        // assert(_dev != address(0));
        // assert(address(_approvalFactory) != address(0));
        verifier = _verifier;
        dev = _dev;
    }

    receive() external payable {
        unchecked {
            epochData[epoches].setting.funds.nativeInt += msg.value;
        }
    }

    /**@notice Fetch the type of funds from the storage
        @param rwType : Type of reward
        @param fundIndex : The position of the fund in the array
        @param epoch : Epoch Id
     */
    function _getFunds(
        RewardType rwType, 
        uint fundIndex, 
        uint epoch
    ) internal view returns(ERC20Token memory erc20, uint256 native, uint fundSize) {
        if(rwType == RewardType.POASS) {
            fundSize =epochData[epoch].setting.funds.erc20Ass.length;
            if(fundIndex < fundSize){
                erc20 = epochData[epoch].setting.funds.erc20Ass[fundIndex];
            }
            native = epochData[epoch].setting.funds.nativeAss;
        } else {
            fundSize = epochData[epoch].setting.funds.erc20Int.length;
            if(fundIndex < fundSize){
                erc20 = epochData[epoch].setting.funds.erc20Int[fundIndex];
            }
            native = epochData[epoch].setting.funds.nativeInt;
        }
    }

    /**
     * @dev Calculates user's share of the payout
     * @param rwType Typeof reward i.e POINT or POASS
     * @param userProofs : Total proved points accumulated by the learner over the campaign preiod 
     * @param totalProofs : Total assimilation proved for the period/epoch;
     * @param fundIndex : The position of the ERC20 fund to claim in the fund array if any. This should be correctly parsed from the frontend, otherwis it fails.
     * @param epoch : Current epoch
     * @param target : Target account
     */
    function _calculateShare(
        RewardType rwType,
        uint64 userProofs, 
        uint64 totalProofs, 
        uint8 fundIndex, 
        uint epoch, 
        address target
    ) internal view returns(Common.ShareOut memory sh) {
        uint8 dec;
        if(totalProofs >= userProofs) {
            if(totalProofs > 0 && userProofs > 0) { 
                unchecked {
                    (ERC20Token memory erc, uint256 native, uint fundSize) = _getFunds(rwType, fundIndex, epoch);
                    if(!isClaimed[rwType][epoch][target][address(this)]){
                        if(native > 0) sh.native = totalProofs.calculateShare(userProofs, native, 18);
                    }
                    if(fundSize > 0) {
                        if(erc.amount > 0) {
                            if(erc.token != address(0)){
                                sh.token = erc.token;
                                if(!isClaimed[rwType][epoch][target][erc.token]) {
                                    dec = IERC20Metadata(erc.token).decimals();
                                    sh.erc20 = totalProofs.calculateShare(userProofs, erc.amount, dec);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**@dev Aggregate all proofs for the current learner
        @param epoch: Epoch Id
        @param userIndex : Position of the learner in the Learners' array
     */
    function _calculateProofs(uint epoch, uint userIndex) internal view returns(uint64 userProofs) {
        ProofOfAssimilation[] memory poass = epochData[epoch].learners[userIndex].poass;
        for(uint i = 0; i < poass.length; i++) {
            unchecked {
                userProofs += poass[i].score;
            }
        }
    }

    /**@dev Aggregate all proof of integration
        @param epoch: Epoch Id
     */
    function _getProofsOfInt(uint epoch) internal view returns(uint64 totalProofs) {
        Learner[] memory lnr = epochData[epoch].learners;
        for(uint i = 0; i < lnr.length; i++) {
            unchecked {
                totalProofs += lnr[i].point.score;
            }
        }
    }

    /**@dev Perform setting for current epoch
        @param arg : Setting of type EpochSettingInput
        @param rwType: Reward type
    */
    function epochSetting(EpochSettingInput memory arg, RewardType rwType) external payable onlyOwnerOrApproved returns(bool) {
        uint epoch = epoches;
        EpochSetting memory eps = epochData[epoch].setting;
        if(arg.maxProof != eps.maxProof && arg.maxProof > 0) eps.maxProof = arg.maxProof;
        unchecked {
            rwType == RewardType.POASS? epochData[epoch].setting.funds.nativeAss += msg.value : epochData[epoch].setting.funds.nativeInt += msg.value;
            if(arg.endInHr > 0) eps.endDate = (_now() + arg.endInHr * 1 hours);
        }
        if(!arg.isEditing) {
            eps.createdAt = _now();
        }
        eps.activatedAt = _now();
        if(arg.tokens.length > 0) {
            for(uint i = 0; i < arg.tokens.length; i++) {
                _setUpERC20Funds(arg.tokens[i], arg.newOperator, epoch, rwType);
            }
        }

        return true;
    }

    /**@dev Record points based on learning outcome
        @param poa : Proof of assimilation object
        @param rating : Performance rating for completing a path
     */
    function proveAssimilation(ProofOfAssimilation memory poa, Performance memory rating) public whenNotPaused returns(bool) {
        uint epoch = epoches;
        address sender = _msgSender();
        Spot memory spot = spots[sender][epoch];
        if(!spot.hasValue) {
            spot.hasValue = true;
            spot.value = epochData[epoch].learners.length;
            epochData[epoch].learners.push();
            spots[sender][epoch] = spot;
            epochData[epoch].learners[spot.value].id = sender;
        }
        // Learner memory lnr = learners[epoch][spot.value];
        Frequency memory fq = frequencies[sender];
        uint24 maxProof = epochData[epoch].setting.maxProof;
        unchecked {
            if(fq.lastSeen > 0) {
                if((_now() - fq.lastSeen) < 24 hours) {
                    if(maxProof > 0) {
                        if(fq.times > maxProof) revert MaxProofPerDayExceeded();
                    }
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
        epochData[epoch].learners[spot.value].ratings.push(rating);
        ICampaignFactory(approvalFactory.getFactory()).updatedUserCampaign(sender);

        emit Proof(poa, sender);
        return true;
    }

    /**@dev Learners claim reward
        @param fundIndex : The position of the erc20 token in the list of erc20 funds.
        @param epoch : Epoch to claim from .
        @param rwType : Reward type .
        @notice Learners can only claim from an epoch if the epoch deadline has passed.
     */
    function claimReward(
        uint8 fundIndex, 
        uint epoch, 
        RewardType rwType
    ) public whenNotPaused validateEpochInput(epoch) returns(bool) {
        address sender = _msgSender();
        if(_now() < epochData[epoch].setting.endDate) revert ClaimNotReady();
        if(!verifier.isVerified(sender)) revert NotVerified();
        Spot memory spot = spots[sender][epoch];
        Common.ShareOut memory sh = dev._rebalance(
            _calculateShare(
                rwType,
                rwType == RewardType.POASS? _calculateProofs(epoch, spot.value) : epochData[epoch].learners[spot.value].point.score, 
                rwType == RewardType.POASS? epochData[epoch].totalProofs : _getProofsOfInt(epoch), 
                fundIndex, 
                epoch, 
                _msgSender()
            )
        );
        unchecked {
            if(sh.erc20 > 0) {
                isClaimed[rwType][epoch][sender][sh.token] = true;
                if(rwType == RewardType.POASS) {
                    epochData[epoch].setting.funds.erc20Ass[fundIndex].amount -= sh.erc20;
                } else {
                    epochData[epoch].setting.funds.erc20Int[fundIndex].amount -= sh.erc20;
                }
                sender._sendErc20(sh.erc20, sh.token);
            }
            if(sh.native > 0) {
                isClaimed[rwType][epoch][sender][address(this)] = true;
                if(rwType == RewardType.POASS) {
                    epochData[epoch].setting.funds.nativeAss -= sh.native;
                } else {
                    epochData[epoch].setting.funds.nativeInt -= sh.native;
                }
                sender._sendValue(sh.native);
            }
        }
        emit Claimed(sender, sh);
        return true;
    }

    /**@dev Add erc20 funds to this campaign
        @param token: Token address
        @param op: Operator's address
        @param epoch: Epoch Id
        @param rwType: Reward type
     */
    function _setUpERC20Funds(
        address token, 
        address op, 
        uint epoch, 
        RewardType rwType
    ) internal {
        uint8 tokenCount = rwType == RewardType.POASS? uint8(epochData[epoch].setting.funds.erc20Ass.length) : uint8(epochData[epoch].setting.funds.erc20Int.length);
        if(tokenCount < 3) {
            if(token != address(0)){
                uint allowance = IERC20(token).allowance(op, address(this));
                if(allowance > 0) {
                    IERC20(token).transferFrom(op, address(this), allowance);
                    if(rwType == RewardType.POASS) {
                        epochData[epoch].setting.funds.erc20Ass.push(
                            ERC20Token (
                                token,
                                abi.encode(IERC20Metadata(token).name()),
                                abi.encode(IERC20Metadata(token).symbol()),
                                allowance
                            )
                        );
                    } else {
                        epochData[epoch].setting.funds.erc20Int.push(
                            ERC20Token (
                                token,
                                abi.encode(IERC20Metadata(token).name()),
                                abi.encode(IERC20Metadata(token).symbol()),
                                allowance
                            )
                        );
                    }
                }
                emit ERC20FundAdded(metadata.hash_, token, allowance);
            }
        }
    }

    /**@dev Owner or approved account can explicitly update proof of integration reward for learners
        @param targets : Array of target addresses
        @param points : Points earned as proof of integration
        @param epoch : Epoch Id
        @notice Targets array size must tally with that of points. 
     */
    function updatePoints(
        address[] memory targets, 
        uint32[]memory points, 
        uint epoch
    ) external onlyOwnerOrApproved whenNotPaused returns(bool) {
        if(targets.length == points.length) {
            for(uint32 i = 0; i < targets.length; i++) {
                address target = targets[i];
                Spot memory spot = spots[target][epoch];
                if(target != address(0)) {
                    unchecked {
                        epochData[epoch].learners[spot.value].point.score += points[i];
                    }
                }
            }
        }
        emit PointsUpdated(targets, points, epoch);
        return true;
    }

    /**@dev Set metadata
        @param token: Token address
        @param epoch: Epoch Id
        @param rwType: Reward type
     */
    function addFund(
        address token, 
        uint epoch, 
        RewardType rwType
    ) external payable onlyOwnerOrApproved whenNotPaused returns(bool) {
        _setUpERC20Funds(token, _msgSender(), epoch, rwType);
        return true;
    }

    function getData(address target, address token) external view returns(ReadData memory data) {
        uint _epoches = epoches + 1;
        data.metadata = metadata;
        data.verifier = verifier;
        data.owner = operator;
        data.approvalFactory = approvalFactory;
        data.epoches = epoches;
        data.epochData = new EpochData[](_epoches);
        data.isPoassClaimed = new bool[](_epoches);
        data.isPointClaimed = new bool[](_epoches);
        for(uint i = 0; i < _epoches; i++){
            data.epochData[i] = epochData[i];
            data.isPoassClaimed[i] = isClaimed[RewardType.POASS][i][target][token];
            data.isPointClaimed[i] = isClaimed[RewardType.POINT][i][target][address(this)];
        }
        return data;
    }
}