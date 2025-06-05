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
abstract contract CrossfiPriceGetter is Pool {
    using Utils for *;
    
    IDIAOracleV2 public diaOracle;

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
        address oracle,
        address[] memory supportedAssets,
        PriceData[] memory _priceData,
        address _safeFactory,
        uint _minmumLiquidity
    ) Pool(_stateManager, _roleManager, _safeFactory, _minmumLiquidity) {
        require(oracle == address(0));
        require(supportedAssets.length == _priceData.length);
        diaOracle = IDIAOracleV2(oracle);
        for(uint i = 0; i < supportedAssets.length; i++) {
            priceData[supportedAssets[i]] = _priceData[i];
        }
        
    }
 
    
    /**
     * @dev A function that retreives the price and the corresponding timestamp
     * from the price oracle and save it in the state
     * @param asset : Asset
     */ 
    function _getPriceInfo(address asset) internal returns(uint128 price) {
        assert(asset != address(0));
        PriceData memory data = priceData[asset];
        (uint128 latestPrice, uint128 timestampOflatestPrice) = diaOracle.getValue(data.pair);
        data.latestPrice = latestPrice;
        data.timestampOflatestPrice = timestampOflatestPrice;
        priceData[asset] = data;
        price = data.latestPrice; 
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
     * @dev Get price data into external contracts
     * @param asset : Asset for which to fetch price. 
     */
    function _getPrice(address asset) internal returns(uint128 price, uint8 decimals) {
        PriceData memory data = priceData[asset];
        (price, decimals) = (data.latestPrice, data.decimals);
        bool inTime = _checkPriceAge(uint128(data.timestampOflatestPrice));
        if(!inTime) price = _getPriceInfo(asset);
    }
    
    /**
     * @dev Sets a new price data. To test if its working, we update the price field immediately.
     * @param supportedAsset : Asset to set price for. Should be a supported asset
     * @param pair : Asset pair e.g XFI/USD
     * @param priceDecimals : Price offset decimals/zeros
     * @notice Only account with role permissioned is allowed to access this function
    */
    function setAssetData(address supportedAsset, string memory pair, uint8 priceDecimals) public onlyRoleBearer returns(bool) {
        priceData[supportedAsset] = PriceData(0, 0, pair, priceDecimals);
        _getPriceInfo(supportedAsset);
        return true;
    }
    
    /**
     * @dev Returns amount of collateral required in a pool.
     * @param unit : EpochId
     * @return collateral Collateral
    */
    function _getCollateralQuote(uint256 unit)
        internal
        returns(uint collateral) 
    { 
        Common.Pool memory pool = _getPool(unit);
        (uint lastPrice, uint8 priceDecimals) = _getPrice(address(pool.addrs.colAsset)); 
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

    // /**
    //  * @dev  Updated state with the quotes so it can later be fetched.
    //  * @param unit : Unit contribution
    //  * @notice Only contributors in the pool with unit key can update quotes.
    //  */
    // function updateQuote(uint unit, address colAsset) public returns(bool) {
    //     (uint lastPrice, uint8 priceDecimals) = _getPrice(colAsset);
    //     if(unit > 0) {
    //         unchecked { 
    //             uint collateral = Common.Price( 
    //                     lastPrice,
    //                     priceDecimals
    //                 ).computeCollateral(
    //                     uint24(150), 
    //                     unit * 4
    //                 );
    //             priceData[colAsset].any = collateral;
    //         }
    //     }
    //     return true;
    // }

}