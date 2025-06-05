// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { OnlyRoleBase } from "../peripherals/OnlyRoleBase.sol";
import { ISupportedAsset } from "../interfaces/ISupportedAsset.sol"; 
import { IERC20 } from "../interfaces/IERC20.sol"; 
import { ErrorLib } from "../libraries/ErrorLib.sol";

contract SupportedAssetManager is ISupportedAsset, OnlyRoleBase {
  using ErrorLib for *;

  struct Asset {
    bool isWrappedAsset;
    bool isSupported;
  }

  struct ConstructorArg {
    address asset;
    bool isWrappedAsset;
  }

  // Supported assets
  SupportedAsset[] private assets;

  /**
   * @dev Mapping assets address to bool i.e Assets must be contract account
   * and must be supported
   */
  mapping(address => Asset) public supportedAssets;


  mapping(address => bool) public listed;

  /**
   * 
   * @param _assets : Supported assets
   * @param _roleManager : Role manager contract
  */
  constructor(
    ConstructorArg[] memory _assets,
    address _roleManager
  )
    OnlyRoleBase(_roleManager) 
  {
    for(uint i = 0; i < _assets.length; i++) {
      address asset = _assets[i].asset;
      if(asset != address(0)) _supportAsset(Asset(_assets[i].isWrappedAsset, true), asset);
    }
  }

  /** 
   * @dev Support a new asset
   * Note: OnlyRoleBase action
   * @param assetAddr : Asset to add to list of supported asset
   * @param _isWrappedAsset : Whether asset is Wrapped or not
   */ 
  function supportAsset(address assetAddr, bool _isWrappedAsset) 
    public 
    onlyRoleBearer
  {
    if(supportedAssets[assetAddr].isSupported) 'Already supported'._throw();
    _supportAsset(Asset(_isWrappedAsset, true), assetAddr); 
  }

  // Support an asset
  function _supportAsset(Asset memory _asset, address assetAddr) private {
    if(!listed[assetAddr]){
      listed[assetAddr] = true;
      assets.push(SupportedAsset(
        assetAddr, 
        IERC20(assetAddr).name(), 
        IERC20(assetAddr).symbol(),
        _asset.isWrappedAsset
      ));
    }
    if(!_asset.isSupported){
      _asset.isSupported = true;
    }
    supportedAssets[assetAddr] = _asset;
  }

  /**
   * @dev Unsupports an asset
   * Note: Only-owner action
   * @param assetAddr : Removes an asset from the list of supported asset
   */
  function unsupportAsset(
    address assetAddr
  ) 
    public 
    onlyRoleBearer
  {
    if(!supportedAssets[assetAddr].isSupported) 'Already unsupported'._throw();
    supportedAssets[assetAddr].isSupported = false;
  }

  function _isAssetSupported(address _asset) internal view returns(bool) {
    return supportedAssets[_asset].isSupported;
  }

  /**
   * @dev Check if an asset is supported
   */
  function isSupportedAsset(address _asset) external view returns(bool) {
    return _isAssetSupported(_asset);
  }

  /**
   * @dev Check if an asset is supported
   */
  function isWrappedAsset(address assetAddr) external view returns(bool) {
    return supportedAssets[assetAddr].isWrappedAsset;
  }

  /**
   * @dev Returns a list of supported assets
   */
  function getSupportedAssets() public view returns(SupportedAsset[] memory _assets) {
    _assets = assets;
    return _assets;
  }

  function getDefaultSupportedCollateralAsset(uint index) external view returns(address){
    require(index < assets.length, "Index out of bound"); 
    return assets[index].id;
  }

}