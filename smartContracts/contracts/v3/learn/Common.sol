// //SPDX-License-Identifier: MIT

// pragma solidity 0.8.28;

// import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
// import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import { IStorage } from "./Storage.sol";
// import { IApprovalFactory } from "../ApprovalFactory.sol";

// abstract contract Common is Ownable {
//     // ERRORS
//     error InvalidAddress();
//     error NotAcceptingEther();
//     error TransferFromFailed();
//     error StorageAddressUndefined();

//     // Storage contract address
//     address internal storageAddress;

//     // Approval factory address
//     IApprovalFactory internal approvalFactory;

//     // Black list
//     mapping(address => bool) internal blacklisted;

//     modifier validateAddress(address target) {
//         if(target == address(0) || blacklisted[target]) revert InvalidAddress();
//         _;
//     }

//     // ============== CONSTRUCTOR ==============

//     constructor () Ownable(_msgSender()) {}

//     // Not accepting native coin
//     receive() external payable {
//         revert NotAcceptingEther();
//     }

//     /**@dev Update Storage contract
//         @param newStorageAddress : New Storage contract address
//      */
//     function setStorageAddress(
//         address newStorageAddress
//     ) public onlyOwner validateAddress(newStorageAddress) returns(bool) {
//         storageAddress = newStorageAddress;
//         return true;
//     }

//     /**@dev Set approval factory contract
//         @param newApprovalFactory : New Factory address
//      */
//     function setApprovalFactory(
//         IApprovalFactory newApprovalFactory
//     ) 
//         public 
//         onlyOwner 
//         validateAddress(address(newApprovalFactory)) 
//         returns(bool)
//     {
//         approvalFactory = newApprovalFactory;
//         return true;
//     }

//     // Ban or unban an account
//     function banOrUnban(address target) external onlyOnwer validateAddress(target) returns(bool) {
//         if(blacklisted[target]) {
//             blacklisted[target] = false;
//         } else {
//             blacklisted[target] = true;
//         }
//         return true;
//     }

//     // Retrieve storage data
//     function _getData() internal view returns(IStorage.Data memory _data) {
//         if(storageAddress == address(0)) revert StorageAddressUndefined();
//         _data = IStorage(storageAddress).getData();
//     }

//     // Collect fee or charges from the user
//     function _getFee() internal {
//         IStorage.Data memory _d = _getData();
//         if(_d.creationFee > 0) {
//             if(_d.feeReceiver == address(0) || _d.token == address(0)) revert FeeReceiverOrTokenUndefined();
//             if(!IERC20(_d.token).transferFrom(
//                 _msgSender(),
//                 _d.feeReceiver,
//                 _d.creationFee
//             )) revert TransferFromFailed();
//         }
//     }
// }