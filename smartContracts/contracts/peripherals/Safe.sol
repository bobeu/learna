// SPDX-License-Identifier: MIT 

pragma solidity 0.8.24;

import { ReentrancyGuard } from "@thirdweb-dev/contracts/external-deps/openzeppelin/security/ReentrancyGuard.sol";
import { IERC20 } from "../interfaces/IERC20.sol";
import { IProviders } from "../interfaces/IProviders.sol";
import { IFactory } from "../interfaces/IFactory.sol";
import { ISafe } from "../interfaces/ISafe.sol";
import { Common } from "../interfaces/Common.sol";
import { OnlyRoleBase } from "../peripherals/OnlyRoleBase.sol";
import { ErrorLib } from "../libraries/ErrorLib.sol";

contract Safe is ISafe, OnlyRoleBase, ReentrancyGuard {
    using ErrorLib for *;

    // Number of contributors currently operating this safe
    uint private userCount;

    // Total fee collected
    uint private aggregateFee;

    // Amount to date paid by contributors
    uint256 private totalAmountIn;

    // Fee Receiver
    address public immutable feeTo;

    // Simplifi's multiSig account that can prevent indefinite fund lock
    address public multiSig;

    IProviders private providersContract;

    // Mapping of user to record Id to access
    mapping(address => mapping(uint96 => bool)) private access;

    // Mapping of users to recordId to Collateral
    mapping(address => mapping(uint96 => uint256)) private collateralBalances;

    // Mapping of contributors to amount paid as debt serviced
    mapping(address contributor => uint) public paybacks;

    //mapping showing contributors that borrow from providers to create a pool only 
    mapping(address => mapping(uint96 => Common.Provider[])) private providers;

    ///@dev Only users with access role are allowed
    modifier hasAccess(address user, uint96 recordId) {
        if (!access[user][recordId]) 'User does not have access'._throw();
        _;
    }

    /** ========== Constructor ===============
     * @param _roleManager : RoleBase manager contract
     * @param _feeTo : Fee receiver account
     */
    constructor(
        address _roleManager, 
        address _feeTo, 
        address _providers,
        address _multiSig
    ) OnlyRoleBase(_roleManager) {
        feeTo = _feeTo;
        providersContract = IProviders(_providers);
        require(_multiSig != address(0), "MultiSig is zero");
        multiSig = _multiSig;
    }

    receive() external payable {}

    /**
     * @dev Registers providers to the contributor's profile. This is a list of providers that finance the contributor
     * @param _providers : A list of providers
     * @param contributor : Current user
     * @param recordId : Record Id
     */
    function registerProvidersTo(Common.Provider[] memory _providers, address contributor, uint96 recordId) external onlyRoleBearer {
        for(uint i = 0; i < _providers.length; i++) {
            providers[contributor][recordId].push(_providers[i]);
        }
    }

    /**
     * @dev Registers new user
     * @param user New user

    */
    function _addUser(address user, uint96 recordId) private {
        require(!access[user][recordId], 'Has access');
        access[user][recordId] = true;
    }

    /**
     * @dev Implementation of ISafe.addUp
     * See ISafe.addUp
     */
    function addUp(address user, uint96 recordId) external onlyRoleBearer returns (bool) {
        unchecked {
            userCount++;
        }
        _addUser(user, recordId);
        return true;
    }

    /**
     * @dev UnLocks collateral balances
     * @param user Existing user

    */
    function _removeUser(address user, uint96 recordId) private {
        assert(access[user][recordId]);
        if(userCount > 0) {
            unchecked {
                userCount--;
            }
        }
        access[user][recordId] = false;
    }

    /**
     * @dev End the current epoch
     * @param baseAsset : AssetBase
     * @param data : Contributors data
     * @param unit : Unit contribution
     */
    function _tryRoundUp(
        IERC20 baseAsset, 
        uint unit,
        Common.Contributor[] memory data,
        Common.Provider[] memory _providers
    ) internal {
        uint erc20Balances = IERC20(baseAsset).balanceOf(address(this));
        uint fees = aggregateFee;
        unchecked {
            if(erc20Balances > 0) {
                if(fees > 0 && erc20Balances > fees) {
                    erc20Balances -= fees;
                    aggregateFee = 0;
                    if(!IERC20(baseAsset).transfer(feeTo, fees)) 'S145'._throw();
                }
                if(erc20Balances > 0) {
                    for(uint i = 0; i < data.length; i++) {
                        erc20Balances -= _settleAccruals(data[i], unit, baseAsset, _providers);
                    }
                    if(erc20Balances > 0) {
                        if(!IERC20(baseAsset).transfer(feeTo, erc20Balances)) 'S153'._throw();
                    }
                }
            }
        }
        userCount = 0;
    }

    /**
     * @dev Get Finance - We send USD to user and accept collateral.
     * @param user : Beneficiary.
     * @param baseAsset : Asset base
     * @param loan : Amount to receive as loan.
     * @param fee : Amount charged as platform fee
     * @param calculatedCol : Amount required to pay as collateral
     * @param recordId : Record Id
     */
    function getFinance(
        address user,
        IERC20 baseAsset,
        uint256 loan,
        uint fee,
        uint256 calculatedCol, 
        uint96 recordId
    ) external hasAccess(user, recordId) onlyRoleBearer returns(bool) {
        assert(address(baseAsset) != address(0) && user != address(0));
        collateralBalances[user][recordId] = calculatedCol;
        uint loanable = loan;
        if (fee > 0) {
            unchecked {
                aggregateFee += fee;
                if(loanable > fee) {
                    loanable -= fee;
                }
            }
        }
       
        return baseAsset.transfer(user, loanable);
    }

    /**
     * @dev Pays back loan
     * @param _p : Parameters of type PaybackParam
     * _p.user : Current txn.origin not msg.sender
     * _p.baseAsset : Asset base
     * _p.debt : Amount owing by user
     * _p.attestedInitialBal : Initial recorded balance of this contract before asset was transfered from the user.
     * _p.allGF : Whether all the contributors have get finance or not
     * _p.cData : Contributors data
     * _p.isSwapped : If isSwapped is true, meaning the actual contributor defaulted.
     * _p.defaulted : Address of the defaulted
     * _p.collaterAsset: Asset used as collateral
     * _p.recordId : Record Id. Every pool has a record Id i.e pool.bigInt.recordId
     */
    function payback(Common.Payback_Safe memory _p, uint unit) 
        external 
        onlyRoleBearer 
        hasAccess(_p.isSwapped? _p.defaulted : _p.user, _p.recordId) 
        nonReentrant
        returns (bool) 
    {
        uint col = collateralBalances[_p.user][_p.recordId];
        if (_p.isSwapped) {
            col = collateralBalances[_p.defaulted][_p.recordId];
            collateralBalances[_p.defaulted][_p.recordId] = 0;
            _removeUser(_p.defaulted, _p.recordId);
        } else {
            _removeUser(_p.user, _p.recordId);
        }
        collateralBalances[_p.user][_p.recordId] = 0;
        paybacks[_p.user] = _p.debt;
        unchecked {
            totalAmountIn += _p.debt;
        }
        assert(IERC20(_p.baseAsset).balanceOf(address(this)) >= (_p.attestedInitialBal + _p.debt));
        if(!_p.collateralAsset.transfer(_p.user, col)) 'S226'._throw();
        if(_p.isColWrappedAsset) {
            if(address(this).balance >= col) {
                (bool done, )= _p.user.call{value: col}('');
                require(done, 'Failed');
            }
        }
        if(_p.allGF) _tryRoundUp(_p.baseAsset, unit, _p.cData, _p.providers);
        return true;
    }

    /**
     * @dev Settles all pending loans and interests due to providers provided the contributor 
     *      joined via providers' services.
     * @notice The amount paid back by the contributor should be enough to settle the providers.
     * @param data : Profile of the current contributor.
     * @param unit : Unit contribution
     * @param baseAsset : Asset used as contribution currency
     */
    function _settleAccruals(
        Common.Contributor memory data, 
        uint unit, 
        IERC20 baseAsset,
        Common.Provider[] memory _providers
    ) internal returns(uint totalPaidOut) {
        uint amtLeft = paybacks[data.id];
        unchecked {
            if(_providers.length > 0) {
                for(uint i = 0; i < _providers.length; i++) {
                    uint providerPay = _providers[i].amount + (_providers[i].accruals.intPerSec * (data.paybackTime - _providers[i].earnStartDate));
                    assert(amtLeft >= providerPay);
                    amtLeft -= providerPay;
                    if(!baseAsset.transfer(_providers[i].account, unit)) 'S253'._throw();
                }
                totalPaidOut += amtLeft;
            } else {
                totalPaidOut += unit;
                if(!baseAsset.transfer(data.id, unit)) 'S258'._throw();
            }
        }
    }

    /**
     * Called when a contributor remove a pool
     * @param user : Contributor
     * @param baseAsset : Asset base
     * @param unit : Unit contribution
     * @param recordId : Record Id
     * @notice A contributor cannot with accidentally or intentional withdraw loan given to them by the providers. If they cancel
     * the pool, the corresponding providers will be refunded immediately.
     */
    function cancel(
        address user,
        IERC20 baseAsset,
        uint unit,
        uint96 recordId
    ) external onlyRoleBearer hasAccess(user, recordId) returns (bool) {
        Common.Provider[] memory provs = providers[user][recordId];
        if(provs.length > 0) {
            if(!providersContract.refund(provs)) 'S280'._throw();
            if(!baseAsset.transfer(address(providersContract), _aggregateBalances(provs))) 'Safe: Cancel Failed'._throw();
        } else {
            if(!baseAsset.transfer(user, unit)) 'S283'._throw();
        }
        _removeUser(user, recordId);
        return true;
    }

    // Calculate the total balances in each providers account
    function _aggregateBalances(Common.Provider[] memory provs) internal pure returns(uint bals) {
        for(uint i = 0; i < provs.length; i++) {
            unchecked {
                bals += provs[i].amount;
            }
        }
    }

    /**
     * @dev Returns Safe-related data
     */
    function getData() external view returns (ViewData memory) {
        return ViewData(userCount, aggregateFee);
    }

    /**
     * @dev Returns User-related data
     * @param user : Contributor
     * @param recordId : Record Id
     */
    function getUserData(
        address user,
        uint96 recordId
    ) external view returns (ViewUserData memory) {
        return ViewUserData(access[user][recordId], collateralBalances[user][recordId]);
    }

    // Forward balances in the contract to 'to'
    // Note : This should only be invoked by the tokenDistributor contract which has the multisig feature
    function forwardBalances(address to, address erc20) external returns(bool) {
        require(_msgSender() == multiSig, "Only multisig");
        uint balances = address(this).balance;
        uint erc20Bal = IERC20(erc20).balanceOf(address(this));
        if(balances > 0) {
            (bool done,) = to.call{value:balances}('');
            require(done, "Call to 'to' failed");
        }
        if(erc20Bal > 0) require(IERC20(erc20).transfer(to, erc20Bal), "Trfer to 'to' failed"); 
        return true;
    }

}
