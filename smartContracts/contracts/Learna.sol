// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IKnowToken } from "./interfaces/IKnowToken.sol";
import { Utils } from "./libraries/Utils.sol";
import { Campaigns, IERC20 } from "./Campaigns.sol";

contract Learna is Campaigns, ReentrancyGuard {
    using Utils for uint96;

    Mode private mode;

    ///@notice Flag that controls whether to use key mechanism for learners or not
    bool public useKey;

    // Dev Address
    address private dev;

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
            _setTransitionInterval(transitionInterval, _getState().weekId);
            useKey = false;
        } else {
            useKey = true;
        }
        for(uint i = 0; i < _admins.length; i++) {
            if(_admins[i] != address(0)) _addAdmin(_admins[i]); 
        } 

        for(uint i = 0; i < _campaigns.length; i++) {
            _tryInitializeCampaign(_getState().weekId, _getHash(_campaigns[i]), _msgSender(), 0, 0, 0, address(0));
        }
    }

    receive() external payable {}

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
     * Toggle useKey status. 
     @notice Toggling the function will continously alter the state of the useKey variable by negating the current status 
    */
    function toggleUseKey() public onlyOwner returns(bool) {
        bool status = useKey;
        useKey = !status;
        return true;
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
            _getHash(_campaign),
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
        _validateCampaign(hash_, weekId);
        GetCampaign memory res = _getCampaign(weekId, hash_);
        require(res.cp.data.token != address(0), "Token is empty");
        require(IERC20(res.cp.data.token).balanceOf(claim) >= erc20Value, "ERC20Bal inconsistent");
        require(claim.balance >= nativeValue, "New value exceeds balance");
        res.cp.data.fundsERC20 = erc20Value;
        res.cp.data.fundsNative = nativeValue;
        res.cp.data.lastUpdated = _now();
        _setCampaign(res.slot, weekId, res.cp.data);

        return true;
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    //    PUBLIC FUNCTION : KEEP TRACK OF POINTS EARNED FROM PARTICIPATING IN QUIZZES     //
    ////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @dev Delegate transaction to the Admin account also generate user key for all the campaigns.
     */
    function delegateTransaction() external payable returns(bool) {
       return _generateKey(msg.value);
    }

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
        _validateCampaign(hash_, weekId);
        GetCampaign memory res = _getCampaign(weekId, hash_);
        Profile memory pf = _getProfile(weekId, hash_, user);
        if(!_checkRegistration(weekId, hash_, user)) {
            _updateCampaignUsersList(res.slot, weekId, user);
            unchecked {
                res.cp.data.activeLearners += 1;
            }
        }
        require(pf.other.totalQuizPerWeek <= 120, 'Storage limit exceeded');
    
        unchecked {
            pf.other.totalQuizPerWeek += 1;
            res.cp.data.totalPoints += quizResult.other.score; 
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
        _setCampaign(res.slot, weekId, res.cp.data); 

        emit PointRecorded(user, weekId, hash_, quizResult);
        return true;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                       PUBLIC FUNCTIONS                                    //
    ///////////////////////////////////////////////////////////////////////////////////////////////

     /**
     * @dev Allocate weekly earnings
     * @param newIntervalInMin : New transition interval for the new week. The interval is used to determined the claim deadline.
     * @param amountInKnowToken : Amount to allocate in GROW token
     * @notice We first for allowance of owner to this contract. If allowance is zero, we assume allocation should come from
     * the GROW Token. Also, previous week payout will be closed. Learners must withdraw from past week before the current week ends
    */
    function sortWeeklyReward(uint amountInKnowToken, uint32 newIntervalInMin) 
        public 
        whenNotPaused 
        onlyAdmin
        returns(bool) 
    {
        (uint currentWk, uint newWk, CampaignData[] memory cData) = _initializeAllCampaigns(newIntervalInMin, amountInKnowToken, _callback);
        if(amountInKnowToken > 0) {
            require(address(token) != address(0), "Tk empty");
            require(token.allocate(amountInKnowToken, claim), 'Allocation failed');
        }

        emit Sorted(currentWk, newWk, cData);  
 
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

    /**@dev If activated, generate new key for the user, and allocate some amount of GROW token to them based on the 
        amount of value they have sent along with the call. 
    */
    function _createKey(address user, uint value, uint weekId, bytes32 hash_) internal returns(Profile memory pf) {
        pf = _getProfile(weekId, hash_, user);
        if(value > 0) {
            token.allocate(value, user);
        }
        if(!pf.other.haskey) {
            pf.other.haskey = true;
            pf.other.passkey = keccak256(abi.encodePacked(user, weekId, value));
        }
    }

    /**
     * @dev Generate user key for all campaigns in the current week.
     * @param value : Amount sent as minimum token
     */
    function _generateKey(uint256 value) internal returns(bool) {
        uint weekId = _getState().weekId;
        uint minimumToken = _getState().minimumToken;
        Campaign[] memory cps = _getCampaings(weekId);
        if(minimumToken > 0) {
            require(value >= minimumToken, "Insufficient token");
        }
        _sendValue(value, feeTo);
        uint valuePerCampaign;
        if(value > 0 && value >= cps.length) {
            unchecked {
                valuePerCampaign = value / cps.length;
            }
        }
        address user = _msgSender();
        for(uint i = 0; i < cps.length; i++) {
            bytes32 hash_ = cps[i].data.data.hash_;
            Profile memory pf = _createKey(user, valuePerCampaign, weekId, hash_);
            _setProfile(weekId,  hash_, user, pf.other);
        }
        return true;
    }

    function _checkRegistration(uint weekId, bytes32 hash_, address user) internal returns(bool isReg) {
        if(!registered[user][hash_][weekId]){
            registered[user][hash_][weekId] = true;
            userCampaigns[weekId][user].push(hash_);
        } else {
            isReg = true;
        }
    }

    /**
     * @dev Callback function to update campaign values
     * @param weekId : Week Id
     * @param hash_ : Campaign hash
     * @param fundsNative : Amount in native currency e.g CELO
     * @param fundsERC20 : Amount in ERC20 currency e.g $GROW, $G. etc
     * @param platformToken : Amount in platform token e.g GROW token
    */
    function onCampaignValueChanged(
        uint weekId, 
        bytes32 hash_, 
        uint256 fundsNative, 
        uint256 fundsERC20,
        uint256 platformToken,
        address user
    ) external onlyApproved {
        // _validateCampaign(hash_, weekId);
        _setIsClaimed(user, weekId, hash_);
        GetCampaign memory res = _getCampaign(weekId, hash_);
        if(res.cp.data.fundsERC20 >= fundsERC20){
            res.cp.data.fundsERC20 -= fundsERC20;
        }
        if(res.cp.data.fundsNative >= fundsNative){
            res.cp.data.fundsNative -= fundsNative;
        }
        if(res.cp.data.platformToken >= platformToken){
            res.cp.data.platformToken -= platformToken;
        }
        res.cp.data.lastUpdated = _now();
        _setCampaign(res.slot, weekId, res.cp.data);
    }

    function _callback(CData memory _cp, uint platformToken) internal returns(CData memory cp) {
        cp = _cp;
        (uint native, uint256 erc20) = _rebalance(cp.token, cp.fundsNative, cp.fundsERC20);
        cp.fundsNative = native;
        cp.fundsERC20 = erc20;
        unchecked {
            cp.platformToken += platformToken;
        }
        cp.lastUpdated = _now();
    }
    
    /**
     * @dev Calculates user's share of the weekly payout
     * @param userPoints : Total points accumulated by the user
     * @param cp : Campaign 
     */
    function _calculateShare( 
        uint64 userPoints, 
        CData memory cp
    ) internal view returns(uint erc20Amount, uint nativeClaim, uint platform) {
        uint8 erc20Decimals;
        assert(cp.totalPoints >= userPoints);
        if(cp.totalPoints > 0 && cp.token != address(0)) { 
            erc20Decimals = IERC20Metadata(cp.token).decimals(); 
            unchecked {
                if(cp.fundsERC20 > 0) erc20Amount = cp.totalPoints.calculateShare(userPoints, cp.fundsERC20, erc20Decimals);
                if(cp.fundsNative > 0) nativeClaim = cp.totalPoints.calculateShare(userPoints, cp.fundsNative, 18);
                if(cp.platformToken > 0) {
                    erc20Decimals = IERC20Metadata(address(token)).decimals();
                    platform =  cp.totalPoints.calculateShare(userPoints, cp.platformToken, erc20Decimals);
                }
            }
        }
    }

    /**
     * Check reward eligibility for the requested week
     * @param user : Target user
     * @param weekId : Requested week Id
     * @param hash_ : Hash of the campaign name
     */
    function _getEligibility(address user, bytes32 hash_, uint weekId, bool nullifier, bool validate) 
        internal 
        view 
        returns(Eligibility memory elg) 
    {
        if(validate) _validateCampaign(hash_, weekId);
        if(!isClaimed[user][weekId][hash_]) {
            CData memory cp = _getCampaign(weekId, hash_).cp.data;
            Profile memory pf = _getProfile(weekId, hash_, user);
            uint64 totalScore;
            for(uint i = 0; i < pf.quizResults.length; i++) { 
                unchecked {
                    totalScore += pf.quizResults[i].other.score;
                }
            }
            (uint erc20, uint native, uint platform) = _calculateShare(nullifier? 0 : totalScore, cp);
            bool protocolVerified = mode == Mode.LIVE? _now() <= _getDeadline(weekId) && (cp.fundsNative > 0 || cp.fundsERC20 > 0) : true;
            bool isEligible = protocolVerified && (native > 0 || erc20 > 0 || platform > 0);
            elg = Eligibility(
                isEligible,
                erc20,  
                native, 
                platform,
                cp.token, 
                hash_,
                weekId
            );
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
    //                          READ-ONLY FUNCTIONS                                //
    /////////////////////////////////////////////////////////////////////////////////

    /**
     * Get users eligibility for all the campaigns for the previous weeks ended
     * @param user : User
     * @notice Claim will always be for the concluded 3 weeks back. The position must match and can be extracted directly from 
     * the frontend when reading the user's campaigns. Learner can only claim from the past three weeks campaign pool; 
     */
    function checkEligibility(address user) 
        external 
        view
        returns(Eligibilities memory result) 
    {
        uint weekId = _getState().weekId;
        if(weekId > 0) weekId -= 1;
        Campaign[] memory cps = _getCampaings(weekId);
        uint cSize = cps.length;
        result.elgs = new Eligibility[](cSize);
        result.weekId = weekId;
        for(uint j = 0; j < cSize; j++){
            bool nullifier = false;
            // If useKey is enabled, learners must have created a key for all the campaigns they subscribed to
            if(useKey){
                if(!_getProfile(weekId, cps[j].data.data.hash_, user).other.haskey) nullifier = true;
            }
            result.elgs[j] = _getEligibility(user, cps[j].data.data.hash_, weekId, nullifier, false);
        }

        return result;
    } 

    // Fetch past claims
    function getData(address user) public view returns(ReadData memory data) {
        data.state = _getState();
        data.approved = _getApprovedCampaigns();
        uint weekIds = data.state.weekId;
        weekIds ++;
        data.wd = new WeekData[](weekIds);
        data.profileData = new WeekProfileData[](weekIds);
        uint hashSize = data.approved.length; 
        for(uint i = 0; i < weekIds; i++) {
            data.wd[i].campaigns = _getCampaings(i);
            data.wd[i].claimDeadline = _getDeadline(i);
            ReadProfile[] memory _userCampaigns = new ReadProfile[](hashSize);
            if(user != address(0)) {
                data.profileData[i].weekId = i;
                for(uint hashId = 0; hashId < hashSize; hashId++) { 
                    bytes32 hash_ = data.approved[hashId].hash_;
                    bool nullifier = false;
                    // If useKey is enabled, learners must have created a key for all the first campaign they joined
                    if(useKey){
                        if(!_getProfile(i, hash_, user).other.haskey) nullifier = true;
                    }
                    _userCampaigns[hashId] = ReadProfile( 
                        _getEligibility(user, hash_, i, nullifier, false),
                        _getProfile(i, hash_, user), 
                        isClaimed[user][i][hash_],
                        hash_
                    );
                }
                data.profileData[i].campaigns = _userCampaigns;
            }
        }
        return data;
    } 
}