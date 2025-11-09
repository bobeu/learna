// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

interface IStorage {
    // FUNCTIONS
    function getData() external view returns(Data memory);

    // STRUCTURED DATA
    struct Data {
        uint creationFee;
        address feeReceiver;
        address token;
    }

    // ERRORS
    error ZeroAddress();

}

contract Storage is IStorage, Ownable {

    // Fee required to add a course
    uint internal creationFee;

    // Fee receiver address
    address internal feeReceiver;

    // Token used for payments
    address internal token;

    // ============== CONSTRUCTOR ==============
    constructor () Ownable(_msgSender()) {
        creationFee = 0.01 ether;
    }

    // Update feeReceiver address
    function setFeeReceiver(address newFeeReceiver) public onlyOwner returns(bool) {
        if(newFeeReceiver == address(0)) revert ZeroAddress();
        feeReceiver = newFeeReceiver;
        return true;
    }

    // Update feeReceiver address
    function setToken(address newToken) public onlyOwner returns(bool) {
        if(newToken == address(0)) revert ZeroAddress();
        token = newToken;
        return true;
    }

    // Retrieve storage data
    function getData() external view returns(Data memory) {
        return Data(creationFee, feeReceiver, token);
    }
}