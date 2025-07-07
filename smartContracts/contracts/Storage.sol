// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

// import { Slots } from "./Slots.sol";

abstract contract Storage {
    // enum RewardType { NATIVE, ERC20, BOTH }

    // struct Values {
    //     uint totalAllocated;
    //     uint totalClaimed;
    // }

    // // Claim data
    // struct Claim {
    //     Values native;
    //     Values erc20;
    //     address erc20Addr;
    //     uint64 claimActiveUntil;
    // }
               
    // User's profile dat

    struct Campaign {
        uint256 fundsNative;
        uint256 fundsERC20;
        uint96 totalPoints;
        uint64 lastUpdated;
        uint activeLearners; 
        // uint64 transitionInterval;
        uint64 transitionDate;
        // bool active;
        uint64 claimActiveUntil;
        address operator;
        address token;
        // RewardType rewardType;
        // Claim claim;
        bytes32 hash_;
    }

    // struct WeekDataOther {
    // }

    // struct Campaign {
    //     CampaignOther others;
    //     Profile[] learners;
    // }

    struct CampaignData {
        bytes32 hash_;
        bool isApproved;
    }

    //week data for all protocols
    mapping(uint weekId => Campaign[]) private campaigns;

    // Weekly campaigns
    // mapping(uint weekId => bytes32[]) private campaignHashes;

    // Campaign identifiers
    mapping(uint weekId => mapping(bytes32 => uint32)) private campaignIds;

    /**
     * @dev Only approved campaign can pass
     * @param weekId: Week id
     * @param campaignHash : Campaign Hash : Hash of the campaign string e.g keccack256("Solidity")
    */
    function _validateCampaign(bytes32 campaignHash, uint weekId) internal view {
        require(campaignIds[weekId][campaignHash] > 0, "Not a valid campaign");
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

    // // Returns the length of users in a campaign for the given week  
    // function _getTotalLearnersInACampaign(uint weekId, uint32 cId) internal view returns(uint96 result) {
    //     result = uint96(campaigns[weekId][cId].learners.length);
    // }

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
        result = _getCampaignId(weekId, campaignHash) > 0;
    }

    /**
     * @dev Initializeds a new campaign slot
     * @param weekId : Week Id
     * @param campaignHash : Campaign hash
     * @notice : Slot 0 is reserved hence no campaign can occupy slot 0.
    */
    function _initializeCampaign(uint weekId, bytes32 campaignHash) internal returns(Campaign memory result) {
        uint32 cId;
        if(!_isInitializedCampaign(weekId, campaignHash)){
            cId = _getTotalCampaignForAGivenWeek(weekId);
            campaigns[weekId].push();
            if(cId == 0) {
                cId = _getTotalCampaignForAGivenWeek(weekId);
                campaigns[weekId].push();
            }
            campaignIds[weekId][campaignHash] = cId;
            campaigns[weekId][cId].hash_ = campaignHash;
        } else {
            cId = _getCampaignId(weekId, campaignHash);
        }
        result = campaigns[weekId][cId];
    }

    // /**
    //  * @dev Initializeds a new campaign slot
    //  * @param weekId : Week Id
    //  * @param campaignHash : Campaign Hash
    //  */
    // function _initializeProfile(uint weekId, bytes32 campaignHash) internal returns(uint96 slot) {
    //     uint32 cId = _getCampaignId(weekId, campaignHash);
    //     slot = _getTotalLearnersInACampaign(weekId, cId);
    //     campaigns[weekId][cId].learners.push();
    // }

    // /**
    //  * Update other data in Week data
    //  * @param weekId : Week id
    //  * @param others : Other data
    //  */
    // function _setWeekDataOther(uint weekId, WeekDataOther memory others) internal {
    //     campaigns[weekId].others = others;
    // }

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

    // /**
    //  * Update other campaign data
    //  * @param weekId : Week id
    //  * @param profile : Profile data
    //  * @param campaignHash : Campaign Hash
    //  * @param slot : Slot ref
    //  */
    // function _setCampaignProfile(uint weekId, bytes32 campaignHash, uint96 slot, Profile memory profile) internal {
    //     campaigns[weekId][_getCampaignId(weekId, campaignHash)].learners[slot] = profile;
    // }

    // /**
    //  * Update other campaign data
    //  * @param weekId : Week id
    //  * @param claim :Claim data
    //  * @param campaignId : Campaign Id
    //  */
    // function _setClaim(uint weekId, uint32 campaignId, Claim memory claim) internal {
    //     campaigns[weekId][campaignId].others.claim = claim; 
    // }

    // /**
    //  * Update other campaign data
    //  * @param weekId : Week id
    //  * @param campaignId : Campaign Id
    //  * @return claim :Claim data
    //  */
    // function _getClaim(uint weekId, uint32 campaignId) internal view returns(Claim memory claim) {
    //     claim = campaigns[weekId][campaignId].others.claim; 
    // }

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

    // /**
    //  * @dev Set transition date
    //  * @param transitionInterval : interval
    //  * @param weekId: Week Id
    //  */
    // function _setTransitionDate(uint64 transitionInterval, uint weekId) internal {
    //     campaigns[weekId].others.transitionDate = _now() + transitionInterval;
    // }


}