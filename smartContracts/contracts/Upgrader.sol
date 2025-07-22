// // SPDX-License-Identifier: MIT
// pragma solidity 0.8.28;

// import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
// import { Address } from "@openzeppelin/contracts/utils/Address.sol";

// contract Upgrader is Ownable {
//     using Address for address;

//     error ActionBarred(bytes value);
//     error UnknownContract(address); 
//     error ZeroAddress(address);

//     ///@notice value is the first 4 bytes of the target function name 
//     struct Action {
//         bytes value;
//         bool executable;
//         bool reqValue;
//     }

//     /// @dev Mapping of hashes to targets. Targets are detsination contract to call
//     mapping (address contractId => bool) private approvals;


//     /// @dev Global args/parameter for functionCall
//     struct Args {
//         address targetId;
//         bytes32[] hashes;
//         address[] addresses;
//         uint[] values;
//         bytes[] strOrBytes;
//         uint32 actionIndex;
//         string typedAction; /// @notice action to perform i.e function name to call
//         address caller;
//     }

//     /// @dev Function data
//     mapping(uint32 => Action) public actionData;

//     constructor() Ownable(_msgSender()) {}

//     receive() external payable {
//         (bool sent,) = owner().call{value: msg.value}('');
//         require(sent);
//     }

//     /**
//      * @dev Relay calls to supported contracts.
//      * @param args : Arbitrary arguments. Args is overloaded, and we expect it to be sufficient for the call.
//      */
//     function execute(Args memory args) external payable returns(bool done) {
//         Action memory action = actionData[args.actionIndex];
//         if(!approvals[args.targetId]) revert UnknownContract(args.targetId);
//         if(action.executable){
//             bytes memory data = abi.encodeWithSelector(bytes4(bytes(args.typedAction)), args);
//             bytes memory result = action.reqValue? args.targetId.functionCallWithValue(data, msg.value) : args.targetId.functionCall(data);
//             done = abi.decode(result, (bool));
//         } else {
//             revert ActionBarred(action.value);
//         }
//         return done;
//     }
   
//    /**
//     * @dev Approve or remove approval for a contract address
//     * @param newId : New contract
//     * @notice Only owner function Contracts need approval before their actions can be invoked. This is to ensure a mlicious contract
//     *  is not parsed as argument. Toggling this function will always negate the current status.
//     */
//    function toggleApprovalFor(address newId) external onlyOwner returns(bool) {
//         if(newId == address(0)) revert ZeroAddress(newId);
//         bool status = approvals[newId];
//         approvals[newId] = !status;
//         return true;
//    }

// }