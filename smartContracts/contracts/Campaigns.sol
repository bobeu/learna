// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

/**
 * @title Campaigns. 
 * @author : Bobeu - https://github.com/bobeu
 * @notice A non-deployable parent contract that perform CRUD operation on campaigns
*/
abstract contract Campaigns {
    struct Campaign {
        uint256 fundsNative;
        uint256 fundsERC20;
        uint96 totalPoints;
        uint64 lastUpdated;
        uint activeLearners; 
        uint64 transitionDate;
        uint64 claimActiveUntil;
        address operator;
        address token;
        bytes32 hash_;
        bool canClaim;
    }

    struct CampaignData {
        bytes32 campaignHash;
        bytes encoded;
    }

    CampaignData[] private campaignData;

    //week data for all campaigns
    mapping(uint weekId => Campaign[]) private campaigns;
    
    mapping(uint weekId => mapping(bytes32 campaignHash => bool)) private initializer;

    // Campaign identifiers
    mapping(uint weekId => mapping(bytes32 => uint32)) private campaignIds;

    /**
     * @dev Only approved campaign can pass
     * @param weekId: Week id
     * @param campaignHash : Campaign Hash : Hash of the campaign string e.g keccack256("Solidity")
    */
    function _validateCampaign(bytes32 campaignHash, uint weekId) internal view {
        require(_isInitializedCampaign(weekId, campaignHash), "Not a valid campaign");
    } 

    /**
     * @dev Check if a campaign has been funded
     * @param weekId : Week Id
     * @param campaignHash : Campaign hash
     */
    function _hasFund(uint weekId, bytes32 campaignHash) internal view returns(bool hasFund) {
        Campaign memory cp = _getCampaign(weekId, campaignHash);
        hasFund = cp.fundsNative > 0 || cp.fundsERC20 > 0; 
    }
    
    /**
     * @dev Only valid campaign id can pass
     * @param weekId : Week Id
     * @param campaignSlot : Campaign slot
    */
    function onlyValidCampaignSlot(uint weekId, uint32 campaignSlot) internal view {
        require(campaignSlot < _getTotalCampaignForAGivenWeek(weekId), "Invalid campaign id");
    }

    // Returns the length of users in a campaign for the given week 
    function _getTotalCampaignForAGivenWeek(uint weekId) internal view returns(uint32 result) {
        result = uint32(campaigns[weekId].length);
    }

    /**
     * @dev Check whether a campaign is initialized or not
     * @param campaignHash : Campaign hash
     * @param weekId : Week Id
    */
    function _isInitializedCampaign(uint weekId, bytes32 campaignHash) internal view returns(bool result) {
        result = initializer[weekId][campaignHash];
    }

    /**
     * @dev Return the hashed result of a campaign string
     * @param campaign : Campaign string
     */
    function _getCampaignHash(string memory campaign) internal pure returns(bytes32 hash_, bytes memory encoded) {
        encoded = bytes(campaign);
        hash_ = keccak256(encoded);
    }

    /**
     * @dev Initializeds a new campaign slot
     * @param weekId : Week Id
     * @param campaign : Campaign string
    */
    function _initializeCampaign(uint weekId, string memory campaign) internal returns(Campaign memory result, bytes32 _campaignHash) {
        uint32 cId;
        (bytes32 campaignHash, bytes memory encoded) = _getCampaignHash(campaign);
        if(!_isInitializedCampaign(weekId, campaignHash)){
            initializer[weekId][campaignHash] = true;
            campaignData.push(CampaignData(campaignHash, encoded));
            cId = _getTotalCampaignForAGivenWeek(weekId);
            campaigns[weekId].push();
            campaignIds[weekId][campaignHash] = cId;
            campaigns[weekId][cId].hash_ = campaignHash;
        } else {
            cId = _getCampaignId(weekId, campaignHash);
        }
        _campaignHash = campaignHash;
        result = campaigns[weekId][cId];
    }

    /**
     * Update other data in Week data
     * @param weekId : Week id
     * @return data : Other data
     */
    function _getCampaings(uint weekId) internal view returns(Campaign[] memory data) {
        data = campaigns[weekId];
    }

    /**
     * Return campaign data with encoded and hashed values
     */
    function getCampaingData() public view returns(CampaignData[] memory cData) {
        cData = campaignData;
        return cData;
    }

    /**
     * Update other campaign data
     * @param weekId : Week id
     * @param campaign : Other data
     * @param campaignHash : Campaign Hash
     */
    function _setCampaign(
        uint weekId, 
        bytes32 campaignHash, 
        Campaign memory campaign
    ) internal  {
        uint32 cId = _getCampaignId(weekId, campaignHash);
        onlyValidCampaignSlot(weekId, cId);
        campaigns[weekId][cId] = campaign;
    }

    /**
     * Update other campaign data
     * @param weekId : Week id
     * @param campaignHash : Campaign Id
     * @return result : Other data 
     */
    function _getCampaign(uint weekId, bytes32 campaignHash) internal view returns(Campaign memory result) {
        uint32 cId = _getCampaignId(weekId, campaignHash);
        onlyValidCampaignSlot(weekId, cId);
        result = campaigns[weekId][cId];
    }

    /**
     * @dev Returns campaign data
     * @param weekId : Week Id
     * @param campaignHash : Campaign hash iD
     */
    function _getCampaignId(uint weekId, bytes32 campaignHash) internal view returns(uint32 id) {
        id = campaignIds[weekId][campaignHash]; 
    }

    // Return the current unix time stamp on the network
    function _now() internal view returns(uint64 result) {
        result = uint64(block.timestamp);
    } 
}