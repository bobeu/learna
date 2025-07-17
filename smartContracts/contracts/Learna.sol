// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IGrowToken } from "./IGrowToken.sol";
import { Utils } from "./Utils.sol";
import { Admins } from "./Admins.sol";
import { Campaigns, IERC20 } from "./Campaigns.sol";
import { ILearna } from "./ILearna.sol";
import { Approved } from "./Approved.sol";

contract Learna is 
    ILearna, 
    Approved,
    Campaigns, 
    Admins, 
    ReentrancyGuard, 
    Pausable 
{
    using Utils for uint96;

    Mode private mode;

    // Other state variables
    State private state;

    // Dev Address
    address private dev;

    // Campaign fee manager
    address private immutable feeManager;

    // Profiles for each campaign in week id
    mapping(uint weekId => mapping(bytes32 campaignHash => mapping(address => Profile))) private learners;

    /**
     * @dev Mapping of weekId to campaign to user profile
     * @notice An user can have previous claims
    */

    modifier validateAddress(address token) {
        require(token != address(0), "Token is zero");
        _;
    }

    // Only registered users
    modifier onlyPasskeyHolder(uint weekId, address user, bytes32[] memory campaignHashes) {
        for(uint i = 0; i < campaignHashes.length; i++) {
            bytes32 campaignHash = campaignHashes[i];
            require(learners[weekId][campaignHash][user].other.haskey, 'Only passkey holders');
        }
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
        uint64 transitionInterval, 
        Mode _mode, 
        address _feeManager,
        string[] memory _campaigns
    ) {
        _initializeEmptyAdminSlot();
        state.minimumToken = 1e16;
        mode = _mode;
        dev = _msgSender();
        require(_feeManager != address(0), "Fee manager is zero");
        feeManager = _feeManager;
        uint weekId = state.weekCounter;
        if(mode == Mode.LIVE){
            state.transitionInterval = transitionInterval;
        } 
        for(uint i = 0; i < _admins.length; i++) {
            if(_admins[i] != address(0)) _setAdmin(_admins[i], true); 
        }

        for(uint i = 0; i < _campaigns.length; i++) {
            unchecked {
                (bytes32 campaignHash, bytes memory encoded) = _getCampaignHash(_campaigns[i]);
                if(!_isInitializedCampaign(weekId, campaignHash)) {
                    _initializeCampaign(
                        weekId, 
                        transitionInterval + _now(), 
                        campaignHash, 
                        encoded,
                        _msgSender(),
                        0,
                        0,
                        address(0)
                    );
                }
            }
        }
    }

    receive() external payable {}

    /**
     * @dev Approve or deactivate admin
     * @param target : Target address
     * @param flag : Boolean value showing whether to activate or deactive
     * @notice False will remove admin vice versa
     */
    function setAdmin(address target, bool flag) public onlyOwner returns(bool) {
        _setAdmin(target, flag); 
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

    /**
     * @dev Generate new key for campaigns in the current week.
     * @param token : GROW Token address
     * @param campaignHashes : Campaign hash
     * @notice If minimum token paid for generating a key is greater than 0, the amount payable by the sender is 
     * a multiple of the msg.value by total campaign they're subscribing to.
     */
    function generateKey(address token, bytes32[] memory campaignHashes) 
        public 
        payable 
        whenNotPaused 
        validateAddress(token) 
        returns(bool)
    {
        State memory st = state;
        uint weekId = st.weekCounter;
        require(msg.value >= (st.minimumToken * campaignHashes.length), "Insufficient token");
        address sender = _msgSender();
        _forwardFee(msg.value);
        for(uint i = 0; i < campaignHashes.length; i++){
            bytes32 campaignHash = campaignHashes[i];
            _validateCampaign(campaignHash, weekId); 
            Profile memory pf = _getProfile(weekId, campaignHash, sender);
            require(!pf.other.haskey, 'Passkey exist');
            pf.other.haskey = true;
            pf.other.amountMinted = st.minimumToken ;
            pf.other.passKey = keccak256(abi.encodePacked(sender, weekId, pf.other.haskey, st.minimumToken));
            _setProfile(weekId, campaignHash, sender, pf.other);

        }
        require(IGrowToken(token).allocate(msg.value, sender), 'Gen: Allocation failed');

        emit PasskeyGenerated(sender, weekId, campaignHashes);
        return true;
    }

    /**
     * @dev Check whether user has generated a passkey for the current week
     * @param user : User 
     * @param campaignHash : User 
     * @return : True or False
    */
    function hasPassKey(address user, bytes32 campaignHash) public view returns(bool) {
        return _getProfile(state.weekCounter, campaignHash, user).other.haskey;
    }
 
    /**
     * @dev Register users for weekly reward
     * @param user : User 
     * @param campaignHash : Campaign hash 
     * @param quizResult : Array of quiz result for a campaign
     * @notice Only owner function
    */
    function recordPoints(address user, QuizResultInput memory quizResult, address token, bytes32 campaignHash) 
        public 
        payable
        onlyAdmin
        whenNotPaused 
        validateAddress(token)
        returns(bool) 
    {
        uint weekId = state.weekCounter;
        _forwardFee(msg.value);
        require(user != address(0), "Invalid user");
        _validateCampaign(campaignHash, weekId);
        Campaign memory cpo = _getCampaign(weekId, campaignHash);
        Profile memory pf = _getProfile(weekId, campaignHash, user);
        if(msg.value > 0) {
            require(pf.other.haskey, 'No pass key');
            IGrowToken(token).burn(user, pf.other.amountMinted);
        }
        require(pf.other.totalQuizPerWeek <= 14, 'Storage limit exceeded');
    
        unchecked {
            cpo.activeLearners += 1;
            pf.other.totalQuizPerWeek += 1;
            cpo.totalPoints += quizResult.other.score; 
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
        _setCampaign(weekId, campaignHash, cpo);

        emit RegisteredForWeeklyEarning(user, weekId, campaignHash);
        return true;
    }

    /**
     * @dev Remove users from the list of campaigns in the current week
     * @param _users : List of users 
     * @notice Only owner function
    */
    function banUserFromCampaign(
        address[] memory _users, 
        bytes32[] memory campaignHashes
    ) 
        public 
        onlyAdmin
        whenNotPaused 
        returns(bool) 
    {
        uint weekId = state.weekCounter;
        for(uint i = 0; i < _users.length; i++) {
            address user = _users[i];
            if(user != address(0)) {
                for(uint j=0; j<campaignHashes.length; j++){
                    bytes32 campaignHash = campaignHashes[j];
                    _validateCampaign(campaignHash, weekId);
                    Profile memory pf = _getProfile(weekId, campaignHash, user);
                    if(pf.other.haskey) {
                        pf.other.haskey = false;
                        _setProfile(weekId, campaignHash, user, pf.other);
                    }
                }
            }
        }
        emit Banned(_users, weekId, campaignHashes);
        return true;
    }

    // /**
    //  * @dev Claim ero20 token
    //  * @param recipient : Recipient
    //  * @param amount : Amount to transfer
    //  * @param token : token contract
    //  */
    // function _claimErc20(address recipient, uint amount, IERC20 token) internal {
    //     if(address(token) != address(0)) {
    //         uint balance = token.balanceOf(address(this));
    //         if(balance > 0 && balance >= amount) {
    //             token.transfer(recipient, amount);
    //         }
    //     }
    // }

    // /**
    //  * @dev Claim ero20 token
    //  * @param recipient : Recipient
    //  * @param amount : Amount to transfer
    //  */
    // function _claimNativeToken(address recipient, uint amount) internal {
    //     uint balance = address(this).balance;
    //     if(balance > 0 && balance >= amount) {
    //         payable(recipient).transfer(amount);
    //     }
    // }
    
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
     * Check Eligibility
     * @param weekId : Week Id
     * @param user : Target user
     * @param campaignHash : Hash of the campaign name
     */
    function _getEligibility(
        uint weekId, 
        address user, 
        bytes32 campaignHash
    ) 
        internal 
        view 
        returns(
            Profile memory pf,
            Campaign memory cp,
            uint erc20Amount, 
            uint nativeAmount,
            bool isEligible
        ) 
    {
        _validateCampaign(campaignHash, weekId);
        cp = _getCampaign(weekId, campaignHash);
        pf = _getProfile(weekId, campaignHash, user);
        uint64 totalScore;
        for(uint i = 0; i < pf.quizResults.length; i++) { 
            unchecked {
                totalScore += pf.quizResults[i].other.score;
            }
        }
        // if(totalScore == 0) revert("here");
        (uint erc20, uint native) = _calculateShare(totalScore, cp);
        erc20Amount = erc20;
        nativeAmount = native;
        isEligible = (erc20Amount > 0 || nativeAmount > 0) && cp.canClaim && (mode == Mode.LIVE? _now() <= cp.claimActiveUntil : true); 
    }

    /**
     * Check Eligibility
     * @param weekId : Week Id
     * @param campaignHashes: CampaignHashes
     */
    function checkEligibility(
        uint weekId, 
        address user, 
        bytes32 memory campaignHash
    ) 
        external 
        view 
        returns(Eligibility memory result) 
    {
        uint campaignSize = campaignHashes.length;
        (Profile memory pf, Campaign memory cp, uint erc20, uint native, bool isEligible) = _getEligibility(weekId, user, campaignHash);
        result = Eligibility({
            canClaim: isEligible,
            profile: pf,
            campaignHash: campaignHash,
            erc20Amount: erc20,
            nativeAmount: native,
            mode: mode,
            campaign: cp
        });

        return result;
    } 

    /**
     * @dev To be invoked after an user claimed reward
     * @param weekId : week Id
     * @param user : target user account
     * @param campaignHash : Campaign hash
     * @param elg : Eligibility object
     */
    function onClaimed(
        uint weekId, 
        address user, 
        bytes32 campaignHash,
        Eligibility memory elg
    ) 
        external 
        whenNotPaused
        onlyApproved
    {
        require(weekId <= state.weekCounter, "Week not ready");
        _setProfile(weekId,  campaignHash, user, elg.pf.other);
        _setCampaign(weekId, campaignHash, elg.cp);
        emit ClaimedWeeklyReward(user, elg.pf, elg.cp);
    }
 
    // /**
    //  * @dev claim reward
    //  * @param weekId : Week id for the specific week user want to withdraw from
    //  * @notice Users cannot claim for the current week. They can only claim for the week that has ended
    //  */
    // function claimReward(uint weekId, bytes32 campaignHash) 
    //     public 
    //     whenNotPaused 
    //     nonReentrant 
    //     returns(bool) 
    // {
    //     require(weekId <= state.weekCounter, "Week not ready");
    //     // _validateCampaign(campaignHash, weekId);
    //     address sender = _msgSender();
    //     (
    //         Profile memory pf,
    //         Campaign memory cp,
    //         uint erc20Amount, 
    //         uint nativeAmount,
    //         bool isEligible
    //     ) = _getEligibility(weekId, sender, campaignHash);
    //     if(!isEligible) revert NotEligible();
    //     // if(!pf.other.haskey) revert NoPasskey();
    //     // require(cp.canClaim, "Claim not active");
    //     // require(_hasFund(weekId, campaignHash), "No funds in campaign");
    //     require(!pf.other.claimed, 'Already claimed');
    //     pf.other.claimed = true;
    //     // if(mode == Mode.LIVE) require(_now() <= cp.claimActiveUntil, 'Claim ended'); 
    //     unchecked {
    //         if(cp.fundsNative > nativeAmount) cp.fundsNative -= nativeAmount;
    //         if(cp.fundsERC20 > nativeAmount) cp.fundsERC20 -= erc20Amount;
    //         pf.other.amountClaimedInNative += nativeAmount;
    //         pf.other.amountClaimedInERC20 += erc20Amount;
    //     }
    //     _setProfile(weekId,  campaignHash, sender, pf.other);
    //     _setCampaign(weekId, campaignHash, cp);
    //     if(erc20Amount > 0) _claimErc20(sender, erc20Amount, IERC20(cp.token)); 
    //     if(nativeAmount > 0) _claimNativeToken(sender, nativeAmount);
 
    //     emit ClaimedWeeklyReward(sender, pf, cp);
    //     return true; 
    // }

    // Transition into new week
    function _transitionToNewWeek() internal returns(uint newWeekId) { 
        state.weekCounter ++; 
        newWeekId = state.weekCounter;
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
                require(IERC20(token).transfer(dev, devShare), 'ERC20 TFailed');
                erc20Balance -= devShare; 
            }
        }
    }

    /**
     * @dev Add new campaign to the current week
     * @param campaign : Campaign string
     * @param token : ERC20 contract address if fundsErc20 is greater than 0
     * @param fundsErc20 : Amount to fund the campaign in ERC20 currency e.g $GROW, $G. etc
     * @notice Anyone can setUp or add campaign provided they have enough to fund it. Campaign can be funded in two ways:
     * - ERC20. If the amount in fundsErc20 is greater than 0, it is suppose that the sender intends to also fund the campaign
     *    in ERC20-based asset hence the 'token' parameter must not be zero.
     * - Native such as CELO.
     */
    function setUpCampaign(
        string memory campaign, 
        uint256 fundsErc20,
        address token
    ) public payable returns(bool) {
        uint weekId = state.weekCounter;
        address sender = _msgSender();
        (bytes32 campaignHash, bytes memory encoded) = _getCampaignHash(campaign);
        if(!_isInitializedCampaign(weekId, campaignHash)) {
            _initializeCampaign(
                weekId, 
                state.transitionInterval + _now(), 
                campaignHash, 
                encoded,
                _msgSender(),
                msg.value,
                fundsErc20,
                token
            );
        }
        address recipient = address(this);
        Campaign memory cp = _getCampaign(weekId, campaignHash);
        unchecked {
            if(msg.value > 0){
                cp.fundsNative += msg.value;
            } else {
                if(!_isAdmin(sender)) require(fundsErc20 > 0, "At least one funding");
            }
            
            if(fundsErc20 > 0) {
                if(cp.fundsERC20 > 0) require(cp.token == token, "Changing token is not permitted");
                if(token == address(0)) revert InvalidAddress(token); 
                if(IERC20(token).transferFrom(sender, recipient, fundsErc20)){
                    cp.fundsERC20 += fundsErc20;
                    cp.token = token;
                }
            }
            cp.lastUpdated = _now();
            if(cp.operator != sender) cp.operator = sender;
            if(cp.transitionDate == 0) cp.transitionDate = _now() + state.transitionInterval;
            _setCampaign(weekId, campaignHash, cp);
            emit NewCampaign(campaignHash, cp);
        }

        return true;
    }

    /**
     * @dev Allocate weekly earnings
     * @param growTokenContract : Grow Token contract address.
     * @param _campaigns : Campaign hashes.
     * @param amountInGrowToken : Amount to allocate in GROW token
     * @notice We first for allowance of owner to this contract. If allowance is zero, we assume allocation should come from
     * the GROW Token. Also, previous week payout will be closed. Learners must withdraw from past week before the current week ends
    */
    function sortWeeklyReward(
        address growTokenContract,
        uint amountInGrowToken, 
        string[] memory _campaigns
    ) 
        public 
        whenNotPaused 
        // onlyOwner
        onlyAdmin
        returns(bool) 
    {
        State memory st = state;
        uint pastWeekId = st.weekCounter;
        uint newWeekId = _transitionToNewWeek();
        assert(newWeekId > pastWeekId);
        require(growTokenContract != address(0), 'Token is zero');
        uint256 totalBalInNative;
        for(uint i=0; i < _campaigns.length; i++) {
            (bytes32 campaignHash, bytes memory encoded) = _getCampaignHash(_campaigns[i]);
            _validateCampaign(campaignHash, pastWeekId);
            Campaign memory cp = _getCampaign(pastWeekId, campaignHash);
            if(mode == Mode.LIVE) {
                require(cp.transitionDate > 0 && _now() >= cp.transitionDate, 'Transition date in future');
            }
            (uint256 nativeBalance, uint256 erc20Balance) = _rebalance(cp.token, cp.fundsNative, cp.fundsERC20);
            unchecked {
                totalBalInNative += nativeBalance;
                cp.claimActiveUntil = _now() + st.transitionInterval;
            }
            cp.canClaim = true;
            cp.fundsNative = nativeBalance;
            cp.fundsERC20 = erc20Balance;
            _setCampaign(pastWeekId, campaignHash, cp);
            if(!_isInitializedCampaign(newWeekId, campaignHash)) {
                _initializeCampaign(
                    newWeekId, 
                    st.transitionInterval + _now(), 
                    campaignHash, 
                    encoded,
                    _msgSender(),
                    0,
                    0,
                    address(0)
                );
            }
            
        }
        
        if(amountInGrowToken > 0) {
            require(growTokenContract != address(0), "Sort: Token is empty");
            require(IGrowToken(growTokenContract).allocate(amountInGrowToken, address(0)), 'Allocation failed');
        }
        require(address(this).balance >= totalBalInNative, "Balance anomally");

        emit Sorted(pastWeekId, newWeekId, _campaigns);   
        return true;
    }

    /**
     * @dev Adjust funds in campaigns. Only admin function
     * @param campaignHashes : Campaign hashes
     * @param erc20Values : ERC20 values.
     * @param nativeValues : Values in native coin e.g CELO
     * @notice The function can increase or decrease the values in a campaign. Just parse desired values.
     *         - For each campaign, values cannot be adjusted beyond the balances in this contract.
     */
    function adjustCampaignValues(
        bytes32[] memory campaignHashes, 
        uint[] memory erc20Values,
        uint[] memory nativeValues
    ) public onlyAdmin returns(bool) {
        uint weekId = state.weekCounter;
        uint totalNativeValues;
        require(campaignHashes.length == erc20Values.length && erc20Values.length == nativeValues.length, '2: Array mismatch');
        for(uint i = 0; i < campaignHashes.length; i++){
            bytes32 campaignHash = campaignHashes[i];
            uint erc20Value = erc20Values[i];
            uint nativeValue = nativeValues[i];
            unchecked {
                totalNativeValues += nativeValue;
            }
            Campaign memory cp = _getCampaign(weekId, campaignHash);
            require(IERC20(cp.token).balanceOf(address(this)) >= erc20Value, "ERC20Bal inconsistent");
            cp.fundsERC20 = erc20Value;
            cp.fundsNative = nativeValue;
            cp.lastUpdated = _now();
            _setCampaign(weekId, campaignHash, cp);
        }
        require(address(this).balance >= totalNativeValues, "NtiveBal inconsistent");
        return true;
    }

    // Fetch past claims
    function getData() public view returns(ReadData memory data) {
        data.state = state;
        uint weekId = data.state.weekCounter;
        data.wd = new WeekData[](weekId + 1);
        weekId += 1;
        for(uint i = 0; i < weekId; i++) {
            data.wd[i].campaigns = _getCampaings(i);
        }

        return data;
    } 

    // Set minimum payable token by users when signing up
    function setMinimumToken(uint newToken) public onlyAdmin whenNotPaused  returns(bool) {
        state.minimumToken = newToken;
        return true; 
    }

    // Set minimum payable token by users when signing up
    function setTransitionInterval(uint64 newInternal) public onlyAdmin whenNotPaused returns(bool) {
        state.minimumToken = newInternal;
        return true;
    }
    
    // Get user's data
    function getProfile(address user, uint weekId, bytes32[] memory campaignHashes) public view returns(ReadProfile[] memory result) {
        result = new ReadProfile[](campaignHashes.length);
        for(uint i = 0; i < campaignHashes.length; i++) {
            bytes32 campaignHash = campaignHashes[i];
            result[i] = ReadProfile(_getProfile(weekId, campaignHash, user), campaignHash);
        } 
        return result; 
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

}