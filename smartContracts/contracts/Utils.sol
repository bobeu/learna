// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

library Utils {
    /**@dev Calculate the rate
     * @param fullPoints : Full or aggregate share/points
     * @param unitPoint : Point her user
     * @param principal : Principal amount
     * @param decimals : Number of leading zeros on which the principal is based ex. Celo is based in 18 zeros
     * @notice Rate is returned in %, and we use 1 ether i.e 1e18 as the full percentage i.e 100%
    */
    function calculateShare(
        uint96 fullPoints, 
        uint16 unitPoint,
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
    
}