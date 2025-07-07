// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

abstract contract Admins {
    struct Admin {
        address id;
        bool active;
    }

    // All admins
    Admin[] private admins;

    // Admin slots
    mapping(address => uint8) private adminSlot;

    /**
     * @dev Only admin
     * @notice Even if no admin is added, we will always byepass the out-of-bound error since 
     * we already added at least one content to the admins array in the constructor, it wil always fetch zero slot.
    */
    modifier onlyAdmin(address target) {
        uint8 slot = adminSlot[target];
        require(admins[slot].active, 'Only admin');
        _;
    }

    
    /**
     * @dev Add or remove an admin
     * @param target : Account to add
     * @param flag : Whether to add or remove. If true, add else remove
     */
    function _setAdmin(address target, bool flag) internal {
        uint8 slot = adminSlot[target];

        if(flag) {
            slot = uint8(admins.length);
            admins.push();
            assert(!admins[slot].active);
            admins[slot] = Admin(target, true);
            adminSlot[target] = slot;
        } else {
            require(admins[slot].active, "Address is inActive");
            admins[slot].active = false;
        }
    }

    // Initialize an empty slot in the admins array
    function _initializeEmptyAdminSlot() internal {
        admins.push(); 
    }

    // Check if account is an admin
    function getAdminStatus(address target) public view returns(bool) {
        uint8 slot = adminSlot[target];
        return admins[slot].active;
    }
}