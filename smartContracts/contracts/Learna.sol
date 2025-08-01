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

    // Campaign fee receiver
    address private immutable feeTo;

    // Profiles for each campaign in week id
    mapping(uint weekId => mapping(bytes32 hash_ => mapping(address => Profile))) private learners;

    /// @dev All campaigns user subscribed to for all the weeks.
    mapping(uint => mapping(address => bytes32[])) private userCampaigns;

    /// @dev Mapping showing whether users have registred for a campaign for given week or not
    mapping(address => mapping(bytes32 => mapping(uint => bool))) registered;

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
        address _feeTo,
        string[] memory _campaigns
    ) {
        _setMinimumToken(1e16);
        mode = _mode;
        dev = _msgSender();
        require(_feeTo != address(0), "Fee manager is zero");
        feeTo = _feeTo;
        if(mode == Mode.LIVE){
            _setTransitionInterval(transitionInterval, 0, _getState().weekId);
        } 
        for(uint i = 0; i < _admins.length; i++) {
            if(_admins[i] != address(0)) _addAdmin(_admins[i]); 
        } 

        for(uint i = 0; i < _campaigns.length; i++) {
            (bytes32 hash_, bytes memory encoded) = _gethash_(_campaigns[i]);
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
     * @param hash_ : Campaign hash
     * @param user : Target user
     * @return profile : Profile data
    */
    function _getProfile(uint weekId, bytes32 hash_, address user) internal view returns(Profile memory profile) {
        profile = learners[weekId][hash_][user];
    }

    /**
     * Update profile
     * @param weekId : Week id
     * @param hash_ : Campaign hash
     * @param user : Target user
     * @param profile : Profile data
    */
    function _setProfile(uint weekId, bytes32 hash_, address user, ProfileOther memory profile) internal {
        learners[weekId][hash_][user].other = profile;
    }

    /**
     * Forward value to a specific address
     * @param amount : Amount to forward
     * @param to : Address to forward the fee to
     */
    function _sendValue(uint amount, address to) internal {
        if(amount > 0) {
            require(address(this).balance >= amount, "Insufficient bal");
            (bool s,) = to.call{value: amount}('');
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
        _sendValue(msg.value, claim);
        _tryInitializeCampaign(
            _getState().weekId,
            _gethash_(_campaign),
            _msgSender(),
            msg.value,
            fundsErc20,
            0,
            token
        );

        return true;
    }


    /////////////////////////////////////////////////////////////////////////
    //     PUBLIC FUNCTION :  ADJUST THE FUNDS IN A CAMPAING              //
    ////////////////////////////////////////////////////////////////////////
    
    /**
     * @dev Adjust funds in campaigns. Only admin function
     * @param hash_ : Campaign hashes
     * @param erc20Value : ERC20 values.
     * @param nativeValue : Values in native coin e.g CELO
     * @notice The function can increase or decrease the values in a campaign. Just parse desired values.
     *         - Value cannot be adjusted beyond the balances in this contract.
     */
    function adjustCampaignValues(
        bytes32 hash_, 
        uint erc20Value,
        uint nativeValue
    ) public onlyAdmin returns(bool) {
        uint weekId = _getState().weekId;
        _validateCampaign(hash_, weekId, 2);
        GetCampaign memory res = _getCampaign(weekId, hash_);
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
     * @param hash_ : Campaign hash 
     * @param quizResult : Array of quiz result for a campaign
     * @notice Only owner function
    */
    function recordPoints(address user, QuizResultInput memory quizResult, bytes32 hash_) 
        public 
        payable
        onlyAdmin
        whenNotPaused 
        returns(bool) 
    { 
        uint weekId = _getState().weekId;
        _sendValue(msg.value, feeTo);
        require(user != address(0), "Invalid user"); 
        _validateCampaign(hash_, weekId, 2);
        _checkRegistration(weekId, hash_, user);
        GetCampaign memory res = _getCampaign(weekId, hash_);
        Profile memory pf = _getProfile(weekId, hash_, user);
        require(pf.other.totalQuizPerWeek <= 36, 'Storage limit exceeded');
    
        unchecked {
            res.cp.activeLearners += 1;
            pf.other.totalQuizPerWeek += 1;
            res.cp.totalPoints += quizResult.other.score; 
        }
        _setProfile(weekId,  hash_, user, pf.other);
        uint index = learners[weekId][hash_][user].quizResults.length;
        learners[weekId][hash_][user].quizResults.push();
        learners[weekId][hash_][user].quizResults[index].other.id = bytes(quizResult.other.id);
        learners[weekId][hash_][user].quizResults[index].other.quizId = bytes(quizResult.other.quizId);
        learners[weekId][hash_][user].quizResults[index].other.completedAt = bytes(quizResult.other.completedAt);
        learners[weekId][hash_][user].quizResults[index].other.title = bytes(quizResult.other.title);
        learners[weekId][hash_][user].quizResults[index].other.score = quizResult.other.score;
        learners[weekId][hash_][user].quizResults[index].other.totalPoints = quizResult.other.totalPoints;
        learners[weekId][hash_][user].quizResults[index].other.percentage = quizResult.other.percentage;
        learners[weekId][hash_][user].quizResults[index].other.timeSpent = quizResult.other.timeSpent;

        for(uint i = 0; i < quizResult.answers.length; i++){
            AnswerInput memory answer = quizResult.answers[i]; 
            learners[weekId][hash_][user].quizResults[index].answers.push();
            learners[weekId][hash_][user].quizResults[index].answers[i] = Answer(bytes(answer.questionHash), answer.selected, answer.isUserSelected); 
        }
        _setCampaign(res.slot, weekId, res.cp); 

        emit PointRecorded(user, weekId, hash_, quizResult);
        return true;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                       PUBLIC FUNCTIONS                                    //
    ///////////////////////////////////////////////////////////////////////////////////////////////

     /**
     * @dev Allocate weekly earnings
     * @param growTokenContract : Grow Token contract address.
     * @param newIntervalInMin : New transition interval for the new week. The interval is used to determined the claim deadline.
     * @param amountInGrowToken : Amount to allocate in GROW token
     * @notice We first for allowance of owner to this contract. If allowance is zero, we assume allocation should come from
     * the GROW Token. Also, previous week payout will be closed. Learners must withdraw from past week before the current week ends
    */
    function sortWeeklyReward(
        address growTokenContract,
        uint amountInGrowToken, 
        uint32 newIntervalInMin
    ) 
        public 
        whenNotPaused 
        onlyAdmin
        returns(bool) 
    {
        (uint currentWk, uint newWk, bytes32[] memory hashes) = _initializeAllCampaigns(newIntervalInMin, _callback);
        if(amountInGrowToken > 0) {
            require(growTokenContract != address(0), "Tk empty");
            require(IGrowToken(growTokenContract).allocate(amountInGrowToken, address(0)), 'Allocation failed');
        }

        emit Sorted(currentWk, newWk, hashes);  
 
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
        (uiativeBalance, uint256 erc20) = _rebalance(cp.token, cp.fundsNative, cp.fundsERC20);
        cp.fundsNative = native;
        cp.fundsERC20 = erc20;
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
     * Check reward eligibility for the requested week
     * @param user : Target user
     * @param weekId : Requested week Id
     * @param hash_ : Hash of the campaign name
     */
    function _getEligibility(address user, bytes32 hash_, uint weekId) 
        internal 
        view 
        returns(Eligibility memory elg) 
    {
        _validateCampaign(hash_, weekId);
        Campaign memory cp = _getCampaign(weekId, hash_).cp;
        Profile memory pf = _getProfile(weekId, hash_, user);
        uint64 totalScore;
        for(uint i = 0; i < pf.quizResults.length; i++) { 
            unchecked {
                totalScore += pf.quizResults[i].other.score;
            }
        }
        (uint erc20, uint native) = _calculateShare(totalScore, cp);
        bool protocolVerified = mode == Mode.LIVE? _now() <= _getDeadline(weekId) && (cp.fundsNative > 0 || cp.fundsERC20 > 0) : true;
        elg = Eligibility(
            protocolVerified,
            erc20,  
            native, 
            weekId, 
            cp.token, 
            hash_
        );
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
    //                          EXTERNAL FUNCTIONS                                //
    /////////////////////////////////////////////////////////////////////////////////
    
    /**
     * @dev Event run after claim is made in claim contract. it updates the user profile and the campaign
     * @param elgs : All Eligibilities for the requested week
     * @param weekId : Week Id
     * @param sender : User account not msg.sender
     * @notice Users cannot claim for the current week. They can only claim for the week that has ended
    */
    function onClaimed(Eligibility[] memory elgs, uint weekId, address sender) 
        external
        whenNotPaused 
        onlyApproved
        returns(bool) 
    {
        for(uint i = 0; i < elgs.length; i++){
            Eligibility memory elg = elgs[i];
            GetCampaign memory res = _getCampaign(weekId, elg.hash_);
            Profile memory pf = _getProfile(weekId, elg.hash_, sender);
            unchecked {
                if(res.cp.fundsNative > elg.nativeAmount) res.cp.fundsNative -= elg.nativeAmount;
                if(res.cp.fundsERC20 > elg.nativeAmount) res.cp.fundsERC20 -= elg.erc20Amount;
                pf.other.amountClaimedInNative += elg.nativeAmount;
                pf.other.amountClaimedInERC20 += elg.erc20Amount;
            }
            _setProfile(weekId, elg.hash_, sender, pf.other);
            _setCampaign(res.slot, weekId, res.cp);

        }
        emit ClaimedWeeklyReward(sender, weekId, elgs);

        return true;
    }
    
    /////////////////////////////////////////////////////////////////////////////////
    //                          READ-ONLY FUNCTIONS                                //
    /////////////////////////////////////////////////////////////////////////////////

    /**
     * Check Eligibility for all campaigns in the concluded week
     * @param user : User
     * @notice Claim will always be for the concluded week. The position must match and can be extracted directly from 
     * the frontend when reading the user's campaigns. If current weekId is greater than 0, is an indication that a week was concluded.
     * Since users can only claim for a concluded week
     */
    function checkEligibility(address user) 
        external 
        view
        returns(Eligibility[] memory result, uint weekId) 
    {
        weekId = _getState().weekId;
        
        if(weekId > 0) {
            weekId -= 1;
            UserCampaigns memory usc = _getUserhash_es(user, weekId);
            uint sSize = usc.campaigns.length;
            require(sSize > 0, "No participation found for the past week");
            result = new Eligibility[](sSize);
            for(uint i = 0; i < sSize; i++){
                result[i] = _getEligibility(user, usc.campaigns[i], weekId);
            }
        } 
        return (result, weekId);
    } 

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

    /// @dev Fetches all user campaigns for the current week
    /// @param user : target account
    function _getUserhash_es(address user, uint weekId) internal view returns(UserCampaigns memory result) {
        result = UserCampaigns(weekId, userCampaigns[weekId][user]);
    } 

    // Get user's data for the concluded weeks including current week
    function getProfile(address user) public view returns(WeekProfileData[] memory result) {
        // UserCampaigns[] memory hashes = _getUserhash_es(user);
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
                    _getEligibility(user, hash_, wkId),
                    _getProfile(wkId, hash_, user), 
                    hash_
                );
            }
            result[wkId].campaigns = campaigns;
            
        }
        return result;
    }

    function getWeek() external view returns(uint) {
        return _getState().weekId;
    }

}