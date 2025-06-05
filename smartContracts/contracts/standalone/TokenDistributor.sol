// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { OnlyRoleBase } from "../peripherals/OnlyRoleBase.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Lib } from "../peripherals/token/ERC20Abstract.sol";
import { SafeERC20, IERC20 } from "../peripherals/token/SafeERC20.sol";
import { ISafe } from "../interfaces/ISafe.sol";

/**
 * @title InitialTokenReceiver
 * @dev Total supply is minted to this contract and is controlled by a set of addresses
 *  acting hence TokenDistributor is multisig in nature. 
 * To transfer any amount of token out of this contract, the following steps
 * must be peformed:
 * 
 * - INITIATE TRXN: A request to transfer an amount must be made. An event is emitted 
 *      to extract the request Id. Request IDs are unique to another.
 * 
 * - SIGN TRXN: The predefined signers addresses will have to sign the transaction with 
 *      the given request Id. The number of signers needed to validate execution must match 
 *      `quorum` declared in the state variable.
 * 
 * - EXECUTE TRXN: Transactions can only be executed if the delay period has passed and are 
 *      are already signed.
 * 
 * Same functionalities can be used to add and remove a new signer, and change quorum. 
 */
contract TokenDistributor is 
    OnlyRoleBase,
    ReentrancyGuard
{
    using Lib for *;
    using SafeERC20 for IERC20;

    error Pending();
    error AlreadySigned();
    error PleaseLeaveAMinimumOfTwoSigners();
    error InvalidRequestId(uint);
    error InsufficientBalance(uint256);

    event Requested(uint reqId, address from);
    event Signer(uint reqId, address from);
    event ThankYou(string); 

    enum Status {NONE, INITIATED, PENDING, EXECUTED, EXPIRED}

    /**
     * @notice Transaction type
     * Transaction can be any of the following enum type.
     * By default, they're ERC20 type.
     */
    enum Type {ERC20, NATIVE, ADDSIGNER, REMOVESIGNER, SETQUORUM, SAFEWITHDRAWAL}

    /**
     * @notice Number of signers require to execute a transfer
     */
    uint public quorum;

    // Number of valid executors. i.e Address in request.executor list that are not zero
    uint public validExecutors;

    /**
     * @dev Unique order ID mapped to each transfer request.
     * Note: Two requests can not have same order ID. 
     */
    uint public requestIDs;

    struct TransactionRequest {
        uint256 amount;
        address recipient;
        uint delay;
        address[] executors;
        Status status;
        Type txType;
        uint expirationTime;
        uint id;
        address safe;
        IERC20 token;
    }

    address[] private executors;

    /**
     * @dev Transfer orders.
     * Mapping of Ids to Request
     * Note: We assigned slot `0` to add and remove signer.
     * i.e requests[0].
     */
    mapping (uint => TransactionRequest) private requests;

    /**
     * @dev Signers
     * Mapping of address to bool
     */
    mapping (address => bool) public signers;

    /**
     * @dev Signed requests
     * Mapping of signer to request id to bool
     */
    mapping (address => mapping (uint => bool)) public signed;

    /**
     * @dev Only signers are allowed
     */
    modifier onlySigner {
        require(signers[_msgSender()], "Not a signer");
        _;
    }

    /**
     * @dev Request Id must not be zero
     * @param reqId : Request Id
     */
    modifier validateRequestId(uint reqId) {
        if(reqId == 0) revert InvalidRequestId(reqId);
        _;
    }

    /**
     * @dev Only when not signed.
     * @param reqId : Request Id
     */
    modifier whenNotSign(uint reqId) {
        address caller = _msgSender();
        if(signed[caller][reqId]) revert AlreadySigned();
        _;
        signed[caller][reqId] = true;
    }

    constructor(
        address _roleManager, 
        address[] memory _signers, 
        uint8 _quorum
    ) 
        OnlyRoleBase(_roleManager) 
    {
        uint size = _signers.length;
        quorum = _quorum;
        require(size > 1 && quorum > 1, "Minimum of 2 signers and 2 quorum");
        if(size > 0) {
            for (uint i = 0; i < size; i++) {
                address addr = _signers[i];
                addr.cannotBeEmptyAddress();
                _addSigner(addr);
            }
        }
    }

    receive() external payable {
        emit ThankYou("Thank You");
    }

    // function setToken(IERC20 newToken) 
    //     public 
    //     onlyRoleBearer
    // {
    //     address(newToken).cannotBeEmptyAddress();
    //     token = newToken;
    // }

    /**
     * @dev Generate request Id
     * Request Id is generated for all transaction type
     */
    function _generateRequestId() private returns(uint id) {
        requestIDs ++;
        id = requestIDs;
    }
    
    /**
     * @dev Check that current request's staus correspond
     * @param _req : Request struct.
     * @param _status : Status to match with.
     * @param errorMessage : Error message.
     */
    function _whenStatus(TransactionRequest memory _req, Status _status, string memory errorMessage) internal pure {
        require(_req.status == _status, errorMessage);
    }

    /**@dev Initiate transaction. 
        This function can be invoked only by the authorized accounts
        as signers.
        The `_type` parameter is used to select the type of transaction 
        the caller want to perform - a more reason we restrict the `_type` 
        input to number between 0 and 5 otherwise we get out of bound error
        since enums work similar to arrays.
        @param _recipient :     An address to act as the beneficiary of this 
                                transaction.
        @param _amount:         Amount to send as value (in token).
        @param _delayInHours:   If this flag is set to value greater than 0,
                                execution of the proposed transaction will not succeed unless the 
                                delay time has passed.
        @param  _type:  The type of transaction to perform. Transction could be any of the following
                        as set in the `Type` enum:
                        ERC20 (0): Transfer ERC20 token.
                        NATIVE (1): Transfer network asset such as ETH.
                        ADDSIGNER (2): Add more signers to the list.
                        REMOVESIGNER (3): Deactivate the `_recipient` address from as a signers. 
                        SETQUORUM (4): Increase or decrease the number of signatories needed to execute a transaction.
                        SAFEWITHDRAWAL: Emergency withdrawal from any Safe wallet
        Note: By default, the caller is deemed to have signed the transaction.
     */
    function proposeTransaction(
        IERC20 _token,
        address _safe,
        address _recipient,
        uint256 _amount,
        uint16 _delayInHours, 
        uint8 _type
    ) public onlySigner {
        require(_type < 6, "Invalid selector");
        uint reqId = _generateRequestId();
        if(Type(_type) != Type.SETQUORUM) { 
            require(_recipient != address(0), "Arg(0) is zero addr");
            require(address(_token) != address(0), 'Token');
        }
        if(Type(_type) == Type.SAFEWITHDRAWAL) {
            require(_safe != address(0), 'Safe address is 0'); 
        }
        requests[reqId].amount = _amount;
        requests[reqId].recipient = _recipient;
        requests[reqId].status = Status.INITIATED;
        requests[reqId].txType = Type(_type);
        requests[reqId].id = reqId; 
        requests[reqId].safe = _safe; 
        requests[reqId].token = _token;
        unchecked {
            requests[reqId].expirationTime = _now() + 14 days;
            requests[reqId].delay = uint(_delayInHours) * 1 hours;
        }
        address caller = _msgSender();
        requests[reqId].executors.push(caller);
        signed[caller][reqId] = true;

        emit Requested(reqId, caller);
    }

    function _now() internal view returns(uint64) {
        return uint64(block.timestamp);
    }

    /**
     * @dev Sign transactions
     * @param reqId : Request Id.
     * Note: Caller must be one of the signers
     */
    function signTransaction(uint reqId) 
        public 
        onlySigner
        validateRequestId(reqId)
        whenNotSign(reqId)
    {
        TransactionRequest memory req = requests[reqId];
        if(_now() > req.expirationTime && req.status == Status.INITIATED) {
            req.status = Status.EXPIRED;
            requests[reqId].status = req.status;
        }
        if(req.status != Status.EXPIRED) {
            _whenStatus(req, Status.INITIATED, "Trxn must be initiated");
            uint currentSigners = req.executors.length;
            require(currentSigners < quorum, "Signers complete");
            address caller = _msgSender();
            requests[reqId].executors.push(caller);
            signed[caller][reqId] = true;
            if((currentSigners + 1) == quorum) {
                requests[reqId].status = Status.PENDING;
                requests[reqId].expirationTime = _now() + 14 days;
                unchecked {
                    requests[reqId].delay = _now() + req.delay;
                }
            }
        }
    } 

    /**
     * @dev Executes pending transaction.
     * @param reqId : Request Id
     * Transaction must be pending in status. When moved to executed, 
     * they have no way to be restored.
     * Only signer accounts can call.
     */
    function executeTransaction(uint reqId) public onlySigner validateRequestId(reqId) nonReentrant {
        TransactionRequest memory req = requests[reqId];
        if(_now() > req.expirationTime && req.status == Status.PENDING) {
            req.status = Status.EXPIRED;
            requests[reqId].status = req.status;
        }
        if(req.status != Status.EXPIRED) {
            _whenStatus(req, Status.PENDING, "Trxn must be initiated");
            if(_now() < req.delay) revert Pending();
            requests[reqId].status = Status.EXECUTED;
            if(req.txType == Type.ERC20) {
                address(req.token).cannotBeEmptyAddress();
                req.token.transfer(req.recipient, req.amount); 
            } else if(req.txType == Type.NATIVE) {
                req.recipient.cannotBeEmptyAddress();
                uint256 balance = address(this).balance;
                if(balance < req.amount) revert InsufficientBalance(balance);
                (bool success,) = req.recipient.call{value: req.amount}("");
                require(success,"Trxn failed");
            } else if(req.txType == Type.ADDSIGNER) {
                req.recipient.cannotBeEmptyAddress();
                _addSigner(req.recipient);
            } else if(req.txType == Type.REMOVESIGNER) {
                req.recipient.cannotBeEmptyAddress();
                _removeSigner(req.recipient, req.executors, reqId);
            } else if(req.txType == Type.SETQUORUM) {
                require(req.amount <= validExecutors, "Quorum exceeds valid executors");
                quorum = req.amount;
            } else if(req.txType == Type.SAFEWITHDRAWAL) {
                require(ISafe(req.safe).forwardBalances(req.recipient, address(req.token)), "E-Withdrawal failed");
                quorum = req.amount;
            }
        }

    }
    
    /**
     * @dev Search the list of executors and remove the target if exist
     * @param lists : List of executors to search
     * @param target : Target account to remove
     * @param reqId : Request Id
     */
    function _searchAndRemove(address[] memory lists, address target, uint reqId) internal {
        for(uint i = 0; i < lists.length; i++) {
            address comparator = lists[i];
            if(comparator == target) {
                if(validExecutors > 2) {
                    validExecutors --;
                    requests[reqId].executors[i] = address(0);
                    if(quorum > 2) quorum --;
                }
                else revert PleaseLeaveAMinimumOfTwoSigners();
            }
        } 
    }
        
    /**
     * @dev Remove a signer from the list
     */
    function _removeSigner(address target, address[] memory _executors, uint reqId) private {
        signers[target] = false;
        _searchAndRemove(_executors, target, reqId);
    }

    /**
     * @dev Add a signer to the list
     */
    function _addSigner(address account) private {
        require(!signers[account], "Account already exist"); 
        signers[account] = true;
        executors.push(account);
        unchecked {
            validExecutors ++;
        }
        assert(quorum > 1);
    }

    /**
        @dev Return request struct at the reqId ref.
     */
    function getTransactionRequest(uint reqId) public view returns(TransactionRequest memory req) {
        return requests[reqId];
    }
    
    // Return the executors 
    function getExecutors() public view returns(address[] memory) {
        return executors;
    }

}
