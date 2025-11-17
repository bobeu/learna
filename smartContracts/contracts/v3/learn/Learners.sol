// //SPDX-License-Identifier: MIT

// pragma solidity 0.8.28;

// import { ICourseCreator } from "./CourseCreator.sol";
// import { Common } from "./Common.sol";

// interface ILearners {
//     // STRUCTURED DATA
//     struct Profile {
//         ICourseCreator.Course[] courses;
//     }


//     // ERRORS
//     error CouseCreatorIsUndefined();
//     // error NotACreator();
//     // error NoCoursesAvailable();
//     // error CourseTitleIsEmpty();
//     // error CourseAlreadyExist();
//     // error StorageAddressUndefined();
//     // error TransferFromFailed();
//     // error FeeReceiverOrTokenUndefined();

//     // EVENTS
//     // event CourseAdded(Course);
// }

// contract Learners is ILearners, Common {

//     // Contract address of the CourseCreator
//     address internal courseCreator;

//     // ============== CONSTRUCTOR ==============

//     constructor () {}

//     /**@dev Update CourseCreator contract
//      */
//     function setCourseCreator(
//         address newCourseCreator
//     ) public onlyOwner validateAddress(newCourseCreator) returns(bool) {
//         courseCreator = newCourseCreator;
//         return true;
//     }

//     /**@dev Register for a course
//         @param courseId The ID of the course to register for
//      */
//     function registerForACourse(uint courseId) public validateAddress(courseCreator) returns(bool) {
//         ICourseCreator.Course memory cs = ICourseCreator(courseCreator).registerForCourse(courseId, _msgSender());

//     }
// }