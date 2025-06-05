// // SPDX-License-Identifier: MIT

// pragma solidity 0.8.24;

// import { Common } from "../interfaces/Common.sol";

// /**
//  * LEGEND
//  * ======
//  * 0 - createPool | launchDefault
//  * 1 - contribute
//  * 2 - getFinance
//  * 3 - payback | liquidate
//  * else - closePool
//  * 
//  */
// abstract contract Analytics {
//     // Analytics
//     Common.Analytics private analytics;

//     // Returns analytics object. This is cheaper than marking the analytics state variable public
//     function _getAnalytics() internal view returns(Common.Analytics memory _analytics) {
//         _analytics = analytics;
//     }

//     function _updateAnalytics(uint8 operation, uint baseValue, uint collateralValue, bool isPermissionless) internal {
//         unchecked {
//             if(operation == 0){
//                 analytics.tvlBase += baseValue;
//                 isPermissionless? analytics.totalPermissionless += 1 : analytics.totalPermissioned += 1;
//             } else if(operation == 1){
//                 analytics.tvlBase += baseValue;
//             } else if(operation == 2) {
//                 if(analytics.tvlBase >= baseValue) analytics.tvlBase -= baseValue;
//                 analytics.tvlCollateral += collateralValue;
//             } else if(operation == 3) {
//                 analytics.tvlBase += baseValue;
//                 if(analytics.tvlCollateral >= collateralValue) analytics.tvlCollateral -= collateralValue;
//             } else {
//                 if(analytics.tvlBase >= baseValue) analytics.tvlBase -= baseValue;
//                 if(isPermissionless) {
//                     if(analytics.totalPermissionless > 0) analytics.totalPermissionless -= 1;
//                 } else {
//                     if(analytics.totalPermissioned > 0) analytics.totalPermissioned -= 1;
//                 }
//             }
//         }
//     }
// }
