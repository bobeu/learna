// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { IStateManager, ISupportedAsset, IERC20, IPoint } from "../interfaces/IStateManager.sol";
import { Utils } from "../libraries/Utils.sol";
import { OnlyRoleBase } from "../peripherals/OnlyRoleBase.sol";

contract StateManager is OnlyRoleBase, IStateManager {
     
    // State variables
    StateVariables private stateVariables;

    constructor(
        address feeTo, 
        uint16 makerRate,
        address roleManager,
        address assetManager, 
        address baseAsset,
        address pointFactory

    ) OnlyRoleBase(roleManager) {
        require(feeTo != address(0), "FeeTo");
        require(makerRate <= Utils._getBase(), "MakerRate");
        require(assetManager != address(0), "AssetManager");
        require(baseAsset != address(0), "BaseAsset");
        require(pointFactory != address(0), "PointFactory");
        stateVariables.assetManager = ISupportedAsset(assetManager);
        stateVariables.baseAsset = IERC20(baseAsset);
        stateVariables.feeTo = feeTo;
        stateVariables.makerRate = makerRate;
        stateVariables.pointFactory = IPoint(pointFactory);  
    }

    // Sets state variable
    function setState(StateVariables memory arg) public onlyRoleBearer returns(bool) {
        StateVariables memory st = stateVariables;
        if(arg.feeTo != address(0) && arg.feeTo != st.feeTo) stateVariables.feeTo = arg.feeTo;
        if(arg.makerRate > 0 && arg.makerRate < Utils._getBase()) stateVariables.makerRate = arg.makerRate;
        if(address(arg.assetManager) != address(0) && arg.assetManager != st.assetManager) stateVariables.assetManager = arg.assetManager;
        if(address(arg.baseAsset) != address(0) && arg.baseAsset != st.baseAsset) stateVariables.baseAsset = arg.baseAsset;
        if(address(arg.pointFactory) != address(0) && arg.pointFactory != st.pointFactory) stateVariables.pointFactory = arg.pointFactory;
        return true; 
    }

    // Return state variables
    function getStateVariables() external view returns(StateVariables memory) {
        return stateVariables;
    }

}