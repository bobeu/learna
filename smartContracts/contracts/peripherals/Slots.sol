// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import { Common } from "../interfaces/Common.sol";

abstract contract Slots {
    // Every contributor owns a slot in each unit contribution
    mapping(address contributor => mapping(uint unitId => Common.Slot)) private slots;

    /**
        * @dev Create a new slot for target account
        * @param target : Target account
        * @param unitId : Unit contribution
        * @param position : User's position in the list of contributors
        * @param isAdmin : Whether target is an admin or not
        * @param isMember : Whether target is a member or not
     */
    function _createSlot(
        address target, 
        uint unitId,
        uint8 position,
        bool isAdmin,
        bool isMember
    ) internal {
        _setSlot(
            target,
            unitId, 
            Common.Slot(position, isMember, isAdmin),
            false
        );
    }

    /**
     * @dev Set a new slot for the target
     * @param target : Target account
     * @param unitId : unitId
     * @param slot : Slot
     */
    function _setSlot( address target, uint unitId, Common.Slot memory slot, bool setEmpty) internal {
        Common.Slot memory empty;
        slots[target][unitId] = setEmpty? empty : slot;
    }

    /**
        * @dev Returns the slot for target account
        * @param target : Target account
        * @param unitId : Unit
    */
    function _getSlot(
        address target, 
        uint unitId
    ) internal view returns(Common.Slot memory slot) {
        slot = slots[target][unitId];
    }

    // For detailed doc, see _getSlot
    function getSlot(address target, uint unitId) 
        external 
        view 
        // onlyInitialized(unit, false)
        returns(Common.Slot memory) 
    { 
        return _getSlot(target, unitId);
    }
}
