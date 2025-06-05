// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;
 
import { Utils } from "../../libraries/Utils.sol";
import { Pool, Common } from "../Pool.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title Price oracle contract that fetches price of a CELO/USD pair as default from the Pyth network. It has a 
 * function to set a new asset pair to fetch price for.
 * @author Written by Bobeu,inspired by the Chainlink team
 * @notice Each asset has a priceFeed Id that ae parsed either during construction or using designated function. 
 * 
 * ERROR CODE
 * ==========
 * C1 - Data.feedAddr is zero
 */ 
abstract contract CeloPriceGetter is Pool {
    using Utils for *;

    struct PriceData {
        string pair;
        uint8 decimals;
        address feedAddr;
        uint any;
    }

    // Mapping of collateral assets to their corresponding price data
    mapping (address => PriceData) private priceData;

    /**
     * @param _priceData Price retrieval info
    */  
    constructor(
        address _roleManager,
        address _stateManager,
        address[] memory supportedAssets,
        PriceData[] memory _priceData,
        address _safeFactory,
        uint _minmumLiquidity
    ) Pool(_stateManager, _roleManager, _safeFactory, _minmumLiquidity) {
        require(supportedAssets.length == _priceData.length);
        for(uint i = 0; i < supportedAssets.length; i++) {
            priceData[supportedAssets[i]] = _priceData[i];
            (uint testPrice, ) = _getPrice(supportedAssets[i]);
            priceData[supportedAssets[i]].any = testPrice; 
        }
    }
  
    /**
     * @dev Fetch the price of an asset from the Pyth network
     * @param asset : The asset for which to fetch price
     */
    function _getPrice(address asset) internal view returns(uint price, uint8 decimals) {
        assert(asset != address(0));
        PriceData memory data = priceData[asset];
        require(data.feedAddr != address(0), 'C1');
        decimals = data.decimals;
        (,int answer,,,) = AggregatorV3Interface(data.feedAddr).latestRoundData();
        price = uint(answer);
    }

    /**
     * @dev Sets a new price data
     * @param supportedAsset : Asset to set price for. Should be a supported asset
     * @param pair : Asset pair e.g CELO/USD
     * @param pairAddress: Paired addresss/id
     * @param priceDecimals : Price offset decimals/zeros
     * @notice Only account with role permissioned is allowed to access this function
    */
    function setAssetData(address supportedAsset, string memory pair, address pairAddress, uint8 priceDecimals) public onlyRoleBearer returns(bool) {
        priceData[supportedAsset] = PriceData(pair, priceDecimals, pairAddress, 0);
        return true;
    }
    
    /**
     * @dev Returns amount of collateral required in a pool.
     * @param unit : EpochId
     * @return collateral Collateral
    */
    function getCollateralQuote(uint256 unit)
        public
        view
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

    /**
     * @dev return price data object. 
     * @param collateralAsset : Collateral asset
     * @notice The key to parse is the mapped collateral asset
     */
    function getPriceData(address collateralAsset) public view returns(PriceData memory) {
        return priceData[collateralAsset];
    } 
 

}