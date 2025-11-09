// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IStorage } from "./Storage.sol";

interface ILearners {
    // STRUCTURED DATA
    struct Course {
        
    }

    struct PrimaryData {
        uint id;
        bool isCreator;
    }

    struct ReadCourse {
        uint id;
        Course[] courses;
    }

    struct ReadData {
        uint creatorCount;
        address storageAddress;
        ReadCourse[] allCourses;
    }

    // ERRORS
    // error NotACreator();
    // error NoCoursesAvailable();
    // error CourseTitleIsEmpty();
    // error CourseAlreadyExist();
    // error StorageAddressUndefined();
    // error TransferFromFailed();
    // error FeeReceiverOrTokenUndefined();

    // EVENTS
    event CourseAdded(Course);
}

contract Learners is ILearners, Ownable {

    // ============== CONSTRUCTOR ==============

    constructor () Ownable(_msgSender()) {
    }

    /**@dev Register for a course
        @param courseId The ID of the course to register for
     */
    function registerForACourse(uint courseId) public returns(bool) {
        return true;
    }
}