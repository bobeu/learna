// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

/**
 * @title IRoleBase 
 * Interface of the OwnerShip contract
 * @author Simplifi (Bobeu)
 */
interface IRoleBase {
    function setRole(
        address[] memory newRoleTos
    ) 
        external
        returns(bool);

    function removeRole(
        address target
    ) 
        external
        returns(bool);

    function renounceRole() 
        external
        returns(bool);

    function getRoleBearer(
        uint ownerId
    ) 
        external 
        view 
        returns(address);

    function hasRole(
        address target
    )
        external
        view 
        returns(bool);
}