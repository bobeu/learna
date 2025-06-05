// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

library ErrorLib {
    error ErrorOccurred(string errorMsg);

    /**
     * @dev Reverts any operation.
     * @param _error : Error struct
     */
    function _throw(string memory _error) internal pure {
        if(bytes(_error).length > 0){ 
            revert ErrorOccurred(_error);
        }
    }

}