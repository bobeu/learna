// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { ERC20, Context } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "../../interfaces/IERC20.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WrappedNative is a supported collateral asset on the connected network e.g. Celo or XFI can be used
 * used as collateral in Flexpool.
 * @author 
 * @notice Wrapped token denominated in native coin. Contributors can get finance by depositing a native or corresponding
 * stablecoin as cover for the asset they're borrowing. To have more granular control over the deposited
 * XFI coin, we provide a wrapped version of the native coin. 
 * 
 * ERROR CODE
 * ----------
 * 1 - Previous deposit found
 * 2 - Safe address is not provided
*/
contract WrappedNative is ERC20, Pausable, ReentrancyGuard {
    struct Deposit {
        uint amount;
        address beneficiary;
    }

    // Deposits tracker 
    mapping(uint256 unit => mapping(address depositor =>  Deposit)) private deposits;
    // mapping(address => mapping(address => uint)) private deposits;

    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {}

    /**
     * @dev Deposit collateral in favor of Flexpool
     * @param beneficiary : Account to receive the deposit
     * @param unit : Unit contribution
     * @param safe : Safe address that will receive the incoming msg.value.
     * @notice Unit contribution is mapped to the deposited amount so we can retrieve it when transferFrom is called.
     * Incoming collateral is forwarded to the safe address.
    */
    function deposit(address beneficiary, uint unit, address safe) public payable whenNotPaused returns(bool) {
        address sender = _msgSender();
        Deposit memory _d = deposits[unit][sender];
        require(_d.amount == 0, '1');
        deposits[unit][sender] = Deposit(msg.value, beneficiary);
        _mint(sender, msg.value);
        _approve(sender, beneficiary, msg.value, false);
        require(safe != address(0), '2');
        (bool done,) = safe.call{value: msg.value}('');
        return done;
    }

    /**
     * @dev Return the deposits on sender to to
     * @param unit : Unit contribution
     * @param depositor : Depositor
    */
    function getDeposit(uint unit, address depositor) public view returns(uint256) {
        return deposits[unit][depositor].amount; 
    }

    /**
     * @dev Override the transferFrom function so users get their XFI deposit when they withdraw
     * @param from : Owner account where approval was given
     * @param to : Account to withdraw to
     * @param value : Amount to withdraw
     * @notice If 'from' does not have a role with the roleManger, its an indication that the call 
     * is coming from a user hence we initiate a withdrawal transaction, otherwise, its from the Flexpool factory or the Safe contract.
     * Caution:
     *          An account with a role permission should not participate in a Flexpool except for the deployer
     *      Also, the value parameter should not be confused for the usual ERC20 transferFrom value which is the allowance of the 
     *      owner to the spender. In this case, the Flexpool factory is expected to parse a unit contribution otherwise a wronf value 
     *      will be used. We use the unit to retrieve the actual value stored in the deposits varible.
     * Warning!
     * =======
     * This function should be invoked by the Flexpool factory. 
     */
    function transferFrom(address from, address to, uint256 value) public override nonReentrant returns (bool) {
        address spender = _msgSender();
        Deposit memory _d = deposits[value][from];
        deposits[value][from].amount = 0;
        _spendAllowance(from, spender, _d.amount);
        _transfer(from, to, _d.amount);
        return true;
    }

    /**
     * @dev Transfer amount to 'to'
     * @param to : Recipient
     * @param amount : Value
     * @notice We made a tweak here to suit our need by simply burn the value that was transfered to 'to'. 
     * This wrapped asset is expected to only have value internally. 
     */
    function transfer(address to, uint amount) public override returns(bool) {
        _transfer(_msgSender(), to, amount);
        _burn(to, amount);

        return true;
    }

}