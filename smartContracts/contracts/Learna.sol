// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IGrowToken } from "./IGrowToken.sol";

contract Learna is Ownable, ReentrancyGuard {
    event ClaimedWeeklyReward(address indexed user, Profile profile);
    event RegisteredForWeeklyEarning(address[] indexed users, uint weekId);
    event UnregisteredForWeeklyEarning(address[] indexed users, uint weekId);
    event Sorted(Claims _claims, uint _weekId);

    // Claims data
    struct Claims {
        uint native;
        uint erc20;
        address erc20Addr;
        uint totalWeeklyClaimers;
    }

    // User's profile data
    struct Profile {
        bool isApproved;
        uint amountClaimedInNative;
        uint amountClaimedInERC20;
        bool claimed;
    }

    // Readonly data
    struct ReadData {
        uint activeLearners;
        uint weekCounter;
        uint minimumSignupFee;
        Claims[] claims;
    }

    // Total active learners
    uint private activeLearners; 

    // Weeks already passed
    uint private weekCounter;

    // Minimum sign up fee
    uint private minimumSignupFee;

    /**
     * @dev Mapping of user address to profile data
     * @notice An user can have previous claims
    */
    mapping(address user => mapping(uint weekId => Profile)) private users;

    //weekly claims
    mapping(uint weekId => Claims) private claims;

    // Only registered users
    modifier onlyApproved(uint weekId) {
        // require(weekId > 0, 'Invalid weekId');
        require(users[_msgSender()][weekId].isApproved, 'Only approved users');
        _;
    }

    constructor(uint _minSignupFee) Ownable(_msgSender()) {
        minimumSignupFee = _minSignupFee;
    }

    receive() external payable {}
 
    /**
     * @dev Register users for weekly reward
     * @param _users : List of users 
     * @notice Only owner function
     */
    function registerUsersForWeeklyEarning(address[] memory _users) public onlyOwner returns(bool) {
        uint weekId = weekCounter;
        for(uint i = 0; i < _users.length; i++) {
            address user = _users[i];
            if(user != address(0)) {
                bool isApproved = users[user][weekId].isApproved;
                if(!isApproved) {
                    users[user][weekId].isApproved = true;
                }
            }
        }
        emit RegisteredForWeeklyEarning(_users, weekId);
        return true;
    }

    /**
     * @dev Register users for weekly reward
     * @param _users : List of users 
     * @param weekId: Week id 
     * @notice Only owner function
     */
    function unregisterUsersForWeeklyEarning(address[] memory _users, uint weekId) public onlyOwner returns(bool) {
        for(uint i = 0; i < _users.length; i++) {
            address user = _users[i];
            if(user != address(0)) {
                bool isApproved = users[user][weekId].isApproved;
                if(isApproved) {
                    users[user][weekId].isApproved = false;
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
     * @dev claim reward
     * @param weekId : Week id for the specific week user want to withdraw from
     * @notice Users cannot claim for the current week. They can only claim for the week that has ended
     */
    function claimWeeklyReward(uint weekId) public onlyApproved(weekId) nonReentrant returns(bool) {
        require(weekId <= weekCounter, "Week frontrun not allowed");
        address sender = _msgSender();
        require(!users[sender][weekId].claimed, 'Already claimed');
        Claims memory claim = claims[weekId];
        uint ercAmount = claim.erc20;
        uint nativeClaim = claim.native;
        unchecked {
            if(ercAmount > 0 && ercAmount >= claim.totalWeeklyClaimers ) ercAmount = ercAmount / claim.totalWeeklyClaimers ;
            if(nativeClaim > 0 && nativeClaim >= claim.totalWeeklyClaimers ) nativeClaim = nativeClaim / claim.totalWeeklyClaimers ;
        }
        users[sender][weekId] = Profile({
            isApproved: true,
            amountClaimedInNative: nativeClaim,
            amountClaimedInERC20: ercAmount,
            claimed: true
        });
        _claimErc20(sender, ercAmount, IERC20(claim.erc20Addr));
        _claimNativeToken(sender, nativeClaim);

        emit ClaimedWeeklyReward(sender, users[sender][weekId]);
        return true;
    }

    /**
     * @dev Allocate weekly earnings
     * @param token: ERC20 token address to share from. Could be any ERC20 compatible token.
     * @param owner : Account sending weekly tippings in ERC20 type asset.
     * @param amountInERC20 : Amount of ERC20 token to allocate
     * @notice We first for allowance of owner to this contract. If allowance is zero, we assume allocation should come from
     * the GROW Token.
    */
    function sortWeeklyReward(address token, address owner, uint amountInERC20) public onlyOwner returns(bool) {
        uint weekId = weekCounter;
        weekCounter ++;
        uint balance = IERC20(token).allowance(owner, address(this));
        if(balance > 0) {
            IERC20(token).transferFrom(owner, address(this), balance);
        } else {
            balance = IGrowToken(token).allocate(amountInERC20);
            require(balance == amountInERC20, 'Allocation failed');
        }
        claims[weekId] = Claims({
            native: address(this).balance,
            erc20: balance,
            erc20Addr: token,
            totalWeeklyClaimers: activeLearners
        });
        emit Sorted(claims[weekId], weekId);

        return true;
    }

    /**
     * @dev Set minimum sign up fee. 
     * @param newFee: New fee
     * @notice Only owner function
     */
    function setMinimumSignupFee(uint newFee) public onlyOwner returns(bool) {
        minimumSignupFee = newFee;
        return true;
    }

    // Fetch past claims
    function getData() public view returns(ReadData memory data) {
        data.activeLearners = activeLearners;
        data.weekCounter = weekCounter;
        data.minimumSignupFee = minimumSignupFee;
        Claims[] memory _claims = new Claims[](data.weekCounter);
        if(data.weekCounter > 0) {
            for(uint i = 0; i < data.weekCounter; i++) {
                Claims memory _c = claims[i];
                _claims[i] = _c;
            }
            data.claims = _claims;
        }
    }

}