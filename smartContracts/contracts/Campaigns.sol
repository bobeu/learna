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
    ///@dev 
    bytes32[] private campaignList;   

    ///@dev All registered campaign
    mapping(bytes32 => bool) private isRegistered;

    // Campaigns
    mapping(bytes32 campaignHash => Initializer) private initializer;

    ///@dev Week inititializer
    mapping(uint weekId => mapping(bytes32 => WeekInitializer)) private wInit;

    //week data for all campaigns
    mapping(uint weekId => Campaign[]) private campaigns;


    // Total campaigns
    uint private allCampaigns;

    // Mapping of campaigns to identifiers
    mapping(uint campaignIndex => bytes32 campaingHashValue) private indexer;

    ///@dev Registers a new campaign
    function _checkAndInitializeCampaign(bytes32 hash_) internal {
        if(!isRegistered[hash_]){
            isRegistered[hash_] = true;
            campaignList.push(hash_);
        }
    }

    /**
     * @dev Adds a campaign to a new week
     * @param weekId : Week Id
     * @param hash_ : Campaign Hash
     * @param encoded : Encoded campaign data
     * @param operator : Operator address
    */
    function _addCampaignToNewWeek(
        CampaignData memory data,
        uint weekId,
        address operator,
        uint256 fundsNative,
        uint256 fundsERC20,
        uint256 platformToken,
        address token
    ) internal returns(Campaign memory cmp) {
        WeekInitializer memory wi = wInit[weekId][data.hash_];
        if(!wi.hasSlot){
            wi.hasSlot = true;
            wi.slot = uint32(campaigns[weekId].length);
            campaigns[weekId].push(Campaign(platformToken, fundsNative, fundsERC20, 0, _now(), 0, operator, token, false, data));
            wInit[weekId][data.hash_] = wi;
            cmp = _getCampaign(weekId, data.hash_).cp;
            emit NewCampaign(cmp);
        } else {
            cmp = _getCampaign(weekId, data.hash_).cp;
            unchecked {
                cmp.fundsNative += fundsNative;
                cmp.platformToken += platformToken;
            }
            if(operator != cmp.operator) cmp.operator = operator;
            // If token is not zero address, then update the fundsERC20
            // If token is zero address, then fundsERC20 will not be updated

            // If token is same as existing token, then update the fundsERC20
            // If token is different, then update the token address and fundsERC20
            if(fundsERC20 > 0 && token != address(0)) {
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
                            unchecked {
                                cmp.fundsERC20 += fundsERC20;
                            }
                        }
                    }
                }
            }
            cmp.lastUpdated = _now();
            _setCampaign(wi.slot, weekId, cmp);
            emit CampaignUpdated(cmp);
        }
    }

    /**
     * @dev Only approved campaign can pass
     * @param hash_ : Campaign Hash : Hash of the campaign string e.g keccack256("Solidity")
    */
    function _validateCampaign(bytes32 hash_, uint weekId, uint flag) internal view {
        if(flag == 0) {
            require(isRegistered[hash_], "Campaign not registered");
        } else if(flag == 1) {
            require(wInit[weekId][hash_].hasSlot, "Campaign not in current week");
        } else {
            require(isRegistered[hash_], "Campaign not registered");
            require(wInit[weekId][hash_].hasSlot, "Campaign not in current week");
        }
    }

    // /**
    //  * @dev Only valid campaign id can pass
    //  * @param weekId : Week Id
    //  * @param slot : Campaign slot
    // */
    // function onlyValidCampaignSlot(uint weekId, uint32 slot) internal view {
    //     require(slot < _getTotalCampaignForAGivenWeek(weekId), "Invalid campaign id");
    // }

    // /// Returns the length of users in a campaign for the given week 
    // function _getTotalCampaignForAGivenWeek(uint weekId) internal view returns(uint32 result) {
    //     result = uint32(campaigns[weekId].length);
    // }

    // /**
    //  * @dev Check whether a campaign is initialized or not
    //  * @param campaignHash : Campaign hash
    // */
    // function _isInitialized(bytes32 campaignHash) internal view returns(bool result) {
    //     result = initializer[campaignHash].initialized;
    // }

    /**
     * @dev Return the hashed result of a campaign string
     * @param campaign : Campaign string
     */
    function _getCampaignHash(string memory campaign) internal pure returns(CampaignData memory data) {
        data.encoded = bytes(campaign);
        data.hash_ = keccak256(encoded);
    }

    /**
     * @dev Initializeds a new campaign and create an index for it if not exist, Then initialize the campaign for the
     * parsed weekId. If already iniitialized, update the existing campaign in storage.
     * @param weekId : Week to initialize. Should be the current week.
     * @param hash_ : Bytes32 hashed representation of the campaign
     * @param encoded : Bytes representation of the campaign string
     * @param operator : Campaign manager or creator
     * @param fundsNative : Amount funded in native token
     * @param fundsERC20 : Amount funded in erc20 token
     * @param token : Contract address of the funding token
    */
    function _tryInitializeCampaign(
        uint weekId,
        CampaignData memory data,
        address operator,
        uint256 fundsNative,
        uint256 fundsERC20,
        uint256 platformToken,
        address token
    ) internal returns(Campaign memory cmp) {
        _checkAndInitializeCampaign(data.hash_);
        cmp = _addCampaignToNewWeek(
            data, 
            weekId, 
            operator, 
            fundsNative, 
            fundsERC20, 
            platformToken,
            token
        );
        _validateCampaign(data.hash_, weekId, 2);
        // if(!_isInitialized(hash_)){
        //     uint index = allCampaigns;
        //     allCampaigns = index + 1;
        //     indexer[index] = hash_;
        //     initializer[hash_] = Initializer(true, index, encoded, hash_);
        // } else {
        //     _init = initializer[hash_];
        // }
        // WeekInitializer memory wi = wInit[weekId][hash_];
        // if(!wi.hasSlot){
        //     wi.hasSlot = true;
        //     wi.slot = uint32(campaigns[weekId].length);
        //     campaigns[weekId].push(Campaign(fundsNative, fundsERC20, 0, _now(), 0, operator, token, hash_, false, CampaignData(hash_, encoded)));
        //     wInit[weekId][hash_] = wi;
        //     cmp = _getCampaign(weekId, hash_).cp;
        //     emit NewCampaign(cmp);
        // } else {
        //     cmp = _getCampaign(weekId, hash_).cp;
        //     unchecked {
        //         cmp.fundsNative += fundsNative;
        //     }
        //     if(operator != cmp.operator) cmp.operator = operator;
        //     if(token != address(0)){
        //         bool execute = false;
        //         if(token == cmp.token){
        //             if(fundsERC20 > 0) execute = true;
        //         } else {
        //             if(cmp.fundsERC20 == 0) {
        //                 cmp.token = token;
        //                 execute = true;
        //             }
        //         }
        //         if(execute) {
        //             if(IERC20(token).allowance(_msgSender(), address(this)) >= fundsERC20) {
        //                 if(IERC20(token).transferFrom(_msgSender(), address(this), fundsERC20)){
        //                     unchecked {
        //                         cmp.fundsERC20 += fundsERC20;
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     cmp.lastUpdated = _now();
        //     _setCampaign(wi.slot, weekId, cmp);
            // emit CampaignUpdated(cmp);
        // }
    }

    ///@dev Activates or deactivates campaigns
    function toggleCampaignStatus(string[] memory _campaigns) public returns(bool) {
        for(uint i = 0; i < _campaigns.length; i++) {
            bytes32 hash_ = _getCampaignHash(_campaigns[i]).hash_;
            bool status = isRegistered[hash_];
            isRegistered[hash_] = !status;
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
        // onlyValidCampaignSlot(weekId, slot);
        campaigns[weekId][slot] = campaign;
    }

    /**
     * Update other campaign data
     * @param weekId : Week id
     * @param hash_ : Campaign Id
     */
    function _getCampaign(uint weekId, bytes32 hash_) internal view returns(GetCampaign memory res) {
        res.slot = wInit[weekId][hash_].slot;
        res.cp = campaigns[weekId][res.slot];
    }

    // /**
    //  * @dev Returns campaign data
    //  * @param hash_ : Campaign hash iD
    //  */
    // function _getCampaignSlot(bytes32 hash_) internal view returns(uint id) {
    //     id = initializer[hash_].index; 
    // }

    // /**
    //  * @dev Returns campaign data
    //  * @param hash_ : Campaign hash iD
    //  * @param weekId : weekId
    //  */
    // function _getCampaignWeekSlot(uint weekId, bytes32 hash_) internal view returns(uint32 id) {
    //     id = wInit[weekId][hash_].slot; 
    // }

    /**Return all approved campaigns */
    function _getApprovedCampaigns() internal view returns(bytes[] memory result) {
        result = campaignList;
    }

    /**
     * @dev Transition the week into a new week, aggregate all the campaigns and initialize them for the new week.
     * @param newIntervalInMin : New interval to update
     * @param callback : Callback function to run for each campaign
     */
    function _initializeAllCampaigns(uint32 newIntervalInMin, function(Campaign memory) internal returns(Campaign memory) callback) internal returns(uint pastWeekId, uint newWeekId, bytes32[] memory hashes) {
        State memory st = _getState();
        require(st.transitionDate < _now(), "Transition date in future");
        pastWeek = st.weekId;
        hashes = _getApprovedCampaigns();
        newWeek = _transitionToNewWeek();
        _setTransitionInterval(newIntervalInMin, pastWeek);
        for(uint i = 0; i < _inits.length; i++) { 
            bytes32 hash_ = _hashes[i];
            GetCampaign memory getC = _getCampaign(pastWeek, hash_);
            _bringForward(pastWeek, newWeek, hash_);
            _setCampaign(res.slot, pastWeek, callback(getC.cp)); 
        }
    }

    /**
     * @dev Bring forward the campaign balances from the previous week to a new week
     * @param currentWeek : Current week
     * @param newWeek : New week
     * @param hash_ : Campaign hash
     */
    function _bringForward(uint currentWeek, uint newWeek, bytes32 hash_) internal {
        if(currentWeek > 0){
            Campaign memory prevWk = _getCampaign(currentWeek - 1, hash_);
            _tryInitializeCampaign(
                newWeek,
                prevWk.cp.data,
                prevWk.cp.operator,
                prevWk.cp.fundsNative,
                prevWk.cp.fundsERC20,
                prevWk.cp.platformToken,
                prevWk.cp.token
            );
        } else {
            _tryInitializeCampaign(
                newWeek,
                prevWk.cp.data,
                prevWk.cp.operator,
                0,
                0,
                0,
                prevWk.cp.token
            );
        }
    }
}