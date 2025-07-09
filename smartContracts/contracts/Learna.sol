// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IGrowToken } from "./IGrowToken.sol";
import { Utils } from "./Utils.sol";
import { Admins } from "./Admins.sol";
import { Campaigns } from "./Campaigns.sol";

contract Learna is Campaigns, Admins, Ownable, ReentrancyGuard, Pausable {
    using Utils for uint96;
    enum Mode { LOCAL, LIVE }

    error NoPasskey();
    error NotEligible();
    error InvalidAddress(address);
    error InsufficientAllowance(uint256);

    event NewCampaign(bytes32 campaignHash, Campaign campaign);
    event ClaimedWeeklyReward(address indexed user, Profile profile, Campaign cp);
    event RegisteredForWeeklyEarning(address indexed users, uint weekId, bytes32[] campainHashes);
    event Banned(address[] indexed users, uint weekId, bytes32[] campainHashes);
    event Sorted(uint _weekId, uint newWeekId, string[] campainHashes);
    event PasskeyGenerated(address indexed sender, uint weekId, bytes32[] campainHashes);
    event CampaignCreated(uint weekId, address indexed tipper, Campaign data, bytes32[] campainHashes);

    struct ReadProfile {
        Profile profile;
        bytes32 campaignHash;
    }

    struct Profile {
        uint amountMinted;
        uint amountClaimedInNative;
        uint amountClaimedInERC20;
        bool claimed;
        uint16 points;
        bytes32 passKey;
        bool haskey;
        uint8 totalQuizPerWeek;
    }

    struct WeekData {
        Campaign[] campaigns;
        uint weekId; 
    } 

    // Readonly data
    struct ReadData {
        State state;
        CampaignData[] cData;
        WeekData[] wd;
    }

    struct State {
        uint minimumToken;
        uint64 transitionInterval; 
        uint weekCounter;
    }

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
            require(learners[weekId][campaignHash][user].haskey, 'Only passkey holders');
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
    ) Ownable(_msgSender()) {
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
            _initializeCampaign(weekId, _campaigns[i]);
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
    function _setProfile(uint weekId, bytes32 campaignHash, address user, Profile memory profile) internal {
        learners[weekId][campaignHash][user] = profile;
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
            Campaign memory cpo = _getCampaign(weekId, campaignHash);
            unchecked {
                cpo.activeLearners += 1;
            }
            Profile memory pf = _getProfile(weekId, campaignHash, sender);
            require(!pf.haskey, 'Passkey exist');
            // slot = _generateAndSaveSlot(weekId, sender, campaignHash, _initializeProfile); 
            pf.haskey = true;
            pf.amountMinted = st.minimumToken ;
            pf.passKey = keccak256(abi.encodePacked(sender, weekId, pf.haskey, st.minimumToken));
            _setProfile(weekId, campaignHash, sender, pf);

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
        return _getProfile(state.weekCounter, campaignHash, user).haskey;
    }
 
    /**
     * @dev Register users for weekly reward
     * @param user : User 
     * @param points : Points generated in quizzes.
     * @param campaignHashes : Campaign hash 
     * @notice Only owner function
    */
    function recordPoints(address user, uint16[] memory points, address token, bytes32[] memory campaignHashes) 
        public 
        payable
        onlyAdmin(_msgSender())
        whenNotPaused 
        validateAddress(token)
        returns(bool) 
    {
        uint weekId = state.weekCounter;
        _forwardFee(msg.value);
        require(user != address(0), "Invalid user");
        require(points.length == campaignHashes.length, "Array mismatch");
        for(uint i = 0; i < campaignHashes.length; i++) {
            bytes32 campaignHash = campaignHashes[i];
            _validateCampaign(campaignHash, weekId);
            Campaign memory cpo = _getCampaign(weekId, campaignHash);
            Profile memory pf = _getProfile(weekId, campaignHash, user);
            require(pf.haskey, 'No pass key');
            require(pf.totalQuizPerWeek <= 14, 'Storage limit exceeded');
            IGrowToken(token).burn(user, pf.amountMinted);
            unchecked {
                pf.points += points[i];
                pf.totalQuizPerWeek += 1;
                cpo.totalPoints += points[i]; 
            }
            _setProfile(weekId,  campaignHash, user,  pf);
            _setCampaign(weekId, campaignHash, cpo);
        }

        emit RegisteredForWeeklyEarning(user, weekId, campaignHashes);
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
        onlyAdmin(_msgSender())
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
                    if(pf.haskey) {
                        pf.haskey = false;
                        _setProfile(weekId, campaignHash, user, pf);
                    }
                }
            }
        }
        emit Banned(_users, weekId, campaignHashes);
        return true;
    }

    /**
     * @dev Claim ero20 token
     * @param recipient : Recipient
     * @param amount : Amount to transfer
     * @param token : token contract
     */
    function _claimErc20(address recipient, uint amount, IERC20 token) internal {
        if(address(token) != address(0)) {
            uint balance = token.balanceOf(address(this));
            if(balance > 0 && balance >= amount) {
                token.transfer(recipient, amount);
            }
        }
    }

    /**
     * @dev Claim ero20 token
     * @param recipient : Recipient
     * @param amount : Amount to transfer
     */
    function _claimNativeToken(address recipient, uint amount) internal {
        uint balance = address(this).balance;
        if(balance > 0 && balance >= amount) {
            payable(recipient).transfer(amount);
        }
    }
    
    /**
     * @dev Calculates user's share of the weekly payout
     * @param userPoints : Total points accumulated by the user
     * @param cp : Campaign 
     */
    function _calculateShare( 
        uint16 userPoints, 
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
    function _checkEligibility(
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
        (uint erc20, uint native) = _calculateShare(pf.points, cp);
        erc20Amount = erc20;
        nativeAmount = native;
        isEligible = (erc20Amount > 0 || nativeAmount > 0) && cp.canClaim; 
    }

    /**
     * Check Eligibility
     * @param weekId : Week Id
     */
    function checkEligibility(
        uint weekId, 
        address user, 
        bytes32 campaignHash
    ) 
        public 
        view 
        returns(bool) 
    {
        (,,,,bool isEligible) = _checkEligibility(weekId, user, campaignHash);
        return isEligible;
    } 
 
    /**
     * @dev claim reward
     * @param weekId : Week id for the specific week user want to withdraw from
     * @notice Users cannot claim for the current week. They can only claim for the week that has ended
     */
    function claimReward(uint weekId, bytes32 campaignHash) 
        public 
        whenNotPaused 
        nonReentrant 
        returns(bool) 
    {
        require(weekId <= state.weekCounter, "Week not ready");
        _validateCampaign(campaignHash, weekId);
        address sender = _msgSender();
        (
            Profile memory pf,
            Campaign memory cp,
            uint erc20Amount, 
            uint nativeAmount,
            bool isEligible
        ) = _checkEligibility(weekId, sender, campaignHash);
        if(!isEligible) revert NotEligible();
        if(!pf.haskey) revert NoPasskey();
        require(cp.canClaim, "Claim not active");
        require(_hasFund(weekId, campaignHash), "No funds in campaign");
        require(!pf.claimed, 'Already claimed');
        pf.claimed = true;
        if(mode == Mode.LIVE) require(_now() <= cp.claimActiveUntil, 'Claim ended'); 
        unchecked {
            if(cp.fundsNative > nativeAmount) cp.fundsNative -= nativeAmount;
            if(cp.fundsERC20 > nativeAmount) cp.fundsERC20 -= erc20Amount;
            pf.amountClaimedInNative += nativeAmount;
            pf.amountClaimedInERC20 += erc20Amount;
        }
        _setProfile(weekId,  campaignHash, sender, pf);
        _setCampaign(weekId, campaignHash, cp);
        if(erc20Amount > 0) _claimErc20(sender, erc20Amount, IERC20(cp.token)); 
        if(nativeAmount > 0) _claimNativeToken(sender, nativeAmount);
 
        emit ClaimedWeeklyReward(sender, pf, cp);
        return true; 
    }

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
        (Campaign memory cp, bytes32 campaignHash) = _initializeCampaign(weekId, campaign);
        address sender = _msgSender();
        address recipient = address(this);
        unchecked {
            if(msg.value > 0){
                cp.fundsNative += msg.value;
            } else {
                if(!_isAdmin(sender)) require(fundsErc20 > 0, "At least one funding");
            }
            
            if(fundsErc20 > 0) {
                if(token == address(0)) revert InvalidAddress(token);
                if(IERC20(token).transferFrom(sender, recipient, fundsErc20)){
                    cp.fundsERC20 = fundsErc20;
                    cp.token = token;
                }
            }
        }
        cp.lastUpdated = _now();
        if(cp.operator != sender) cp.operator = sender;
        if(cp.transitionDate == 0) cp.transitionDate = _now() + state.transitionInterval;
        _setCampaign(weekId, campaignHash, cp);
        emit NewCampaign(campaignHash, cp);

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
        onlyAdmin(_msgSender())
        returns(bool) 
    {
        State memory st = state;
        uint pastWeekId = st.weekCounter;
        uint newWeekId = _transitionToNewWeek();
        assert(newWeekId > pastWeekId);
        require(growTokenContract != address(0), 'Token is zero');
        uint256 totalBalInNative;
        for(uint i=0; i < _campaigns.length; i++) {
            string memory campaign = _campaigns[i];
            (Campaign memory newCp, bytes32 campaignHash) = _initializeCampaign(newWeekId, campaign);
            _validateCampaign(campaignHash, pastWeekId);
            Campaign memory cp = _getCampaign(pastWeekId, campaignHash);
            if(mode == Mode.LIVE) {
                require(cp.transitionDate > 0 && _now() >= cp.transitionDate, 'Transition date in future');
            }
            (uint256 nativeBalance, uint256 erc20Balance) = _rebalance(cp.token, cp.fundsNative, cp.fundsERC20);
            unchecked {
                totalBalInNative += nativeBalance;
                cp.claimActiveUntil = _now() + st.transitionInterval;
                newCp.transitionDate = _now() + st.transitionInterval;
            }
            cp.canClaim = true;
            cp.fundsNative = nativeBalance;
            cp.fundsERC20 = erc20Balance;
            _setCampaign(pastWeekId, campaignHash, cp);
            _setCampaign(newWeekId, campaignHash, newCp);
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
    ) public onlyAdmin(_msgSender()) returns(bool) {
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
        data.cData = _getCampaingData();
        uint weekId = data.state.weekCounter;
        // data.wd = new WeekData[](weekId);
        // data.wd = wd;
        if(weekId > 0) {
            data.wd = new WeekData[](weekId + 1);
            weekId += 1;
            for(uint i = 0; i < weekId; i++) {
                data.wd[i].weekId = i;
                data.wd[i].campaigns = _getCampaings(i);
            }
        } else {
            data.wd = new WeekData[](1);
           data.wd[0].campaigns = _getCampaings(0); 
        }
        // data.wd = wd;
        return data;
    } 

    // Set minimum payable token by users when signing up
    function setMinimumToken(uint newToken) public onlyAdmin(_msgSender()) whenNotPaused  returns(bool) {
        state.minimumToken = newToken;
        return true; 
    }

    // Set minimum payable token by users when signing up
    function setTransitionInterval(uint64 newInternal) public onlyAdmin(_msgSender()) whenNotPaused returns(bool) {
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