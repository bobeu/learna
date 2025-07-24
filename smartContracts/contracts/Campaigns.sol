// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Week } from "./Week.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Campaigns. 
 * @author : Bobeu - https://github.com/bobeu
 * @notice Non-deployable parent contract that perform CRUD operation on campaigns
*/ 
abstract contract Campaigns is Week {
    // Campaigns
    mapping(bytes32 campaignHash => Initializer) private initializer;

    //week data for all campaigns
    mapping(uint weekId => Campaign[]) private campaigns;

    ///@dev Week inititializer
    mapping(uint weekId => mapping(bytes32 => WeekInitializer)) private wInit;

    // Total campaigns
    uint private allCampaigns;

    // Mapping of campaigns to identifiers
    mapping(uint campaignIndex => bytes32 campaingHashValue) private indexer;

    /**
     * @dev Only approved campaign can pass
     * @param campaignHash : Campaign Hash : Hash of the campaign string e.g keccack256("Solidity")
    */
    function _validateCampaign(bytes32 campaignHash, uint weekId) internal view {
        require(
            _isInitialized(campaignHash) && wInit[weekId][campaignHash].hasSlot, 
            "Not a valid campaign");
    }

    /**
     * @dev Only valid campaign id can pass
     * @param weekId : Week Id
     * @param slot : Campaign slot
    */
    function onlyValidCampaignSlot(uint weekId, uint32 slot) internal view {
        require(slot < _getTotalCampaignForAGivenWeek(weekId), "Invalid campaign id");
    }

    /// Returns the length of users in a campaign for the given week 
    function _getTotalCampaignForAGivenWeek(uint weekId) internal view returns(uint32 result) {
        result = uint32(campaigns[weekId].length);
    }

    /**
     * @dev Check whether a campaign is initialized or not
     * @param campaignHash : Campaign hash
    */
    function _isInitialized(bytes32 campaignHash) internal view returns(bool result) {
        result = initializer[campaignHash].initialized;
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
     * @dev Initializeds a new campaign and create an index for it if not exist, Then initialize the campaign for the
     * parsed weekId. If already iniitialized, update the existing campaign in storage.
     * @param hash_ : Bytes32 hashed representation of the campaign
     * @param encoded : Bytes representation of the campaign string
     * @param operator : Campaign manager or creator
     * @param fundsNative : Amount funded in native token
     * @param fundsERC20 : Amount funded in erc20 token
     * @param token : Contract address of the funding token
    */

    function _tryInitializeCampaign(
        bytes32 hash_, 
        bytes memory encoded,
        address operator,
        uint256 fundsNative,
        uint256 fundsERC20,
        address token
    ) internal returns(Initializer memory _init, Campaign memory cmp) {
        uint weekId = _getState().weekId;
        if(!_isInitialized(hash_)){
            uint index = allCampaigns;
            allCampaigns = index + 1;
            indexer[index] = hash_;
            initializer[hash_] = Initializer(true, index, encoded, hash_);
        } else {
            _init = initializer[hash_];
        }
        WeekInitializer memory wi = wInit[weekId][hash_];
        if(!wi.hasSlot){
            wi.hasSlot = true;
            wi.slot = uint32(campaigns[weekId].length);
            campaigns[weekId].push(Campaign(fundsNative, fundsERC20, 0, _now(), 0, operator, token, hash_, false, CampaignData(hash_, encoded)));
            wInit[weekId][hash_] = wi;
            emit NewCampaign(_getCampaign(weekId, hash_).cp);
        } else {
            cmp = _getCampaign(weekId, hash_).cp;
            cmp.fundsNative += fundsNative;
            if(operator != cmp.operator) cmp.operator = operator;
            if(token != address(0)){
                bool execute = false;
                if(token == cmp.token){
                    if(fundsERC20 > 0) execute = true;
                } else {
                    if(cmp.fundsERC20 == 0) {
                        cmp.token = token;
                        execute = true;
                    }
                }
                if(execute) {
                    if(IERC20(token).allowance(_msgSender(), address(this)) >= fundsERC20) {
                        if(IERC20(token).transferFrom(_msgSender(), address(this), fundsERC20)){
                            cmp.fundsERC20 += fundsERC20;
                        }
                    }
                }
            }
            cmp.lastUpdated = _now();
            _setCampaign(wi.slot, weekId, cmp);
            emit CampaignUpdated(cmp);
        }
    }

    ///@dev Activates or deactivates campaigns
    function toggleCampaignStatus(string[] memory _campaigns) public returns(bool) {
        for(uint i = 0; i < _campaigns.length; i++) {
            (bytes32 hash_,) = _getCampaignHash(_campaigns[i]);
            Initializer memory _init = initializer[hash_];
            _init.initialized = !_init.initialized;
            initializer[hash_] = _init;
        }
        return true;
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
     * @param slot : Campaign Id
     */
    function _setCampaign(
        uint32 slot,
        uint weekId, 
        Campaign memory campaign
    ) internal  {
        onlyValidCampaignSlot(weekId, slot);
        campaigns[weekId][slot] = campaign;
    }

    /**
     * Update other campaign data
     * @param weekId : Week id
     * @param campaignHash : Campaign Id
     */
    function _getCampaign(uint weekId, bytes32 campaignHash) internal view returns(GetCampaign memory res) {
        res.slot = _getCampaignWeekSlot(weekId, campaignHash);
        onlyValidCampaignSlot(weekId, res.slot);
        res.cp = campaigns[weekId][res.slot];
    }

    /**
     * @dev Returns campaign data
     * @param campaignHash : Campaign hash iD
     */
    function _getCampaignSlot(bytes32 campaignHash) internal view returns(uint id) {
        id = initializer[campaignHash].index; 
    }

    /**
     * @dev Returns campaign data
     * @param campaignHash : Campaign hash iD
     * @param weekId : weekId
     */
    function _getCampaignWeekSlot(uint weekId, bytes32 campaignHash) internal view returns(uint32 id) {
        id = wInit[weekId][campaignHash].slot; 
    }

    /**Return all approved campaigns */
    function _getApprovedCampaigns() internal view returns(Initializer[] memory _inits) {
        uint counter = allCampaigns;
        if(counter == 0) return _inits;
        _inits = new Initializer[](counter);
        for(uint i = 0; i < allCampaigns; i++) {
            _inits[i] = initializer[indexer[i]];
        }
        return _inits;
    }

    /**
     * @dev Transition the week into a new week, aggregate all the campaigns and initialize them for the new week.
     * @param newIntervalInMin : New interval to update
     * @param callback : Callback function to run for each campaign
     */
    function _initializeAllCampaigns(uint32 newIntervalInMin, uint32 newClaimDeadlineInHrs, function(Campaign memory) internal returns(Campaign memory) callback) internal returns(uint pastWeekId, uint newWeekId, Initializer[] memory _inits) {
        State memory st = _getState();
        require(st.transitionDate < _now(), "Transition date in future");
        pastWeekId = st.weekId;
        _inits = _getApprovedCampaigns();
        newWeekId = _transitionToNewWeek();
        _setTransitionInterval(newIntervalInMin, newClaimDeadlineInHrs, pastWeekId);
        for(uint i = 0; i < _inits.length; i++) { 
            Initializer memory init = _inits[i];
            GetCampaign memory res = _getCampaign(st.weekId, init.hash_);
            _tryInitializeCampaign(init.hash_, init.encoded, res.cp.operator, 0, 0, res.cp.token);
            _setCampaign(
                res.slot,
                st.weekId,
                callback(res.cp)
            ); 
        }
    }
}