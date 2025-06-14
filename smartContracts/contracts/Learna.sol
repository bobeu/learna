// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IGrowToken } from "./IGrowToken.sol";
import { Utils } from "./Utils.sol";

contract Learna is Ownable, ReentrancyGuard {
    using Utils for uint96;
    enum Mode { LOCAL, LIVE }

    event ClaimedWeeklyReward(address indexed user, Profile profile, Claim claim);
    event RegisteredForWeeklyEarning(address indexed users, uint weekId);
    event UnregisteredForWeeklyEarning(address[] indexed users, uint weekId);
    event Sorted(Claim _claim, uint _weekId, uint newWeekId);
    event PasskeyGenerated(address indexed sender, uint weekId);
    event Tipped(uint weekId, address indexed tipper, Tipper data);

    struct Values {
        uint totalAllocated;
        uint totalClaimed;
    }

    // Claim data
    struct Claim {
        Values native;
        Values erc20;
        address erc20Addr;
        uint64 claimActiveUntil;
        uint64 transitionDate;
    }
               
    // User's profile data
    struct Profile {
        uint amountClaimedInNative;
        uint amountClaimedInERC20;
        bool claimed;
        uint16 points;
        bytes32 passKey;
        bool haskey;
        uint8 totalQuizPerWeek;
    }

    // Readonly data
    struct ReadData {
        State state;
        WeekData[] wd;
    }

    struct Tipper {
        uint totalTipped;
        uint64 points;
        uint lastTippedDate;
        address id;
    }

    struct TipperData {
        bool exist;
        uint index;
    }

    struct State {
        uint minimumToken;
        uint64 transitionInterval; 
        uint weekCounter;
    }

    struct WeekData {
        Tipper[] tippers;
        Claim claim;
        uint activeLearners; 
        uint96 totalPoints;
        uint64 transitionInterval;
    } 

    Mode private mode;

    // Other state variables
    State private state;

    // Dev Address
    address private dev;

    // Tippers 
    mapping(address => TipperData) private isTipper;

    /**
     * @dev Mapping of user address to profile data
     * @notice An user can have previous claims
    */
    mapping(address user => mapping(uint weekId => Profile)) private users;

    // Admin access role
    mapping(address => uint8) private isAdmin;

    //weekly claims
    mapping(uint weekId => WeekData) private weekData;

    // Only registered users
    modifier onlyPasskeyHolder(uint weekId) {
        require(users[_msgSender()][weekId].haskey, 'Only passkey holders');
        _;
    }

    // Only Admin
    modifier onlyAdmin {
        require(isAdmin[_msgSender()] > 0, 'Only admin');
        _;
    }

    constructor(address[] memory admins, uint64 transitionInterval, Mode _mode) Ownable(_msgSender()) {
        state.minimumToken = 1e16;
        mode = _mode;
        dev = _msgSender();
        if(mode == Mode.LIVE){
            state.transitionInterval = transitionInterval;
            weekData[0].claim.transitionDate = _now() + transitionInterval;
        }
        for(uint i = 0; i < admins.length; i++) {
            if(admins[i] != address(0)) _setAdmin(admins[i], 1); 
        }
    }

    receive() external payable {}

    // Return the current unix time stamp on the network
    function _now() internal view returns(uint64 result) {
        result = uint64(block.timestamp);
    } 

    // Users are required to generate a key every week in order to qualify for the weekly payout
    function generateKey() public payable returns(bool) {
        State memory st = state;
        uint weekId = st.weekCounter;
        require(msg.value >= st.minimumToken, "Insufficient token");
        address sender = _msgSender();
        unchecked {
            weekData[weekId].activeLearners += 1;
        }
        Profile memory pf = users[sender][weekId];
        require(!pf.haskey, 'User already owns a passkey');
        pf.haskey = true;
        pf.passKey = keccak256(abi.encodePacked(sender, weekId, pf.haskey));
        users[sender][weekId] = pf;

        emit PasskeyGenerated(sender, weekId);
        return true;
    }

    /**
     * @dev Check whether user has generated a passkey for the current week
     * @param user : User 
     * @return : True or False
     */
    function hasPassKey(address user) public view returns(bool) {
        return users[user][state.weekCounter].haskey;
    }

    // Approve or deactivate admin
    function _setAdmin(address target, uint8 flag) internal {
        isAdmin[target] = flag;
    }
 
    // Approve or deactivate admin
    // 0 will remove admin. Any number greater than 0 will approve admin
    function setAdmin(address target, uint8 flag) public onlyOwner returns(bool) {
        _setAdmin(target, flag); 
        return true;
    }
 
    /**
     * @dev Register users for weekly reward
     * @param user : User 
     * @param points : Points generated in quizzes.
     * @notice Only owner function
    */
    function recordPoints(address user, uint16 points) public onlyAdmin returns(bool) {
        uint weekId = state.weekCounter;
        Profile memory pf = users[user][weekId];
        require(pf.totalQuizPerWeek <= 120, 'Rate limited');
        require(pf.haskey, 'No pass key');
        if(user != address(0)) {
            unchecked {
                users[user][weekId].points += points;
                weekData[weekId].totalPoints += points;
                users[user][weekId].totalQuizPerWeek += 1;
            }
        }

        emit RegisteredForWeeklyEarning(user, weekId);
        return true;
    }

    /**
     * @dev Register users for weekly reward
     * @param _users : List of users 
     * @param weekId: Week id 
     * @notice Only owner function
     */
    function removeUsersForWeeklyEarning(address[] memory _users, uint weekId) public onlyAdmin returns(bool) {
        for(uint i = 0; i < _users.length; i++) {
            address user = _users[i];
            if(user != address(0)) {
                bool haskey = users[user][weekId].haskey; 
                if(haskey) {
                    users[user][weekId].haskey = false;
                }
            }
        }
        emit UnregisteredForWeeklyEarning(_users, weekId);
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
     * @param weekId : week id
     * @param userPoints : Total points accumulated by the user
     * @return erc20Amount : Share in ERC20 token if available
     * @return nativeClaim : Share in Native asset if available
     */
    function _calculateShare(uint weekId, uint16 userPoints, bool runCheck) internal view returns(uint erc20Amount, uint nativeClaim, Claim memory clm) {
        WeekData memory wd = weekData[weekId];
        clm = wd.claim;
        uint8 erc20Decimals;
        if(runCheck) {
            if(wd.transitionInterval > 0) {
                if(clm.claimActiveUntil > 0) {
                    require(_now() <= clm.claimActiveUntil, 'Claim closed');
                }

            }
            assert(wd.totalPoints >= userPoints);
        }
        if(wd.totalPoints > 0 && clm.erc20Addr != address(0)) { 
            erc20Decimals = IERC20Metadata(clm.erc20Addr).decimals(); 
            unchecked {
                if(clm.erc20.totalAllocated > 0) erc20Amount = wd.totalPoints.calculateShare(userPoints, clm.erc20.totalAllocated, erc20Decimals);
                if(clm.native.totalAllocated > 0) nativeClaim = wd.totalPoints.calculateShare(userPoints, clm.native.totalAllocated, 18);
            }
        }
    }

    /**
     * Check Eligibility
     * @param weekId : Week Id
     */
    function checkligibility(uint weekId) public view returns(bool) {
        Profile memory pf = users[_msgSender()][weekId];
        (uint erc20Amount, uint nativeClaim, Claim memory clm) = _calculateShare(weekId, pf.points, false);
        return (clm.erc20.totalAllocated > 0 || clm.native.totalAllocated > 0) && (erc20Amount > 0 || nativeClaim > 0);
    } 
    
    /**
     * @dev claim reward
     * @param weekId : Week id for the specific week user want to withdraw from
     * @notice Users cannot claim for the current week. They can only claim for the week that has ended
     */
    function claimWeeklyReward(uint weekId) public onlyPasskeyHolder(weekId) nonReentrant returns(bool) {
        require(weekId <= state.weekCounter, "Week not ready");
        address sender = _msgSender();
        Profile memory pf = users[sender][weekId];
        WeekData memory wd = weekData[weekId];
        require(!pf.claimed, 'Already claimed');
        require(wd.claim.erc20.totalAllocated > 0 || wd.claim.native.totalAllocated > 0, "No payout");
        if(mode == Mode.LIVE) require(_now() <= wd.claim.claimActiveUntil, 'Claim period passed'); 
        (uint erc20Amount, uint nativeClaim, Claim memory clm) = _calculateShare(weekId, pf.points, true);
        unchecked {
            weekData[weekId].claim.erc20.totalClaimed += erc20Amount;
            weekData[weekId].claim.native.totalClaimed += nativeClaim;
        }
        users[sender][weekId] = Profile(nativeClaim, erc20Amount, true, pf.points, pf.passKey, pf.haskey, pf.totalQuizPerWeek);
        if(erc20Amount > 0) _claimErc20(sender, erc20Amount, IERC20(clm.erc20Addr));
        if(nativeClaim > 0) _claimNativeToken(sender, nativeClaim);
 
        emit ClaimedWeeklyReward(sender, users[sender][weekId], _getClaim(weekId));
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
    function _getBalanceAfterDevShare(address token) internal returns(uint256 nativeBalance, uint256 erc20Balance) {
        uint8 devRate = 2;
        nativeBalance = address(this).balance;
        erc20Balance = IERC20(token).balanceOf(address(this));
        uint devShare;
        unchecked {
            if(nativeBalance > 0) {
                devShare = (nativeBalance * devRate) / 100;
                (bool done,) = dev.call{value: devShare}('');
                require(done, 'T.Failed');
                nativeBalance -= devShare;
            }
            if(erc20Balance > 0) {
                devShare = (erc20Balance * devRate) / 100;
                require(IERC20(token).transfer(dev, devShare), 'ERC20 TFailed');
                erc20Balance -= devShare; 
            }
        }
    }

    /**
     * @dev Allocate weekly earnings
     * @param token: ERC20 token address to share from. Could be any ERC20 compatible token.
     * @param owner : Account sending weekly tippings in ERC20 type asset.
     * @param amountInERC20 : Amount of ERC20 token to allocate
     * @notice We first for allowance of owner to this contract. If allowance is zero, we assume allocation should come from
     * the GROW Token. Also, previous week payout will be closed. Learners must withdraw from past week before the current week ends
    */
    function sortWeeklyReward(address token, address owner, uint amountInERC20) public onlyAdmin returns(bool) {
        State memory st = state;
        uint pastWeekId = st.weekCounter;
        WeekData memory wd = weekData[pastWeekId];
        if(mode == Mode.LIVE) {
            require(wd.claim.transitionDate > 0 && _now() >= wd.claim.transitionDate, 'Transition date in future');
        }
        uint newWeekId = _transitionToNewWeek();
        assert(newWeekId > pastWeekId);
        unchecked {
            weekData[newWeekId].claim.transitionDate = _now() + st.transitionInterval;
        }
        require(token != address(0), 'Token is zero');
        uint allowance = IERC20(token).allowance(owner, address(this));
        if(allowance > 0) {
            IERC20(token).transferFrom(owner, address(this), allowance);
        } else {
            allowance = IGrowToken(token).allocate(amountInERC20);
            require(allowance == amountInERC20, 'Allocation failed');
        }
        (uint256 nativeBalance, uint256 erc20Balance) = _getBalanceAfterDevShare(token);
        weekData[pastWeekId].claim = Claim({
            native: Values(nativeBalance, 0),
            erc20: Values(erc20Balance, 0),
            erc20Addr: token,
            claimActiveUntil: _now() + st.transitionInterval, 
            transitionDate: _now()
        });

        emit Sorted(_getClaim(pastWeekId), pastWeekId, newWeekId);   
        return true;
    }

    // Fetch the claim data from the weekData
    function _getClaim(uint weekId) internal view returns(Claim memory _claim) {
        _claim = weekData[weekId].claim;
    }

    // Fetch past claims
    function getData() public view returns(ReadData memory data) {
        data.state = state;
        uint weekId = data.state.weekCounter;
        WeekData[] memory wd = new WeekData[](weekId);
        data.wd = wd;
        if(weekId > 0) {
            wd = new WeekData[](weekId + 1);
            weekId += 1;
            for(uint i = 0; i < weekId; i++) {
                wd[i] = weekData[i];
            }
        } else {
            wd = new WeekData[](1);
            wd[0] = weekData[0]; 
        }
        data.wd = wd;
        return data;
    } 

        // set tips to the learna contract. Tippers earn points
    function tip() public payable returns(bool) {
        address sender = _msgSender();
        TipperData memory td = isTipper[sender];
        uint amount = msg.value;
        uint weekId = state.weekCounter;
        if(amount > 0) {
            if(!td.exist) {
                td.exist = true;
                td.index = weekData[weekId].tippers.length;
                isTipper[sender] = td;
                weekData[weekId].tippers.push();
            }
            uint minimumTip = 50 ether;
            uint64 point;
            unchecked {
                weekData[weekId].tippers[td.index].totalTipped += amount;
                if(amount >= minimumTip) point = uint64(amount / minimumTip);
            }
            weekData[weekId].tippers[td.index].points += point;
            if(weekData[weekId].tippers[td.index].id == address(0)) weekData[weekId].tippers[td.index].id = _msgSender();  

        }
        emit Tipped(weekId, sender, weekData[weekId].tippers[td.index]);

        return true; 
    }

    // Set minimum payable token by users when signing up
    function setMinimumToken(uint newToken) public onlyAdmin  returns(bool) {
        state.minimumToken = newToken;
        return true; 
    }

    // Set minimum payable token by users when signing up
    function setTransitionInterval(uint64 newInternal) public onlyAdmin returns(bool) {
        state.minimumToken = newInternal;
        return true;
    }
    
    // Get user's data
    function getUserData(address user, uint weekId) public view returns(Profile memory) {
        return users[user][weekId];
    }

}