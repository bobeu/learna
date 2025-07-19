// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { ILearna } from "./ILearna.sol";

/**
 * @title Campaigns. 
 * @author : Bobeu - https://github.com/bobeu
 * @notice A non-deployable parent contract that perform CRUD operation on campaigns
*/
abstract contract Campaigns is ILearna {
    // Campaigns
    mapping(uint weekId => mapping(bytes32 campaignHash => Initializer)) private initializer;

    //week data for all campaigns
    mapping(uint weekId => Campaign[]) private campaigns;

    /**
     * @dev Only approved campaign can pass
     * @param weekId: Week id
     * @param campaignHash : Campaign Hash : Hash of the campaign string e.g keccack256("Solidity")
    */
    function _validateCampaign(bytes32 campaignHash, uint weekId) internal view {
        require(_isInitializedCampaign(weekId, campaignHash), "Not a valid campaign");
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