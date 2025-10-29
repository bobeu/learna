// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { ICampaignTemplate, ICampaignFactory } from "./interfaces/ICampaignTemplate.sol";
import { IVerifier } from "../interfaces/IVerifier.sol";

contract Interfacer {
    // ERRORS
    error NotCampaignOwner();
    error OnlyOwner();
    error NotVerified();
    error OperationFailed();
    error FactoryIsZeroAddress();
    error InvalidCampaignIndex();

    struct ReadData {
        address factory;
        address verifier;
        address owner;
    }
    
    // CampaignFactory
    ICampaignFactory public factory;

    // Verifier contract
    IVerifier private verifier;

    address private owner;

    ///@notice User campaigns
    mapping(address => UserCampaign[]) private userCampaigns;

    ///@notice Users' registered campaign
    mapping(address => mapping(address => bool)) private isRegisteredCampaign;

    modifier onlyOwner {
        if(_msgSender() != owner) revert OnlyOwner();
        _;
    }

    // ============== CONSTRUCTOR ==============
    constructor (address _factory) {
        _setFactory(_factory);
        owner = _msgSender();
    }

    // Set new factory address
    function _setFactory(address _factory) private {
        if(_factory == address(0)) revert FactoryIsZeroAddress();
        factory = ICampaignFactory(_factory);
    }

    function _msgSender() internal view returns(address sender) {
        sender = msg.sender;
    }

    function _onlyCampaignCreator(address creator) internal view {
        if(_msgSender() != creator) revert NotCampaignOwner();
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
        _setFactory(_factory);
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

    /**@dev Update setting for current epoch
        @param arg : Setting of type EpochSettingInput
        @param rwType: Reward type
        @param campaignIndex : Campaign index
    */
    function epochSetting(ICampaignTemplate.EpochSettingInput memory arg, ICampaignTemplate.RewardType rwType, uint campaignIndex) external payable returns(bool){
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, true).identifier).epochSetting(arg, rwType));
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
        @param points : Points earned as proof of integration
        @param epoch : Epoch Id
        @param campaignIndex : Campaign index
        @notice Targets array size must tally with that of points. 
     */
    function approveIntegration(address[] memory targets, uint32[]memory points, uint epoch, uint campaignIndex) external returns(bool){
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, true).identifier).approveIntegration(targets, points, epoch));
    }

    /**@dev Add funds to campaign
        @param token: Token address
        @param epoch: Epoch Id
        @param rwType: Reward type
        @param campaignIndex : Campaign index
    */
    function addFund(address token, uint epoch, ICampaignTemplate.RewardType rwType, uint campaignIndex) external payable returns(bool){
        return _ensureOperation(ICampaignTemplate(_getAndValidateCampaign(campaignIndex, true).identifier).addFund(token, epoch, rwType));
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
                userCampaigns[user].push(UserCampaign(user, _sender, false));
            }
        }
    }

    function getUserCampaigns(address target) external view returns(UserCampaign[] memory) {
        return userCampaigns[target];
    }

    function getData() public view returns(ReadData memory) {
        return ReadData(
            address(factory),
            address(verifier),
            owner
        );
    }

}