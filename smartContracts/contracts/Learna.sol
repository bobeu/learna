// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IGrowToken } from "./interfaces/IGrowToken.sol";
import { Utils } from "./libraries/Utils.sol";
import { Campaigns, IERC20 } from "./Campaigns.sol";

contract Learna is Campaigns, ReentrancyGuard {
    using Utils for uint96;

    Mode private mode;

    // Dev Address
    address private dev;

    address public claim;

    // Campaign fee manager
    address private immutable feeManager;

    // Profiles for each campaign in week id
    mapping(uint weekId => mapping(bytes32 campaignHash => mapping(address => Profile))) private learners;

    /// @dev All campaigns user subscribed to for all the weeks.
    mapping(uint => mapping(address => bytes32[])) private userCampaigns;

    /// @dev Mapping showing whether users have registred for a campaign for given week or not
    mapping(address => mapping(bytes32 => mapping(uint => bool))) registered;

    /**
     * @dev Mapping of weekId to campaign to user profile
     * @notice An user can have previous claims
    */

   modifier validateUser(address target, uint weekId, bytes32 hash_) {
        require(!learners[weekId][hash_][target].other.blacklisted, "Blacklisted");
        _;
   }    

    modifier validateAddress(address target) {
        require(target != address(0), "Token is zero");
        _;
    }

    /**
     * @dev Constructor
     * @param _admins : Addresses to be added as admin
     * @param transitionInterval : Interval in time with which a week can be sorted. Ex. If its 7 days, this mean an admin
     *                              cannot perform the sort function until its 7 days from the last sorted time. 
     * @param _mode : Deployment mode - LOCAL or LIVE
     * @notice We instanitate the admins array with an empty content. This is to ensure that anyone with slot 0 will always be
     * false otherwise anyone with 0 slot will automatically inherits the attributes of an admin in slot 0. If such as admin is active,
     * anyone could perform an admin role.
     */
    constructor(
        address[] memory _admins, 
        uint32 transitionInterval, 
        Mode _mode, 
        address _feeManager,
        string[] memory _campaigns
    ) {
        _setMinimumToken(1e16);
        mode = _mode;
        dev = _msgSender();
        require(_feeManager != address(0), "Fee manager is zero");
        feeManager = _feeManager;
        if(mode == Mode.LIVE){
            _setTransitionInterval(transitionInterval, 0, _getState().weekId);
        } 
        for(uint i = 0; i < _admins.length; i++) {
            if(_admins[i] != address(0)) _addAdmin(_admins[i]); 
        } 

        for(uint i = 0; i < _campaigns.length; i++) {
            (bytes32 hash_, bytes memory encoded) = _getCampaignHash(_campaigns[i]);
            _tryInitializeCampaign(hash_, encoded, _msgSender(), 0, 0, address(0));
        }
    }

    receive() external payable {}

    /**
     * @dev Set approval for target
     * @param newClaim : Account to set approval for
     */
    function setClaimAddress(address newClaim) public onlyOwner returns(bool) {
        claim = newClaim;
        return true;
    }

    /**
     * Fetch profile
     * @param weekId : Week id
     * @param campaignHash : Campaign hash
     * @param user : Target user
     * @return profile : Profile data
    */
    function _getProfile(uint weekId, bytes32 campaignHash, address user) internal view returns(Profile memory profile) {
        profile = learners[weekId][campaignHash][user];
    }

    /**
     * Update profile
     * @param weekId : Week id
     * @param campaignHash : Campaign hash
     * @param user : Target user
     * @param profile : Profile data
    */
    function _setProfile(uint weekId, bytes32 campaignHash, address user, ProfileOther memory profile) internal {
        learners[weekId][campaignHash][user].other = profile;
    }

    // Send collected fee to reciever
    function _forwardFee(uint amount) internal {
        if(amount > 0) {
            (bool s,) = feeManager.call{value: amount}('');
            require(s, "Failed");
        }
    }

    ///////////////////////////////////////////////////////////
    //     PUBLIC FUNCTION : SET UP A CAMPAIGN               //
    ///////////////////////////////////////////////////////////
    /**
     * @dev Add new campaign to the current week and fund it. Also, can be used to increase the funds in existing campaign for the week.
     * @param _campaign : Campaign string
     * @param token : ERC20 contract address if fundsErc20 is greater than 0
     * @param fundsErc20 : Amount to fund the campaign in ERC20 currency e.g $GROW, $G. etc
     * @notice Anyone can setUp or add campaign provided they have enough to fund it. Campaign can be funded in two ways:
     * - ERC20. If the amount in fundsErc20 is greater than 0, it is suppose that the sender intends to also fund the campaign
     *    in ERC20-based asset hence the 'token' parameter must not be zero.
     * - Native such as CELO.
     */
    function setUpCampaign(
        string memory _campaign, 
        uint256 fundsErc20,
        address token
    ) public payable returns(bool) {
        (bytes32 hash_, bytes memory encoded) = _getCampaignHash(_campaign);
        _tryInitializeCampaign(
            hash_,
            encoded,
            _msgSender(),
            msg.value,
            fundsErc20,
            token
        );

        return true;
    }


    /////////////////////////////////////////////////////////////////////////
    //     PUBLIC FUNCTION :  ADJUST THE FUNDS IN A CAMPAING              //
    ////////////////////////////////////////////////////////////////////////
    
    /**
     * @dev Adjust funds in campaigns. Only admin function
     * @param campaignHash : Campaign hashes
     * @param erc20Value : ERC20 values.
     * @param nativeValue : Values in native coin e.g CELO
     * @notice The function can increase or decrease the values in a campaign. Just parse desired values.
     *         - Value cannot be adjusted beyond the balances in this contract.
     */
    function adjustCampaignValues(
        bytes32 campaignHash, 
        uint erc20Value,
        uint nativeValue
    ) public onlyAdmin returns(bool) {
        uint weekId = _getState().weekId;
        _validateCampaign(campaignHash, weekId);
        GetCampaign memory res = _getCampaign(weekId, campaignHash);
        require(res.cp.token != address(0), "Token is empty");
        require(IERC20(res.cp.token).balanceOf(address(this)) >= erc20Value, "ERC20Bal inconsistent");
        require(address(this).balance >= nativeValue, "New value exceeds balance");
        res.cp.fundsERC20 = erc20Value;
        res.cp.fundsNative = nativeValue;
        res.cp.lastUpdated = _now();
        _setCampaign(res.slot, weekId, res.cp);

        return true;
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    //    PUBLIC FUNCTION : KEEP TRACK OF POINTS EARNED FROM PARTICIPATING IN QUIZZES     //
    ////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev Register users for weekly reward
     * @param user : User 
     * @param campaignHash : Campaign hash 
     * @param quizResult : Array of quiz result for a campaign
     * @notice Only owner function
    */
    function recordPoints(address user, QuizResultInput memory quizResult, bytes32 campaignHash) 
        public 
        payable
        onlyAdmin
        whenNotPaused 
        validateUser(user, _getState().weekId, campaignHash)
        returns(bool) 
    { 
        uint weekId = _getState().weekId;
        _forwardFee(msg.value);
        require(user != address(0), "Invalid user");
        _validateCampaign(campaignHash, weekId);
        _checkRegistration(weekId, campaignHash, user);
        GetCampaign memory res = _getCampaign(weekId, campaignHash);
        Profile memory pf = _getProfile(weekId, campaignHash, user);
        if(pf.other.blacklisted) revert UserBlacklisted();
        require(pf.other.totalQuizPerWeek <= 36, 'Storage limit exceeded');
    
        unchecked {
            res.cp.activeLearners += 1;
            pf.other.totalQuizPerWeek += 1;
            res.cp.totalPoints += quizResult.other.score; 
        }
        _setProfile(weekId,  campaignHash, user, pf.other);
        uint index = learners[weekId][campaignHash][user].quizResults.length;
        learners[weekId][campaignHash][user].quizResults.push();
        learners[weekId][campaignHash][user].quizResults[index].other.id = bytes(quizResult.other.id);
        learners[weekId][campaignHash][user].quizResults[index].other.quizId = bytes(quizResult.other.quizId);
        learners[weekId][campaignHash][user].quizResults[index].other.completedAt = bytes(quizResult.other.completedAt);
        learners[weekId][campaignHash][user].quizResults[index].other.title = bytes(quizResult.other.title);
        learners[weekId][campaignHash][user].quizResults[index].other.score = quizResult.other.score;
        learners[weekId][campaignHash][user].quizResults[index].other.totalPoints = quizResult.other.totalPoints;
        learners[weekId][campaignHash][user].quizResults[index].other.percentage = quizResult.other.percentage;
        learners[weekId][campaignHash][user].quizResults[index].other.timeSpent = quizResult.other.timeSpent;

        for(uint i = 0; i < quizResult.answers.length; i++){
            AnswerInput memory answer = quizResult.answers[i]; 
            learners[weekId][campaignHash][user].quizResults[index].answers.push();
            learners[weekId][campaignHash][user].quizResults[index].answers[i] = Answer(bytes(answer.questionHash), answer.selected, answer.isUserSelected); 
        }
        _setCampaign(res.slot, weekId, res.cp); 

        emit PointRecorded(user, weekId, campaignHash, quizResult);
        return true;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                       PUBLIC FUNCTIONS                                    //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev Remove users from the list of campaigns in the current week
     * @param _users : List of users 
     * @notice Only owner function
    */
    function banOrUnbanUser(
        address[] memory _users, 
        bytes32[] memory campaignHashes
    ) 
        public 
        onlyAdmin
        whenNotPaused 
        returns(bool) 
    {
        uint weekId = _getState().weekId;
        bool status;
        for(uint i = 0; i < _users.length; i++) {
            address user = _users[i];
            if(user != address(0)) {
                for(uint j=0; j<campaignHashes.length; j++){
                    bytes32 campaignHash = campaignHashes[j];
                    _validateCampaign(campaignHash, weekId);
                    Profile memory pf = _getProfile(weekId, campaignHash, user);
                    pf.other.blacklisted = !pf.other.blacklisted;
                    if(i == 0) status = pf.other.blacklisted;
                    _setProfile(weekId, campaignHash, user, pf.other);
                }
            }
        }
        emit UserStatusChanged(_users, weekId, campaignHashes, status);
        return true;
    } 

     /**
     * @dev Allocate weekly earnings
     * @param growTokenContract : Grow Token contract address.
     * @param amountInGrowToken : Amount to allocate in GROW token
     * @notice We first for allowance of owner to this contract. If allowance is zero, we assume allocation should come from
     * the GROW Token. Also, previous week payout will be closed. Learners must withdraw from past week before the current week ends
    */
    function sortWeeklyReward(
        address growTokenContract,
        uint amountInGrowToken, 
        uint32 claimDeadlineInMin,
        uint32 newIntervalInMin
    ) 
        public 
        whenNotPaused 
        onlyAdmin
        returns(bool) 
    {
        (uint pastWeekId, uint newWeekId, Initializer[] memory _campaigns) = _initializeAllCampaigns(newIntervalInMin, claimDeadlineInMin, _callback);
        if(address(this).balance > 0) {
            require(claim != address(0), "Claim not set");
            (bool done,) = claim.call{value: address(this).balance}('');
            require(done, 'Tf Failed');
        }
        if(amountInGrowToken > 0) {
            require(growTokenContract != address(0), "Tk empty");
            require(IGrowToken(growTokenContract).allocate(amountInGrowToken, address(0)), 'Allocation failed');
        }

        emit Sorted(pastWeekId, newWeekId, _campaigns);  
 
        return true;
    }

    /**
     * @dev Triggers stopped state.
    */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Returns to normal state.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    ///////////////////////////////////
    //        INTERNAL FUNCTIONS     //
    ///////////////////////////////////

    function _checkRegistration(uint weekId, bytes32 hash_, address user) internal {
        if(!registered[user][hash_][weekId]){
            registered[user][hash_][weekId] = true;
            userCampaigns[weekId][user].push(hash_);
        }
    }

    function _callback(Campaign memory _cp) internal returns(Campaign memory cp) {
        cp = _cp;
        (uint256 nativeBalance, uint256 erc20Balance) = _rebalance(cp.token, cp.fundsNative, cp.fundsERC20);
        if(cp.token != address(0)){
            uint balLeft = IERC20(cp.token).balanceOf(address(this));
            if(balLeft > 0) {
                IERC20(cp.token).transfer(claim, balLeft);   
            }
        }
        cp.canClaim = true;
        cp.fundsNative = nativeBalance;
        cp.fundsERC20 = erc20Balance;
    }
    
    /**
     * @dev Calculates user's share of the weekly payout
     * @param userPoints : Total points accumulated by the user
     * @param cp : Campaign 
     */
    function _calculateShare( 
        uint64 userPoints, 
        Campaign memory cp
    ) internal view returns(uint erc20Amount, uint nativeClaim) {
        uint8 erc20Decimals;
        assert(cp.totalPoints >= userPoints);
        if(cp.totalPoints > 0 && cp.token != address(0)) { 
            erc20Decimals = IERC20Metadata(cp.token).decimals(); 
            unchecked {
                if(cp.fundsERC20 > 0) erc20Amount = cp.totalPoints.calculateShare(userPoints, cp.fundsERC20, erc20Decimals);
                if(cp.fundsNative > 0) nativeClaim = cp.totalPoints.calculateShare(userPoints, cp.fundsNative, 18);
            }
        }
    }

    /**
     * Check reward eligibility for the concluded week
     * @param user : Target user
     * @param campaignHash : Hash of the campaign name
     */
    function _getEligibility(address user, bytes32 campaignHash) 
        internal 
        view 
        returns(Eligibility memory elg) 
    {
        State memory st = _getState();
        uint weekId = st.weekId;
        if(weekId > 0) {
            weekId --;
            _validateCampaign(campaignHash, weekId);
            Campaign memory cp = _getCampaign(weekId, campaignHash).cp;
            Profile memory pf = _getProfile(weekId, campaignHash, user);
            uint64 totalScore;
            for(uint i = 0; i < pf.quizResults.length; i++) { 
                unchecked {
                    totalScore += pf.quizResults[i].other.score;
                }
            }
            (uint erc20, uint native) = _calculateShare(totalScore, cp);
            bool canClaim = mode == Mode.LIVE? _now() <= _getDeadline(weekId) && !pf.other.claimed && !pf.other.blacklisted && (cp.fundsNative > 0 || cp.fundsERC20 > 0) && (erc20 > 0 && native > 0) : true;
            if(canClaim){
                elg = Eligibility(
                    canClaim,
                    erc20,  
                    native, 
                    weekId, 
                    cp.token, 
                    campaignHash, 
                    false, 
                    false
                );
            }
        }
    }

    /**
     * @dev Assign 2% of payouts to the dev
     * @param token : ERC20 token to be used for payout
     * @return nativeBalance : Celo balance of this contract after dev share 
     * @return erc20Balance : ERC20 balance of this contract after dev share
     */
    function _rebalance(address token, uint256 native, uint256 erc20) internal returns(uint256 nativeBalance, uint256 erc20Balance) {
        uint8 devRate = 2;
        nativeBalance = native;
        erc20Balance = erc20;
        uint devShare;
        unchecked {
            if(nativeBalance > 0 && (address(this).balance >= nativeBalance)) {
                devShare = (nativeBalance * devRate) / 100;
                (bool done,) = dev.call{value: devShare}('');
                require(done, 'T.Failed');
                nativeBalance -= devShare;
            }
            if(erc20Balance > 0 && (IERC20(token).balanceOf(address(this)) >= erc20Balance)) {
                devShare = (erc20Balance * devRate) / 100;
                if(token != address(0)){
                    require(IERC20(token).transfer(dev, devShare), 'ERC20 TFailed');
                }
                erc20Balance -= devShare; 
            }
        }
    }
    
    /////////////////////////////////////////////////////////////////////////////////
    //                          EXTERNAL VIEW FUNCTIONS                            //
    /////////////////////////////////////////////////////////////////////////////////

    /**
     * Check Eligibility for all campaigns in the concluded week
     * @param user : User
     * @notice Claim will always be for the concluded week. The position must match and can be extracted directly from 
     * the frontend when reading the user's campaigns
     */
    function checkEligibility(address user) 
        external 
        view
        returns(Eligibility[] memory result, uint weekId) 
    {
        weekId = _getState().weekId;
        
        if(weekId > 0) {
            weekId -= 1;
            UserCampaigns[] memory campaigns_ = _getUserCampaignHashes(user);
            UserCampaigns memory usc = campaigns_[weekId];
            uint sSize = usc.campaigns.length;
            if(sSize > 0) {
                result = new Eligibility[](sSize);
                for(uint i = 0; i < sSize; i++){
                    result[i] = _getEligibility(user, usc.campaigns[i]);
                }
            }
        } 
        return (result, weekId);
    } 
    
    /////////////////////////////////////////////////////////////////////////////////
    //                          EXTERNAL FUNCTIONS                                 //
    /////////////////////////////////////////////////////////////////////////////////
 
    // /**
    //  * @dev claim reward
    //  * @param elg : Eligibility object
    //  * @param sender : User account not msg.sender
    //  * @notice Users cannot claim for the current week. They can only claim for the week that has ended
    // */
    // function onClaimed(Eligibility memory elg, address sender) 
    //     external
    //     whenNotPaused 
    //     onlyApproved
    //     validateUser(sender, elg.weekId, elg.campaignHash)
    //     returns(bool) 
    // {
    //    GetCampaign memory res = _getCampaign(elg.weekId, elg.campaignHash);
    //     Profile memory pf = _getProfile(elg.weekId, elg.campaignHash, sender);
    //     pf.other.claimed = true;
    //     unchecked {
    //         if(res.cp.fundsNative > elg.nativeAmount) res.cp.fundsNative -= elg.nativeAmount;
    //         if(res.cp.fundsERC20 > elg.nativeAmount) res.cp.fundsERC20 -= elg.erc20Amount;
    //         pf.other.amountClaimedInNative += elg.nativeAmount;
    //         pf.other.amountClaimedInERC20 += elg.erc20Amount;
    //     }
    //     _setProfile(elg.weekId, elg.campaignHash, sender, pf.other);
    //     _setCampaign(res.slot, elg.weekId, res.cp);
 
    //     emit ClaimedWeeklyReward(sender, pf, res.cp);
    //     return true;
    // }

    /////////////////////////////////////////////////////////////////////////////////
    //                          READ-ONLY FUNCTIONS                                //
    /////////////////////////////////////////////////////////////////////////////////

    // Fetch past claims
    function getData() public view returns(ReadData memory data) {
        data.state = _getState();
        data.approved = _getApprovedCampaigns();
        uint weekIds = data.state.weekId;
        weekIds ++;
        data.wd = new WeekData[](weekIds);
        for(uint i = 0; i < weekIds; i++) {
            data.wd[i].campaigns = _getCampaings(i);
            data.wd[i].claimDeadline = _getDeadline(i);
        }

        return data;
    } 

    /// @dev Fetches all user campaigns for the weeks up to current week
    /// @param user : target account
    function _getUserCampaignHashes(address user) internal view returns(UserCampaigns[] memory hashes) {
        uint weekIds = _getState().weekId + 1;
        hashes = new UserCampaigns[](weekIds);
        for(uint i = 0; i < weekIds; i++){
            hashes[i] = UserCampaigns(i, userCampaigns[i][user]);
        }
    } 

    // /**
    //  * @dev Return all campaigns the user has participated in for the previous week.
    //  * If the week has transitioned, otherwise it returns empty array
    //  * @param user : Target user
    //  */
    // function getUserCampaigns(address user) external view returns(bytes32[] memory result) {
    //     uint weekId = _getState().weekId;
    //     if(weekId > 0){
    //         weekId -= 1;
    //         UserCampaigns[] memory usc = _getUserCampaignHashes(user);
    //         result = usc[weekId].campaigns;
    //     }
    //     return result;
    // }

    // Get user's data for the concluded weeks including current week
    function getProfile(address user) public view returns(WeekProfileData[] memory result) {
        // UserCampaigns[] memory hashes = _getUserCampaignHashes(user);
        uint weekIds = _getState().weekId;
        weekIds += 1;
        result = new WeekProfileData[](weekIds); 
        
        for(uint wkId = 0; wkId < weekIds; wkId++) {
            result[wkId].weekId = wkId;
            bytes32[] memory hashes = userCampaigns[wkId][user];
            uint hashSize = hashes.length; 
            ReadProfile[] memory campaigns = new ReadProfile[](hashSize);
            for(uint hashId = 0; hashId < hashSize; hashId++) { 
                bytes32 hash_ = hashes[hashId];
                campaigns[hashId] = ReadProfile( 
                    _getEligibility(user, hash_),
                    _getProfile(wkId, hash_, user), 
                    hash_
                );
                // if(hashSize > 0) {
                // }
            }
            result[wkId].campaigns = campaigns;
            
        }
        return result;
    }

    function getWeek() external view returns(uint) {
        return _getState().weekId;
    }

}