// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { Common } from "../interfaces/Common.sol";
import { ErrorLib } from "./ErrorLib.sol";

library Utils {
    using Address for address;
    using ErrorLib for *;

    /**     @dev Calculation of percentage.
        *   This is how we calculate percentage to arrive at expected value with 
        *   precision.
        *   We choose a base value (numerator as 10000) repesenting a 100% of the principal value. This means if Alice wish to set 
        *   her interest rate to 0.05% for instance, she only need to multiply it by 100 i.e 0.05 * 100 = 5. Her input will be 5. 
        *   Since Solidity do not accept decimals as input, in our context, the minimum value to parse is '0' indicating 
        *   zero interest rate. If user wish to set interest at least, the minimum value will be 1 reprensenting 0.01%.
        *   The minimum interest rate to set is 0.01% if interest must be set at least.
        *   @notice To reiterate, raw interest must be multiplied by 100 before giving as input. 
        *   @param principal : The principal value on which the interest is based. Value should be in decimals.
        *   @param interest : Interest rate. 
        *   
        *   Rules
        *   -----
        *   - Principal cannot be less than base.
        *   - Interest cannot be greater than (2 ^ 16) - 1
    */
    function _getPercentage(
        uint principal, 
        uint16 interest
    )
        internal 
        pure 
        returns (uint _return) 
    {
        uint16 base = _getBase(); 
        if(interest == 0 || principal == 0) return 0;
        if(interest >= type(uint16).max) 'Interest overflow'._throw(); 
        if(principal <= base) 'Principal should be greater than 10000'._throw();
        unchecked {
            _return = (principal * interest) / base;
        }
    }

    /**
     * Percentage base
     */
    function _getBase() internal pure returns(uint16 base) {
        base = 10000;
    }
    
    function _decimals(address asset) internal view returns(uint8 decimals) {
        decimals = IERC20Metadata(asset).decimals();
    }

    /**
     * @dev Computes collateral on the requested loan amount
     * @param ccr : Collateral ratio. Must be multiply by 100 before parsing as input i.e if raw ccr
     *              is 1.2, it should be rendered as 1.2 * 100 = 120.
     * @param price : Price of Collateral token base with decimals.
     * @param loanReqInDecimals : Total requested contribution in USD
     * @notice Based on Simplifi mvp, loans are collaterized in XFI until we add more pairs
     *         in the future.
     * Example: Alice, Bob and Joe formed a band to contribute $100 each where duration is for 
     * 10 days each. Alice being the admin set ccr to 1.5 equivalent to 150% of the total sum 
     * contribution of $300. If the price of XFI as at the time of GF is $0.5/XFI, where XFI decimals
     * is in 18, we calculate the required XFI to stake as follows:   
     *  
     *                    totalContribution *  (10** XFIdecimals)   |                 raw ccr
     *   totalLoanInXFI = --------------------------------------    |    actualCCR = (1.5 * 100) * 100 = 1500
     *                        (xfiPriceIndecimals)                  |
     * 
     *                     totalLoanInXFI * actualCCR
     *        XFINeeded = ----------------------------
     *                             _getBase()
     * 
     *  Therefore, Alice is required to stake 900XFI to GF $300 for 10 days.
     *   
     */
    function computeCollateral(
        Common.Price memory price,
        uint24 ccr,
        uint loanReqInDecimals
    ) 
        internal
        pure 
        returns(uint256 expCol) 
    {
        uint8 minCCR = 100;
        if(price.price == 0) 'Price is zero'._throw();
        if(loanReqInDecimals == 0) 'Loan amount is zero'._throw();
        if(ccr == 0) {
            expCol = loanReqInDecimals;
        } else {
            if(ccr < minCCR) 'Coverage should either be 0 or above 100'._throw();
            unchecked {
                uint48 _ccr = uint48(ccr * 100);
                uint totalLoan = (loanReqInDecimals * (10**price.decimals)) / price.price;
                expCol = (totalLoan * _ccr) / _getBase();
            }
        }
    }

    /**
        @dev Computes maker fee.
        @param makerRate : The amount of fee (in %) charged by the platform on the principal given to a borrower.
            Note : Raw rate must multiply by 100 to get the expected value i.e
            if maker rate is 0.1%, it should be parsed as 0.1 * 100 = 10.
            See `_getPercentage()`.
        @param amount should be in decimals.
    */
    function computeFee(
        uint amount, 
        uint16 makerRate
    ) 
        internal 
        pure 
        returns (uint mFee) 
    {
        mFee = _getPercentage(amount, makerRate);
    }

    /**
     * @dev Compute interest based on specified rate.
     * @param rate : Interest rate.
     * @param principal : Total expected contribution.
     * @param fullDurationInSec : Total duration.
     * 
     * Rules
     * -----
     * - Duration cannot exceed 30days i.e 2592000 seconds uint24 seconds
     */
    function computeInterestsBasedOnDuration(
        uint principal,
        uint16 rate,
        uint32 fullDurationInSec
    )
        internal 
        pure 
        returns(Common.Interest memory it) 
    {
        assert(fullDurationInSec <= _maxDurationInSec());
        it.fullInterest = _getPercentage(principal, rate); // Full interest for fullDurationInSec
        if(it.fullInterest > 0) {
            unchecked {
                it.intPerSec = (it.fullInterest * 1) / fullDurationInSec;
            } 
        }
    }

    /**
     * @dev Max duration : 30Days, presented in seconds
     */
    function _maxDurationInSec() internal pure returns(uint24 max) {
        max = 2592000;
    }

    function _now() internal view returns(uint64 date) {
        date = uint64(block.timestamp);
    }

}