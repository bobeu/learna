// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { OnlyRoleBase, MsgSender } from "../../peripherals/OnlyRoleBase.sol";
import { IERC20 } from "../../interfaces/IERC20.sol";
import { ErrorLib } from "../../libraries/ErrorLib.sol";
import { Utils } from "../../libraries/Utils.sol";

contract Faucet is OnlyRoleBase {
    using ErrorLib for *;

    struct Tester {
        uint lastColDispensed;
        uint lastBaseDispensed;
        bool isWhitelisted;
    }

    // Amount of base token to dispense
    uint public baseTokenAmount;

    // Amount of collateral token to dispense
    uint public collateralTokenAmount;

    // List of testers
    address[] public testers;

    // Collateral token
    IERC20 public collateralToken;

    // Base token
    IERC20 public baseToken;

    mapping (address => Tester) public testersMap;

    constructor(
        address _roleManager,
        IERC20 _collateralToken,
        IERC20 _baseToken,
        uint _baseTokenAmount, 
        uint _colTokenAmount
    ) OnlyRoleBase(_roleManager) {
        if(_collateralToken == collateralToken) "Collateral token is zero"._throw();
        (address(_roleManager) != address(0), "RoleManager addr is zero");
        collateralToken = _collateralToken;
        baseToken = _baseToken;
        baseTokenAmount = _baseTokenAmount;
        collateralTokenAmount = _colTokenAmount;
    }

    /**
     * @dev Claim test token 
     * @param to : Recipient
     * @notice Two assets are sent to recipient:
     *      1. Base contribution asset
     *      2. Collateral token
     *  Sender must registered and be approved in order to claim test tokens
     */
    function _claimTokens(address to) internal {
        uint colAmt = collateralTokenAmount;
        uint baseAmt = baseTokenAmount;
        Tester memory tester = testersMap[to];

        if(colAmt > 0) {
            uint userBal = IERC20(collateralToken).balanceOf(to);
            if(userBal == 0 && Utils._now() > (tester.lastColDispensed + 24 hours)){
                uint myBal = IERC20(collateralToken).balanceOf(address(this));
                if(myBal >= colAmt) {
                    tester.lastColDispensed = Utils._now();
                    IERC20(collateralToken).transfer(to, colAmt);
                }
            }
        }

        if(baseAmt > 0) {
            uint userBal = IERC20(baseToken).balanceOf(to);
            if(userBal == 0 && Utils._now() > (tester.lastBaseDispensed + 24 hours)){
                uint myBal = IERC20(baseToken).balanceOf(address(this));
                if(myBal >= baseAmt) {
                    tester.lastBaseDispensed = Utils._now();
                    IERC20(baseToken).transfer(to, baseAmt);
                }
            }
        } 

        if(!tester.isWhitelisted) {
            tester.isWhitelisted = true;
            testers.push(to);
        }
        testersMap[to] = tester;
    }

    // User claim test tokens
    function claimTestTokens() public returns(bool) {
        _claimTokens(_msgSender());
        return true;
    }

    // Admin overrides cooldown time to send test tokens to users
    function sendTokens(address to) public onlyRoleBearer returns(bool) {
        _claimTokens(to);
        return true;
    }
    
    /**
     * @dev Admin account (s) can send test tokens to multiple users.
     * @param tos : A list of recipients
     * @notice Sender must have role permission
     */
    function mintBatch(address[] memory tos) public onlyRoleBearer returns(bool) {
        for(uint i = 0; i < tos.length; i++) {
            _claimTokens(tos[i]);
        }
        return true;
    }


    /**
     * Set Collateral token
     * @param newToken : New token contract
     */
    function setCollateralToken(IERC20 newToken) public onlyRoleBearer returns(bool) {
        if(newToken == collateralToken || address(newToken) == address(0)) "New Token is the existing or zero"._throw();
        collateralToken = newToken;
        return true;
    }


    /**
     * Set base token
     * @param newToken : New token contract
     */
    function setBaseToken(IERC20 newToken) public onlyRoleBearer returns(bool) {
        if(newToken == baseToken || address(newToken) == address(0)) "New Token is the existing or zero"._throw();
        baseToken = newToken;
        return true;
    }

    /**
     * Set base amount
     * @param newAmt : New token contract
     */
    function setBaseAmount(uint newAmt) public onlyRoleBearer returns(bool) {
        baseTokenAmount = newAmt;
        return true;
    }

    /**
     * Set Collateral amount
     * @param newAmt : New token contract
     */
    function setCollateralAmount(uint newAmt) public onlyRoleBearer returns(bool) {
        baseTokenAmount = newAmt;
        return true;
    }

}