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

    event ClaimedWeeklyReward(address indexed user, Profile profile);
    event RegisteredForWeeklyEarning(address indexed users, uint weekId);
    event UnregisteredForWeeklyEarning(address[] indexed users, uint weekId);
    event Sorted(Claims _claims, uint _weekId);
    event PasskeyGenerated(address indexed sender, uint weekId);

    struct Values {
        uint totalAllocated;
        uint totalClaimed;
    }

    // Claims data
    struct Claims {
        Values native;
        Values erc20;
        address erc20Addr;
        uint96 totalPoints;
        bool active;
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
        Claims[] claims;
    }

    struct Tipper {
        uint totalTipped;
        uint64 points;
        uint lastTippedDate;
    }

    struct TipperData {
        bool exist;
        uint index;
    }

    struct State {
        Tipper[] tippers;
        uint activeLearners; 
        uint96 totalPoints;
        uint minimumToken;
        uint weekCounter;
    }

    // Other state variables
    State private state;

    // Tippers 
    mapping(address => TipperData) private isTipper;

    /**
     * @dev Mapping of user address to profile data
     * @notice An user can have previous claims
    */
    mapping(address user => mapping(uint weekId => Profile)) private users;

    // Admin access role
    mapping(address => bool) private isAdmin;

    //weekly claims
    mapping(uint weekId => Claims) private claims;

    // Only registered users
    modifier onlyPasskeyHolder(uint weekId) {
        require(users[_msgSender()][weekId].haskey, 'Only passkey holders');
        _;
    }

    // Only Admin
    modifier onlyAdmin {
        require(isAdmin[_msgSender()], 'Only admin');
        _;
    }

    constructor(address any) Ownable(_msgSender()) {
        _setAdmin(_msgSender(), 0);
        if(any != address(0)) _setAdmin(any, 0);
    }

    receive() external payable {}

    // Users are required to generate a key every week in order to qualify for the weekly payout
    function generateKey() public payable returns(bool) {
        State memory st = state;
        require(msg.value >= st.minimumToken, "Insufficient token");
        address sender = _msgSender();
        unchecked {
            state.activeLearners ++;
        }
        uint weekId = st.weekCounter;
        Profile memory pf = users[sender][weekId];
        require(!pf.haskey, 'User already owns a passkey');
        bytes32 hashKey = keccak256(abi.encodePacked(sender, weekId));
        pf.haskey = true;
        pf.passKey = hashKey;
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
        isAdmin[target] = flag == 0? true : false;
    }
 
    // Approve or deactivate admin
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
                state.totalPoints += points;
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
    function _calculateShare(uint weekId, uint16 userPoints, bool runCheck) internal view returns(uint erc20Amount, uint nativeClaim, Claims memory claim) {
        claim = claims[weekId];
        uint8 erc20Decimals;
        if(runCheck) {
            require(claim.active, 'Closed');
            assert(claim.totalPoints >= userPoints);
        }
        if(claim.totalPoints > 0 && claim.erc20Addr != address(0)) { 
            erc20Decimals = IERC20Metadata(claim.erc20Addr).decimals(); 
            unchecked {
                if(claim.erc20.totalAllocated > 0) erc20Amount = claim.totalPoints.calculateShare(userPoints, claim.erc20.totalAllocated, erc20Decimals);
                if(claim.native.totalAllocated > 0) nativeClaim = claim.totalPoints.calculateShare(userPoints, claim.native.totalAllocated, 18);
            }
        }
    }

    /**
     * Check Eligibility
     * @param weekId : Week Id
     */
    function checkligibility(uint weekId) public view returns(bool eligible) {
        Profile memory pf = users[_msgSender()][weekId];
        (uint erc20Amount, uint nativeClaim,) = _calculateShare(weekId, pf.points,false);
        if(erc20Amount > 0 || nativeClaim > 0) eligible = true;
        return eligible;
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
        require(!pf.claimed, 'Already claimed');
        pf.claimed = true;
        (uint erc20Amount, uint nativeClaim, Claims memory clm) = _calculateShare(weekId, pf.points, true);
        unchecked {
            clm.erc20.totalClaimed += erc20Amount;
            clm.native.totalClaimed += nativeClaim;
        }
        users[sender][weekId] = Profile(nativeClaim, erc20Amount, true, pf.points, pf.passKey, pf.haskey, pf.totalQuizPerWeek);
        if(erc20Amount > 0) _claimErc20(sender, erc20Amount, IERC20(clm.erc20Addr));
        if(nativeClaim > 0) _claimNativeToken(sender, nativeClaim);
 
        emit ClaimedWeeklyReward(sender, users[sender][weekId]);
        return true;
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
        uint currentWeekId = st.weekCounter;
        unchecked {
            state.weekCounter ++;
        }
        if(currentWeekId > 0) {
            claims[currentWeekId - 1].active = false;
        }
        require(token != address(0), 'Token is zero');
        uint balance = IERC20(token).allowance(owner, address(this));
        if(balance > 0) {
            IERC20(token).transferFrom(owner, address(this), balance);
        } else {
            balance = IGrowToken(token).allocate(amountInERC20);
            require(balance == amountInERC20, 'Allocation failed');
        }
        claims[currentWeekId] = Claims({
            native: Values(address(this).balance, 0),
            erc20: Values(balance, 0),
            erc20Addr: token,
            totalPoints: st.totalPoints,
            active: true
        });
        emit Sorted(claims[currentWeekId], currentWeekId);

        return true;
    }

    // Fetch past claims
    function getData() public view returns(ReadData memory data) {
        data.state = state;
        Claims[] memory _claims = new Claims[](data.state.weekCounter);
        if(data.state.weekCounter > 0) {
            for(uint i = 0; i < data.state.weekCounter; i++) {
                Claims memory _c = claims[i];
                _claims[i] = _c;
            }
            data.claims = _claims;
        }
    } 

        // set tips to the learna contract. Tippers earn points
    function tip() public payable returns(bool) {
        TipperData memory td = isTipper[_msgSender()];
        if(!td.exist) {
            td.exist = true;
            td.index = state.tippers.length;
            state.tippers.push();
        }
        uint amount = msg.value;
        uint minimumTip = 50 ether;
        uint64 point;
        if(amount >= 0) {
            unchecked {
                state.tippers[td.index].totalTipped += amount;
                if(amount >= minimumTip) point = uint64(amount / minimumTip);
            }
        }
        state.tippers[td.index].points += point;

        return true;
    }
    // Get user's data
    function getUserData(address user, uint weekId) public view returns(Profile memory) {
        return users[user][weekId];
    }

}