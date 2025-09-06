// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { WeekV2 } from "./WeekV2.sol";
import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Campaigns. 
 * @author : Bobeu - https://github.com/bobeu
 * @notice Non-deployable parent contract that perform CRUD operation on campaigns
*/ 
abstract contract CampaignsV2 is WeekV2 {
    using SafeERC20 for IERC20;

    ///@dev 
    CampaignData[] private campaignList;   
    
    // Dev Address
    address internal dev;

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

    constructor(address _dev) {
        require(_dev != address(0), "Dev is zero");
        dev = _dev;
    }

    /**
     * @dev Claim ero20 token
     * @param recipient : Recipient
     * @param amount : Amount to transfer
     * @param token : token contract
     */
    function _sendErc20(address recipient, uint amount, IERC20 token) internal {
        if(address(token) != address(0)) {
            uint balance = token.balanceOf(address(this));
            if(balance > 0 && balance >= amount) {
                token.safeTransfer(recipient, amount);
            }
        }
    }

    ///@dev Registers a new campaign
    function _initializeCampaign(
        CampaignData memory data, 
        uint weekId,
        address operator,
        uint256 fundsNative,
        uint256 fundsERC20,
        uint256 platformToken,
        address token
    ) internal {
        if(!isRegistered[data.hash_]){
            isRegistered[data.hash_] = true;
            campaignList.push(data);
        }
        WeekInitializer memory wi = wInit[weekId][data.hash_];
        if(!wi.hasSlot) {
            wi.hasSlot = true;
            wi.slot = campaigns[weekId].length;
            campaigns[weekId].push();
            wInit[weekId][data.hash_] = wi;
            campaigns[weekId][wi.slot].data = CData(platformToken, fundsNative, fundsERC20, 0, _now(), 0, operator, token, data);
        }
    }

    /**
     * @dev Adds a campaign to a new week
     * @param data : Campaign data struct
     * @param fundsNative : Amount to fund in native asset
     * @param token : ERC20 token address
    */
    function _setUpCampaign(
        CampaignData memory data,
        uint fundsNative,
        address token
    ) internal {
        uint weekId = _getState().weekId;
        _initializeCampaign(data, weekId, _msgSender(), fundsNative, 0, 0, token);
        Campaign memory cmp = _getCampaign(weekId, data.hash_).cp;
        uint allowance = 0;
        if(token != address(0)) {
            allowance = IERC20(token).allowance(_msgSender(), address(this));
            cmp.data.token = token;
        }
        cmp.data.operator = _msgSender();
        unchecked {
            cmp.data.fundsNative += fundsNative;
            if(allowance > 0) {
                require(IERC20(token).transferFrom(_msgSender(), address(this), allowance), "Allowance transfer failed");
                cmp.data.fundsERC20 += allowance;
            } 
        }
        cmp.data.lastUpdated = _now();
        _setCampaign(wInit[weekId][data.hash_].slot, weekId, cmp.data);
    }

    /**
     * @dev Only approved campaign can pass
     * @param hash_ : Campaign Hash : Hash of the campaign string e.g keccack256("Solidity")
     * @param weekId : week id
    */
    function _validateCampaign(bytes32 hash_, uint weekId) internal view {
        require(_isValidCampaign(hash_, weekId), "Invalid campaign");
    }

    function _isValidCampaign(bytes32 hash_, uint weekId) internal view returns(bool isValid) {
        isValid = isRegistered[hash_] && wInit[weekId][hash_].hasSlot;
    }

    /**
     * @dev Return the hashed result of a campaign string
     * @param campaign : Campaign string
     */
    function _getHash(string memory campaign) internal pure returns(CampaignData memory data) {
        data.encoded = bytes(campaign);
        data.hash_ = keccak256(data.encoded);
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
        uint slot,
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
        uint slot,
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
        _validateCampaign(hash_, weekId);
        WeekInitializer memory wi = wInit[weekId][hash_];
        res.slot = wi.slot;
        res.cp = campaigns[weekId][wi.slot];
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
     * Forward value to a specific address
     * @param amount : Amount to forward
     * @param to : Address to forward the fee to
     */
    function _sendValue(uint amount, address to) internal {
        if(amount > 0) {
            if(address(this).balance >= amount){
                if(to != address(0)){
                    payable(to).transfer(amount);
                    // (bool s,) = to.call{value: amount}('');
                    // require(s, "Failed");
                }
            }
        }
    }

    // function _callback(CData memory inCmp, uint platformToken) internal returns(CData memory outCmp) {
    //     outCmp = inCmp;
    //     (uint native, uint256 erc20, uint platform) = _rebalance(
    //         outCmp.token, 
    //         outCmp.fundsNative, 
    //         outCmp.fundsERC20, 
    //         platformToken
    //     );
    //     outCmp.fundsNative = native;
    //     outCmp.platformToken = platform;
    //     outCmp.fundsERC20 = erc20;
    //     outCmp.lastUpdated = _now();
    // }

    // /**
    //  * @dev Assign 2% of payouts to the dev
    //  * @param _token : ERC20 token to be used for payout
    //  * @param platformIn : Platform token to be used for payout
    //  * @param erc20In : ERC20 token to be used for payout
    //  * @param nativeIn : Native token to be used for payout
    //  * @return nOut : Celo balance of this contract after dev share
    //  * @return eOut : ERC20 balance of this contract after dev share
    //  * @return pOut : Platform balance of this contract after dev share
    //  */
    // function _rebalance(address _token, uint256 nativeIn, uint256 erc20In, uint256 platformIn) internal returns(uint256 nOut, uint256 eOut, uint256 pOut) {
    //     uint8 devRate = 2;
    //     nOut = nativeIn;
    //     eOut = erc20In;
    //     pOut = platformIn;
    //     uint devShare;
    //     unchecked {
    //         if(nOut > 0 && (address(this).balance >= nOut)) {
    //             devShare = (nOut * devRate) / 100;
    //             _sendValue(devShare, dev);
    //             nOut -= devShare;
    //         }
    //         if(eOut > 0 && (IERC20(_token).balanceOf(address(this)) >= eOut)) {
    //             devShare = (eOut * devRate) / 100;
    //             _sendErc20(dev, devShare, IERC20(_token));
    //             eOut -= devShare; 
    //         }
    //         if(pOut > 0 && (token.balanceOf(address(this)) >= pOut)) {
    //             devShare = (pOut * devRate) / 100;
    //             _sendErc20(dev, devShare, token);
    //             pOut -= devShare; 
    //         }
    //     }
    // }

    /**
     * @dev Set up all campaigns for the new week. 
     * @notice it transition into a new week bringing forward the funds from the previous week to the new week.
     * @param platformTkPerCmp : Amount to fund in platform token per each campaign
    */
    function _initializeAllCampaigns(uint platformTkPerCmp) internal {
        State memory st = _getState();
        // require(_now() >= st.transitionDate, "Transition is in future");
        uint pastWeek = st.weekId;
        _transitionToNewWeek();
        CampaignData[] memory campaignData = _getApprovedCampaigns();
        uint totalAllocation = 0;
        _setTransitionInterval();
        for(uint i = 0; i < campaignData.length; i++) {
            bytes32 hash_ = campaignData[i].hash_;
            GetCampaign memory cmp = _getCampaign(pastWeek, hash_);
            unchecked {
                if(cmp.cp.data.activeLearners > 0) {
                    totalAllocation += platformTkPerCmp;
                    cmp.cp.data.platformToken += platformTkPerCmp;
                }
            }
            _setCampaign(cmp.slot, pastWeek, cmp.cp.data); 
            _setUpCampaign(campaignData[i], 0, cmp.cp.data.token);
        }
        if(totalAllocation > 0) {
            require(address(token) != address(0), "Tk empty");
            token.allocate(totalAllocation, address(this));
        }
    }

    // /**
    //  * @dev Bring forward the campaign balances from the previous week to a new week
    //  * @param weekEnded : Current week
    //  * @param newWeek : New week
    //  * @param hash_ : Campaign hash
    //  */
    // function _bringForward(uint weekEnded, uint newWeek, bytes32 hash_) internal {
    //     GetCampaign memory prevWk;
    //     unchecked {
    //         if(weekEnded > 0){
    //             uint prevWkId = weekEnded - 1;
    //             prevWk = _getCampaign(prevWkId, hash_);
    //             _initializeCampaign(
    //                 prevWk.cp.data.data, 
    //                 newWeek,
    //                 prevWk.cp.data.operator,
    //                 prevWk.cp.data.fundsNative,
    //                 prevWk.cp.data.fundsERC20,
    //                 prevWk.cp.data.platformToken,
    //                 prevWk.cp.data.token
    //             );
    //             prevWk.cp.data.fundsERC20 = 0;
    //             prevWk.cp.data.fundsNative = 0;
    //             prevWk.cp.data.platformToken = 0;
    //             prevWk.cp.data.lastUpdated = _now();
    //             _setCampaign(prevWk.slot, prevWkId, prevWk.cp.data);
    //         } else {
    //             prevWk = _getCampaign(weekEnded, hash_);
    //             _initializeCampaign(
    //                 prevWk.cp.data.data, 
    //                 newWeek,
    //                 prevWk.cp.data.operator,
    //                 0,
    //                 0,
    //                 0,
    //                 prevWk.cp.data.token
    //             );
    //         }
    //     }
    // }
}