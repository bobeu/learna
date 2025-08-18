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
    CampaignData[] private campaignList;   

    ///@dev All registered campaign
    mapping(bytes32 => bool) private isRegistered;

    // Campaigns
    // mapping(bytes32 campaignHash => Initializer) private initializer;

    ///@dev Week inititializer
    mapping(uint weekId => mapping(bytes32 => WeekInitializer)) private wInit;

    //week data for all campaigns
    mapping(uint weekId => Campaign[]) private campaigns;


    // Total campaigns
    uint private allCampaigns;

    // Mapping of campaigns to identifiers
    mapping(uint campaignIndex => bytes32 campaingHashValue) private indexer;

    ///@dev Registers a new campaign
    function _checkAndInitializeCampaign(CampaignData memory data) internal {
        if(!isRegistered[data.hash_]){
            isRegistered[data.hash_] = true;
            campaignList.push(data);
        }
    }

    /**
     * @dev Adds a campaign to a new week
     * @param data : Campaign data struct
     * @param weekId : Week Id
     * @param operator : Campaign operator or owner
     * @param fundsNative : Amount to fund in native asset
     * @param fundsERC20 : Amount to fund in erc20 asset
     * @param platformToken : Amount to fund in platform asset
     * @param token : ERC20 token address
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
            campaigns[weekId].push();
            campaigns[weekId][wi.slot].data = CData(platformToken, fundsNative, fundsERC20, 0, _now(), 0, operator, token, data);
            wInit[weekId][data.hash_] = wi;
            cmp = _getCampaign(weekId, data.hash_).cp;
            emit NewCampaign(cmp);
        } else {
            cmp = _getCampaign(weekId, data.hash_).cp;
            unchecked {
                cmp.data.fundsNative += fundsNative;
                cmp.data.platformToken += platformToken;
            }
            if(operator != cmp.data.operator) cmp.data.operator = operator;
            // If token is not zero address, then update the fundsERC20
            // If token is zero address, then fundsERC20 will not be updated

            // If token is same as existing token, then update the fundsERC20
            // If token is different, then update the token address and fundsERC20
            if(fundsERC20 > 0 && token != address(0)) {
                bool execute = false;
                if(token == cmp.data.token){
                    execute = true;
                } else {
                    if(cmp.data.fundsERC20 == 0) {
                        cmp.data.token = token;
                        execute = true;
                    }
                }
                if(execute) {
                    if(IERC20(token).allowance(_msgSender(), address(this)) >= fundsERC20) {
                        if(IERC20(token).transferFrom(_msgSender(), claim, fundsERC20)){
                            unchecked {
                                cmp.data.fundsERC20 += fundsERC20;
                            }
                        }
                    }
                }
            }
            cmp.data.lastUpdated = _now();
            _setCampaign(wi.slot, weekId, cmp.data);
            emit CampaignUpdated(cmp);
        }
    }

    /**
     * @dev Only approved campaign can pass
     * @param hash_ : Campaign Hash : Hash of the campaign string e.g keccack256("Solidity")
     * @param weekId : week id
    */
    function _validateCampaign(bytes32 hash_, uint weekId) internal view {
        require(isRegistered[hash_], "Campaign not registered");
        require(wInit[weekId][hash_].hasSlot, "Campaign not in current week");
    }

    /**
     * @dev Return the hashed result of a campaign string
     * @param campaign : Campaign string
     */
    function _getHash(string memory campaign) internal pure returns(CampaignData memory data) {
        data.encoded = bytes(campaign);
        data.hash_ = keccak256(data.encoded);
    }

    /**
     * @dev Initializeds a new campaign and create an index for it if not exist, Then initialize the campaign for the
     * parsed weekId. If already iniitialized, update the existing campaign in storage.
     * @param data : Campaign data struct
     * @param weekId : Week Id
     * @param operator : Campaign operator or owner
     * @param fundsNative : Amount to fund in native asset
     * @param fundsERC20 : Amount to fund in erc20 asset
     * @param platformToken : Amount to fund in platform asset
     * @param token : ERC20 token address
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
        _checkAndInitializeCampaign(data);
        cmp = _addCampaignToNewWeek(
            data, 
            weekId, 
            operator, 
            fundsNative, 
            fundsERC20, 
            platformToken,
            token
        );
        _validateCampaign(data.hash_, weekId);
    }

    ///@dev Activates or deactivates campaigns
    function toggleCampaignStatus(string[] memory _campaigns) public returns(bool) {
        for(uint i = 0; i < _campaigns.length; i++) {
            bytes32 hash_ = _getHash(_campaigns[i]).hash_;
            bool status = isRegistered[hash_];
            isRegistered[hash_] = !status;
        }
        return true;
    }

    /**
     * Fetches the campaign for the particular week
     * @param weekId : Week id
     * @return data : Campaigns
     */
    function _getCampaings(uint weekId) internal view returns(Campaign[] memory data) {
        data = campaigns[weekId];
    }

    /**
     * Update campaign data in storage
     * @param weekId : Week id
     * @param _campaign : Other data
     * @param slot : Campaign Id
     */
    function _setCampaign(
        uint32 slot,
        uint weekId, 
        CData memory _campaign
    ) internal  {
        campaigns[weekId][slot].data = _campaign;
    }

    /**
     * Update campaign data in storage
     * @param weekId : Week id
     * @param slot : Campaign Id
     * @param user : Target user
     */
    function _updateCampaignUsersList(
        uint32 slot,
        uint weekId, 
        address user
    ) internal  {
        campaigns[weekId][slot].users.push(user);
    }

    /**
     * Update other campaign data
     * @param weekId : Week id
     * @param hash_ : Campaign Id
     * @notice Fetch a campaign only if there is a slot for such campaign for the requested week
     */
    function _getCampaign(uint weekId, bytes32 hash_) internal view returns(GetCampaign memory res) {
        WeekInitializer memory wi = wInit[weekId][hash_];
        res.slot = wi.slot;
        if(wi.hasSlot) {
            res.cp = campaigns[weekId][wi.slot];
        }
    }

    ///@dev Return approved campaigns
    function _getApprovedCampaigns() internal view returns(CampaignData[] memory result) {
        result = campaignList;
    }

    ///@dev Return campaigns for the previous week. This will be used to determine the amount claimables by learners
    function getCampaignsForThePastWeek() external view returns(Campaign[] memory result) {
        uint pastWeek = _getState().weekId;
        if(pastWeek == 0) return result;
        return _getCampaings(pastWeek - 1);
    }

    /**
     * @dev Set up all campaigns for the new week. 
     * @notice it transition into a new week bringing forward the funds from the previous week to the new week.
     * @param newIntervalInMin : New interval to update
     * @param callback : Callback function to run for each campaign
    */
    function _initializeAllCampaigns(uint32 newIntervalInMin, uint _platformToken, function(CData memory, uint) internal returns(CData memory) callback) internal returns(uint pastWeek, uint newWeek, CampaignData[] memory cData) {
        State memory st = _getState();
        require(st.transitionDate < _now(), "Transition is in future");
        pastWeek = st.weekId;
        cData = _getApprovedCampaigns();
        newWeek = _transitionToNewWeek();
        _setTransitionInterval(newIntervalInMin, pastWeek);
        for(uint i = 0; i < cData.length; i++) {
            bytes32 hash_ = cData[i].hash_;
            GetCampaign memory cmp = _getCampaign(pastWeek, hash_);
            _bringForward(pastWeek, newWeek, hash_);
            _setCampaign(cmp.slot, pastWeek, callback(cmp.cp.data, _platformToken)); 
        }
    }

    /**
     * @dev Bring forward the campaign balances from the previous week to a new week
     * @param weekEnded : Current week
     * @param newWeek : New week
     * @param hash_ : Campaign hash
     */
    function _bringForward(uint weekEnded, uint newWeek, bytes32 hash_) internal {
        GetCampaign memory prevWk;
        if(weekEnded > 0){
            uint prevWkId = weekEnded - 1;
            // If the week ended is greater than 0, then we can bring forward the funds
            prevWk = _getCampaign(prevWkId, hash_);
            _tryInitializeCampaign(
                newWeek,
                prevWk.cp.data.data,
                prevWk.cp.data.operator,
                prevWk.cp.data.fundsNative,
                prevWk.cp.data.fundsERC20,
                prevWk.cp.data.platformToken,
                prevWk.cp.data.token
            );
            // Reset the funds for the previous week
            prevWk.cp.data.fundsERC20 = 0;
            prevWk.cp.data.fundsNative = 0;
            prevWk.cp.data.platformToken = 0;
            prevWk.cp.data.lastUpdated = _now();
            _setCampaign(prevWk.slot, prevWkId, prevWk.cp.data);
        } else {
            prevWk = _getCampaign(weekEnded, hash_);
            _tryInitializeCampaign(
                newWeek,
                prevWk.cp.data.data,
                prevWk.cp.data.operator,
                0,
                0,
                0,
                prevWk.cp.data.token
            );
        }
    }
}