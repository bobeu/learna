// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Approved } from "./Approved.sol";

abstract contract Admins is Approved {
    struct Admin {
        address id;
        bool active;
    }

    uint private adminCount;

    /// Admins slots
    mapping(uint8 => address) private slots;

    /// @dev Mapping of slots to admin data
    mapping(address => bool) private isAdmin;

    /**
     * @dev Only admin
     * @notice Even if no admin is added, we will always byepass the out-of-bound error since 
     * we already added at least one content to the admins array in the constructor, it wil always fetch zero slot.
    */
    modifier onlyAdmin() {
        require(_isAdmin(_msgSender()), 'Only admin');
        _; 
    }

    function _isAdmin(address target) internal view returns(bool result) {
        result = isAdmin[target];
    }
    
    /**
     * @dev Add admin and activate them
     * @param target : Account to add
     */
    function _addAdmin(address target) internal {
        require(!isAdmin[target], 'Admin already added');
        isAdmin[target] = true;
        uint8 slot = uint8(adminCount);
        adminCount = slot + 1;
        slots[slot] = target;
    }

    /**
     * @dev Toggle admin status either activate or deactivate them by toggling back and forth. 
     * @param target : Target account
     */
    function toggleAdminStatus(address target) public onlyOwner {
        bool status = isAdmin[target];
        isAdmin[target] = !status;
    }

    /// Initialize an empty slot in the admins array
    function setAdmin(address target) public onlyOwner {
        _addAdmin(target);
    }

    /// Return all admins
    function getAdmins() public view returns(Admin[] memory _admins) {
        uint8 _adminCount = uint8(adminCount);
        if(_adminCount == 0) return _admins;
        _admins = new Admin[](_adminCount);
        for(uint8 i = 0; i < _adminCount; i++) {
            address target = slots[i];
            _admins[i] = Admin(target, isAdmin[target]);
        }
        return _admins;
    }
}