// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

abstract contract Admins {
    struct Admin {
        address id;
        uint8 active;
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
        require(_isAdmin(target), 'Only admin');
        _;
    }

    function _isAdmin(address target) internal view returns(bool result) {
        uint8 slot = adminSlot[target];
        result = admins[slot].active > 0;
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
            assert(admins[slot].active == 0);
            admins[slot] = Admin(target, 1);
            adminSlot[target] = slot;
        } else {
            require(admins[slot].active > 0, "Address is inActive");
            admins[slot].active = 0;
        }
    }

    // Initialize an empty slot in the admins array
    function _initializeEmptyAdminSlot() internal {
        admins.push(); 
    }

    // Check if account is an admin
    function getAdminStatus(address target) public view returns(bool) {
        return _isAdmin(target);
    }
}