// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;
 
import { IPyth } from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import { PythStructs } from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import { PythUtils } from "@pythnetwork/pyth-sdk-solidity/PythUtils.sol";
import { Utils } from "../../libraries/Utils.sol";
import { IDIAOracleV2 } from "../../interfaces/IDIAOracleV2.sol";
import { Pool, Common } from "../Pool.sol";

/**
 * @title Price oracle contract that fetches price of a XFI/USD pair as default from the DIA Oracle network. 
 * @author Written by Bobeu, inspired by the DIA Oracle network
 */ 
abstract contract HardhatPriceGetter is Pool {
    using Utils for *;
    
    struct PriceData {
        uint128 latestPrice;
        uint128 timestampOflatestPrice;
        string pair;
        uint8 decimals;
    }

    // Mapping of collateral assets to their corresponding price data
    mapping (address => PriceData) public priceData;
 
    constructor(
        address _roleManager, 
        address _stateManager, 
        address _safeFactory
    ) Pool(_stateManager, _roleManager, _safeFactory, 1e12) {}
    
    /**
     * @dev A function that retreives the price and the corresponding timestamp
     * from the price oracle and save it in the state
    */ 
    function _getPriceInfo() internal pure returns(uint128 price) {
        price = 1e16;
    }

    /**
     * @dev A function that checks if the timestamp of the saved price
     * is older than 60 seconds.
     * @param timestampOflatestPrice: The time price was last updated. 
     * @return inTime - A bool that will be true if the price was updated
     * at most 60 seconds ago, otherwise false.
     */ 
    function _checkPriceAge(uint128 timestampOflatestPrice) internal view returns (bool inTime){
        inTime = (block.timestamp - timestampOflatestPrice) < 60 seconds;
    } 
    
    /**
     * @dev Returns amount of collateral required in a pool.
     * @param unit : EpochId
     * @return collateral Collateral
    */
    function _getCollateralQuote(uint256 unit)
        internal
        view
        returns(uint collateral) 
    { 
        Common.Pool memory pool = _getPool(unit);
        (uint lastPrice, uint8 priceDecimals) = (_getPriceInfo(), 18); 
        if(pool.big.unit > 0) {
            unchecked {
                collateral = Common.Price(
                        lastPrice,
                        priceDecimals
                    ).computeCollateral(
                        uint24(pool.low.colCoverage), 
                        pool.big.unit * pool.low.maxQuorum
                    );
            }
        }
    }

    /**
     * @dev Returns amount of collateral required in a pool.
     * @param unit : EpochId
     */
    function getCollateralQuote(uint256 unit) public  view returns(uint)
    {
        return _getCollateralQuote(unit); 
    }
}