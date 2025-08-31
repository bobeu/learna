// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Common } from "../interfaces/Common.sol";

library UtilsV3 {
    using SafeERC20 for IERC20;
    
    /**@dev Calculate the rate
     * @param fullPoints : Full or aggregate share/points
     * @param unitPoint : Point her user
     * @param principal : Principal amount
     * @param decimals : Number of leading zeros on which the principal is based ex. Celo is based in 18 zeros
     * @notice Rate is returned in %, and we use 1 ether i.e 1e18 as the full percentage i.e 100%
    */
    function calculateShare(
        uint96 fullPoints, 
        uint64 unitPoint,
        uint principal,
        uint8 decimals
    )
        internal
        pure 
        returns (uint share) 
    {
        if(fullPoints == 0 || unitPoint == 0 || principal == 0) return 0;
        require(fullPoints >= unitPoint, 'Invalid principal');
        unchecked {
            uint base = 10 ** decimals;
            share = (((unitPoint * base) / fullPoints) * principal) /base;
        } 
    }

    /**
     * @dev Assign 2% of payouts to the dev
     * @param _token : ERC20 token to be used for payout
     * @param platformIn : Platform token to be used for payout
     * @param erc20In : ERC20 token to be used for payout
     * @param nativeIn : Native token to be used for payout
     * @return nOut : Celo balance of this contract after dev share
     * @return eOut : ERC20 balance of this contract after dev share
     * @return pOut : Platform balance of this contract after dev share
     */
    function _rebalance(address _token, uint256 nativeIn, uint256 erc20In, uint256 platformIn) internal returns(uint256 nOut, uint256 eOut, uint256 pOut) {
        uint8 devRate = 2;
        nOut = nativeIn;
        eOut = erc20In;
        pOut = platformIn;
        uint devShare;
        unchecked {
            if(nOut > 0 && (address(this).balance >= nOut)) {
                devShare = (nOut * devRate) / 100;
                _sendValue(devShare, dev);
                nOut -= devShare;
            }
            if(eOut > 0 && (IERC20(_token).balanceOf(address(this)) >= eOut)) {
                devShare = (eOut * devRate) / 100;
                _sendErc20(dev, devShare, IERC20(_token));
                eOut -= devShare; 
            }
            if(pOut > 0 && (token.balanceOf(address(this)) >= pOut)) {
                devShare = (pOut * devRate) / 100;
                _sendErc20(dev, devShare, token);
                pOut -= devShare; 
            }
        }
    }

    /**
     * @dev Claim ero20 token
     * @param recipient : Recipient
     * @param amount : Amount to transfer
     * @param token : token contract
     */
    function _sendErc20(address recipient, uint amount, address token) internal {
        if(token != address(0)) {
            uint balance = IERC20(token).balanceOf(address(this));
            if(balance > 0 && balance >= amount) {
                IERC20(token).safeTransfer(recipient, amount);
            }
        }
    }

    /**
     * Forward value to a specific address
     * @param amount : Amount to forward
     * @param to : Address to forward the fee to
     */
    function _sendValue(address to, uint amount) internal {
        if(amount > 0) {
            if(address(this).balance >= amount){
                if(to != address(0)){
                    (bool s,) = to.call{value: amount}('');
                    require(s, "Failed");
                }
            }
        }
    }

    
    /**
     * @dev Assign 5% of payouts to the dev
     * @param _token : ERC20 token to be used for payout
     * @param platformIn : Platform token to be used for payout
     * @param erc20In : ERC20 token to be used for payout
     * @param nativeIn : Native token to be used for payout
     * @return nOut : Celo balance of this contract after dev share
     * @return eOut : ERC20 balance of this contract after dev share
     * @return pOut : Platform balance of this contract after dev share
     */
    function _rebalance(address dev, Common.ShareOut memory in) internal returns(Common.ShareOut memory out) {
        uint8 devRate = 5;
        out = in;
        uint devShare;
        unchecked {
            if(out.native > 0 && (address(this).balance >= out.native)) {
                devShare = (out.native * devRate) / 100;
                _sendValue(dev, devShare);
                out.native -= devShare;
            }
            if(out.erc20 > 0 && (IERC20(out._token).balanceOf(address(this)) >= out.erc20)) {
                devShare = (out.erc20 * devRate) / 100;
                _sendErc20(dev, devShare, out.token);
                out.erc20 -= devShare; 
            }
        }
    }   
}