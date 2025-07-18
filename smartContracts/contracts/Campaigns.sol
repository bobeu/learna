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
        CampaignData data;
    }

    struct CampaignData {
        bytes32 campaignHash;
        bytes encoded;
    }

    struct Initializer {
        bool initialized;
        uint32 slot;
    }

    // Campaigns
    mapping(uint weekId => mapping(bytes32 campaignHash => Initializer)) private initializer;

    //week data for all campaigns
    mapping(uint weekId => Campaign[]) private campaigns;
    
    // mapping(uint weekId => mapping(bytes32 campaignHash => bool)) private initializer;

    // Campaign identifiers
    // mapping(uint weekId => mapping(bytes32 => uint32)) private campaignIds;

    /**
     * @dev Only approved campaign can pass
     * @param weekId: Week id
     * @param campaignHash : Campaign Hash : Hash of the campaign string e.g keccack256("Solidity")
    */
    function _validateCampaign(bytes32 campaignHash, uint weekId) internal view {
        require(_isInitializedCampaign(weekId, campaignHash), "Not a valid campaign");
    } 

    // /**
    //  * @dev Check if a campaign has been funded
    //  * @param weekId : Week Id
    //  * @param campaignHash : Campaign hash
    //  */
    // function _hasFund(uint weekId, bytes32 campaignHash) internal view returns(bool hasFund) {
    //     Campaign memory cp = _getCampaign(weekId, campaignHash);
    //     hasFund = cp.fundsNative > 0 || cp.fundsERC20 > 0; 
    // }
    
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
     * @param weekId : Week Id
     * @param campaignHash : Campaign hash
    */
    function _isInitializedCampaign(uint weekId, bytes32 campaignHash) internal view returns(bool result) {
        result = initializer[weekId][campaignHash].initialized;
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
     * @param campaignHash : Hash representation of the campaign
     * @param encoded : Encoded version of the campaign i.e bytes(campaignstring)
     * @param transitionDate : Date when the campaign for thr current week we transitioned or sorted
     * @param fundsERC20 : Initial funding in ERC20 token
     * @param fundsNative : Initial funding in native asset
     * @param token : Funding token address
    */
    function _initializeCampaign(
        uint weekId, 
        uint64 transitionDate,
        bytes32 campaignHash,
        bytes memory encoded,
        address operator,
        uint256 fundsNative,
        uint256 fundsERC20,
        address token
    ) internal {
        require(!_isInitializedCampaign(weekId, campaignHash), "Already initialized");
        uint32 slot = uint32(campaigns[weekId].length);
        initializer[weekId][campaignHash] = Initializer(true, slot);
        campaigns[weekId].push(Campaign(fundsNative, fundsERC20, 0, _now(), 0,  transitionDate, 0, operator, token, campaignHash, false, CampaignData(campaignHash, encoded)));
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
        uint32 cId = _getCampaignSlot(weekId, campaignHash);
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
        uint32 cId = _getCampaignSlot(weekId, campaignHash);
        onlyValidCampaignSlot(weekId, cId);
        result = campaigns[weekId][cId];
    }

    /**
     * @dev Returns campaign data
     * @param weekId : Week Id
     * @param campaignHash : Campaign hash iD
     */
    function _getCampaignSlot(uint weekId, bytes32 campaignHash) internal view returns(uint32 id) {
        id = initializer[weekId][campaignHash].slot; 
    }

    // Return the current unix time stamp on the network
    function _now() internal view returns(uint64 result) {
        result = uint64(block.timestamp);
    } 
}