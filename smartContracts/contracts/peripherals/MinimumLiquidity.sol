// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { ErrorLib } from "../libraries/ErrorLib.sol";
import { ERC20Manager } from "./ERC20Manager.sol";

abstract contract MinimumLiquidity is ERC20Manager {
    using ErrorLib for *;

    // Minimum liquidity a provider can make
    uint private minimumLiquidity;

    // ============= Constructor ================
    constructor(
        address _statetManager, 
        address _roleManager, 
        uint _minmumLiquidity
    ) ERC20Manager(_statetManager, _roleManager){
        minimumLiquidity = _minmumLiquidity;
    }

    /**
     * @dev Set minimum liquidity. 
     * @param _minLiquidity : Minimum liquidity
     * @notice Only accounts with rolebearer access are allowed
     */
    function setMinimumLiquidity(uint _minLiquidity) public onlyRoleBearer {
        if(_minLiquidity == minimumLiquidity) 'Same param'._throw();
        minimumLiquidity = _minLiquidity;
    }

    function getMinimumLiquidity() public view returns(uint) {
        return minimumLiquidity;
    }
}