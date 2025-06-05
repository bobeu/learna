// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IFactory } from '../../interfaces/IFactory.sol';
import { IStateManager } from '../../interfaces/IStateManager.sol';
import { ISafe } from "../../interfaces/ISafe.sol";
import { IERC20 } from "../../interfaces/IERC20.sol";
import { HardhatPriceGetter, Utils, Common  } from "../../peripherals/priceGetter/HardhatPriceGetter.sol";
// import { Analytics } from "../../peripherals/Analytics.sol";

/** 
    * @title FlexpoolFactory
    * @author Simplifi (Bobeu)
    * @notice FlexpoolFactory enables peer-funding magic. Participants of each pool are referred to 
    * contributors. There is no limit to the amount that can be contributed except for zer0 value. Users can single-handedly run
    * a pool (where anyone is free to participate) or collectively with friends and family or peer operate a permissioned pool 
    * where participation is restricted to the preset members only.
    * Users can use providers strategy to finance their quota if they can't afford the unit contribution. They can select multiple
    * providers if the provider balance cannot the amount they wish to borrow. If this is the case, the selected providers are 
    * entitled to earn interest on the amount they provide.
    * When paying back, the contributor will repay the full loan with interest but halved for other contributors.  
*/
contract HardhatBased is IFactory, HardhatPriceGetter {
    using Utils for *;

    /** 
     * ================ Constructor ==============
    */
    constructor(
        address _roleManager,
        address _stateManager, 
        address _safeFactory
    ) 
        HardhatPriceGetter(_roleManager, _stateManager, _safeFactory)
    {}

    receive() external payable {}

    /**
        * @dev Create a pool internally
        * @param users : List of participating accounts
        * @param unit : Unit contribution
        * @param maxQuorum : Maximum number of contributors that can participate
        * @param durationInHours : Maximum duration in hours each borrower can retain the loan
        * @param colCoverage : Ration of collateral coverage or index required as cover for loan
        * @param isPermissionless : Whether to create a permissionless or permissioned pool.
        * @param colAsset : An ERC20-compatible asset to use as collateral currency 
        * @notice users list should be a list of participating accounts if it is permissioned including the
        * creator being the first on the list. But the list can be empty if it is permissionless.
    */
    function createPool( 
        address[] memory users,
        uint unit,
        uint8 maxQuorum,
        uint16 durationInHours,
        uint24 colCoverage,
        bool isPermissionless,
        address colAsset
    ) public whenNotPaused returns(bool) {
        Common.Pool memory pool = _createPool(Common.CreatePoolParam(users, _msgSender(), unit, maxQuorum, durationInHours, colCoverage, isPermissionless? Common.Router.PERMISSIONLESS : Common.Router.PERMISSIONED, colAsset));
        _awardPoint(users[0], 0, 5, false);
        // _updateAnalytics(0, unit, 0, isPermissionless);
        emit Common.PoolCreated(pool);
      
        return true;
    }

    /**
     * @dev launch a default permissionless pool
     * @param user : Target user
     * @param unit : Unit contribution
     * @param _providers : A list of external fund providers.
     * @return pool : Current pool
     * @notice Defaults value are set as
     * - MaxQuorum - 2
     * - Duration - 72 hours i.e 3 days
     * - Collateral coverage - 120
     */
    function _launchDefault(address user, uint unit, Common.Provider[] memory _providers) internal returns(Common.Pool memory pool) {
        address[] memory users = new address[](1);
        users[0] = user;
        address defaultColAsset = _getVariables().assetManager.getDefaultSupportedCollateralAsset(0);
        pool = _createPool(Common.CreatePoolParam(users, user, unit, 2, 72, 120, Common.Router.PERMISSIONLESS, defaultColAsset));
        ISafe(pool.addrs.safe).registerProvidersTo(_providers, user, pool.big.recordId); 
        _awardPoint(users[0], 0, 5, false);
        // _updateAnalytics(0, unit, 0, pool.router == Common.Router.PERMISSIONLESS);

        emit Common.PoolCreated(pool);
    }

    /**
     * @dev Contributors can join a pool through a provider is they wish to borrow to finance the unit contribution.
     *      If the unit is not taken, we add them to the pool otherwise a new pool will be launched.
     * @param providers : List of providers that lend to the borrower
     * @param borrower : Account address of the borrower
     * @param unit : Amount borrowed will automatically be the unit contribution
     * @notice By default, maxQuorum is set to 2 using this method. Users can immediately change the quorum
     * to desired value otherwise it will not be possible if another contributor joins to complete the quorum.
     * - durationInHrs is set to 72 hours by default.
     * - colCoverage is set to 120 by default.
     * Only accounts with the roleBearer are allowed i.e Ex. Providers contract
     * If an user is contributing via the provider, we ensure the privacy of permissioned group is preserved.
     */
    function contributeThroughProvider(
        Common.Provider[] memory providers, 
        address borrower, 
        uint unit
    ) external onlyRoleBearer whenNotPaused returns(bool)
    {
        Common.Pool memory pool; 
        if(_getPool(unit).status == Common.Status.TAKEN){
            pool = _getPool(unit);
            pool = _joinAPool(unit, borrower, pool);
            _setPool(pool, pool.big.unitId);
            // _updateAnalytics(1, unit, 0, pool.router == Common.Router.PERMISSIONLESS);
            emit Common.NewContributorAdded(pool);
        } else {
            pool = _launchDefault(borrower, unit, providers);
        }
        _setProviders(providers, borrower, pool.big.unitId);
        return true;
    }

    /**
     * @dev Add a contributor to a poool
     * @param : Unit contribution
     */
    function contribute(uint unit) public whenNotPaused returns(bool) {
        Common.Pool memory pool = _getPool(unit);
        pool = _joinAPool(unit, _msgSender(), pool);
        _setPool(pool, pool.big.unitId);
        // _updateAnalytics(1, unit, 0, pool.router == Common.Router.PERMISSIONLESS);
        emit Common.NewContributorAdded(pool);

        return true;
    }

    /**
     * @dev Get finance
     * @param unit : Unit contribution
     * @return bool : Success or Failure
     * @notice : To get finance, the unit contribution must be active. In the event the expected contributor failed to 
     * call, we swap their profile for the current msg.sender provided the grace period of 1hr has passed.
    */
    function getFinance(uint256 unit) public payable _requireUnitIsActive(unit) whenNotPaused returns(bool) {
        _checkStatus(_msgSender(), unit, true);
        Common.Pool memory pool = _getPool(unit);
        uint collateral = getCollateralQuote(unit);
        Common.Contributor memory profile = _getExpected(unit, pool.low.selector);
        require(pool.stage == Common.Stage.GET, '14');
        require(pool.low.allGh < pool.low.maxQuorum, '20');
        unchecked {
            require(pool.big.currentPool >= (pool.big.unit * pool.low.maxQuorum), '15');
            if(_now() > profile.turnStartTime + 1 hours){
                if(_msgSender() != profile.id) {
                    profile = _swapContributors(unit, _msgSender(), _getSlot(_msgSender(), pool.big.unitId), profile);
                }
            } else {
                require(_msgSender() == profile.id, '16');
            }
            pool.low.allGh += 1;
        }
        pool.addrs.lastPaid = profile.id;
        // _updateAnalytics(2, pool.big.currentPool, collateral, pool.router == Common.Router.PERMISSIONLESS);
        IStateManager.StateVariables memory vars = _getVariables();
        _checkAndWithdrawAllowance(IERC20(pool.addrs.colAsset), profile.id, pool.addrs.safe, collateral);
        ISafe(pool.addrs.safe).getFinance(profile.id, vars.baseAsset, pool.big.currentPool, pool.big.currentPool.computeFee(uint16(vars.makerRate)), collateral, pool.big.recordId);
        (pool, profile) = _completeGetFinance(pool, collateral, profile);
        _setContributor(profile, pool.big.unitId, uint8(_getSlot(pool.addrs.lastPaid, pool.big.unitId).value), false);
        _setPool(pool, pool.big.unitId);

        emit Common.GetFinanced(pool);

        return true;
    }

    /**
     * @dev Payback. For detailed documentation, see _payback
     * @param unit : Unit contribution
     */
    function payback(uint unit) public whenNotPaused returns(bool) {
        emit Common.Payback(
            _payback(unit, _msgSender(), false, address(0))
        );

        return true;
    }

    /**
        @dev Liquidates a borrower if they have defaulted in repaying their loan.
        - If the current beneficiary defaults, they're liquidated.
        - Their collateral balances is forwarded to the liquidator. Liquidator also takes the full 
            responsibilities of the providers if any.
        - Liquidator must not be a participant in pool at `unitId. We use this 
            to avoid fatal error in storage.
        @param unit : Unit contribution.
    */
    function liquidate(uint256 unit) public whenNotPaused returns(bool) {
        (Common.Contributor memory _defaulter, bool isDefaulted, Common.Slot memory slot) = _enquireLiquidation(unit);
        require(isDefaulted, '17');
        address liquidator = _msgSender() ;
        _checkStatus(liquidator, unit, false);
        _replaceContributor(liquidator, _getPool(unit).big.unitId, slot, _defaulter.id);
        assert(liquidator != _defaulter.id);
        _setLastPaid(liquidator, unit); 
        emit Common.Payback(
            _payback(unit, liquidator, true, _defaulter.id)
        );
        return true;
    }

    /**
        @dev Cancels a pool. Only pool with one contributor can be close.
        @param unit : Unit contribution.
        @notice : Only the creator of a pool can close it provided the number of contributors does not exceed one.
    */
    function closePool(uint256 unit) public whenNotPaused _requireUnitIsActive(unit) returns(bool){
        Common.Pool memory pool = _getPool(unit);
        address creator = _msgSender();
        require(creator == pool.addrs.admin, '18');
        bool isPermissionLess = pool.router == Common.Router.PERMISSIONLESS;
        isPermissionLess? require(pool.low.userCount == 1, '19') : require(pool.big.currentPool == pool.big.unit, '19');
        // _updateAnalytics(4, pool.big.unit, 0, isPermissionLess);
        _awardPoint(creator, 0, 5, true);
        pool.stage = Common.Stage.CANCELED;
        _shufflePool(pool); 
        ISafe(pool.addrs.safe).cancel(creator, _getVariables().baseAsset, pool.big.unit, pool.big.recordId);

        emit Common.Cancellation(unit);
        return true;
    }

    // /**
    //     * @dev Return providers associated with the target account
    //     * @param target : Target account
    //     * @param unitId : Record id
    // */
    // function getContributorProviders(address target, uint unitId) external view returns(Common.Provider[] memory result){
    //     return  _getContributorProviders(target, unitId);
    // }
   
    /**
     * @dev Fetch current pool
     * @param unit : Unit contribution
     */
    function getPool(uint unit) external view returns(Common.Pool memory) {
       return _getPool(unit);
    }

     /**@dev Return contract data. At any point in time, currentEpoches will always equal pastEpoches*/
    function getFactoryData() public view returns(Common.ViewFactoryData memory data) {
        // data.analytics = _getAnalytics();
        data.makerRate = uint16(_getVariables().makerRate);
        data.pastPools = getRecords();
        (uint96 currentEpoches, uint96 pastEpoches) = _getCounters();
        data.currentEpoches = currentEpoches;
        data.recordEpoches = pastEpoches;
        Common.ReadPoolDataReturnValue[] memory rdrs = new Common.ReadPoolDataReturnValue[](currentEpoches);
        for(uint96 i = 0; i < currentEpoches; i++){
            rdrs[i] = _getPoolData(_getPoolWithUnitId(i + 1)); 
        }
        data.currentPools = rdrs;
        return data;
    }

}
