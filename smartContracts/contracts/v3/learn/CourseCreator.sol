// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IStorage } from "./Storage.sol";

interface ICourseCreator {
    // STRUCTURED DATA
    struct Course {
        uint creatorId;
        uint courseId;
        uint dateAdded;
        address creator;
        bytes title;
        bytes creatorName;
        bytes description;
        bytes avatarURL;
        bytes thumbnailURL;
        bytes promoVideoURL;
        bytes courseContentURL; // This could be course materials uploaded to IPFS
        bytes tags;
        bool active;
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
    error NotACreator();
    error NoCoursesAvailable();
    error CourseTitleIsEmpty();
    error CourseAlreadyExist();
    error StorageAddressUndefined();
    error TransferFromFailed();
    error FeeReceiverOrTokenUndefined();

    // EVENTS
    event CourseAdded(Course);
    event CourseUpdated(Course);
}

contract CourseCreator is ICourseCreator, Ownable {

    // Total course creators 
    uint internal creatorCount;

    // Storage contract address
    address internal storageAddress;

    /** @dev Mapping og creator count index to Courses. That is, every creator has a unique id that can
            be used to access their course data. 
        @notice User courses
    */
    mapping(uint => Course[]) internal userCourses;

    /**@notice Mapping of creator address to primary data. These are data that are used to access
        other data in storage 
     */
    mapping(address => PrimaryData) internal primaryData;

    /**@notice Check whether a course title exist or not
    */
    mapping(bytes => bool) internal isExisting;

    mapping(uint => )

    // ============== CONSTRUCTOR ==============
    constructor () Ownable(_msgSender()) {}

    // Retrieve the current creator count
    function _getCreatorCount() internal view returns(uint id) {
        id = creatorCount;
    }

    function _validateCourseRef(uint creatorId, uint courseId) internal view {
        if(userCourses[creatorId].length == 0) revert NoCoursesAvailable();
        if(courseId >= userCourses[creatorId].length) revert InvalidCourseId();
    }

    // Retrieve the creator id
    function _getCreatorId(address target) internal view returns(uint id) {
        id = primaryData[target].id;
    }

    /// @notice Ensure that the result of an operation succeed. The result must evaluate to boolean value.
    function _ensureOperation(bool result) internal pure returns(bool _result) {
        if(!result) revert OperationFailed();
        _result = result;
    }

    /** @notice Retrieves specific course
        @param creatorId : Unique Id of the course creator
        @param courseId : Course index in the courses array 
     */
    function _getCourse(uint creatorId, uint courseId) internal view returns(Course memory course) {
        course = userCourses[creatorId][courseId];
    }

    // Convert a string to their bytes reprensentation
    function _encode(string memory str) internal pure returns(bytes memory result) {
        result = abi.encode(bytes(str));
    }

    // Retrieve storage data
    function _getData() internal view returns(IStorage.Data memory _data) {
        if(storageAddress == address(0)) revert StorageAddressUndefined();
        _data = IStorage(storageAddress).getData();
    }

    /**@dev Restricts call to only when the target is not a creator
        * @param target : Target address
        @notice User must not already be a creator
     */
    function _initialCheck(address target, string memory courseTitle) internal returns(uint id) {
        bytes memory title = _encode(courseTitle);
        if(title.length == 0) revert CourseTitleIsEempty();
        if(isExisting[title]) revert CourseAlreadyExist();
        isExisting[title] = true;
        if(!primaryData[target].isCreator) {
            unchecked {
                creatorCount ++;
                id = _getCreatorCount();
                primaryData[target] = PrimaryData({
                    id: id,
                    isCreator: true
                });
            }
        } else {
            id = _getCreatorId(target);
        }
    }

    function _getFee() internal {
        IStorage.Data memory _d = _getData();
        if(_d.creationFee > 0) {
            if(_d.feeReceiver == address(0) || _d.token == address(0)) revert FeeReceiverOrTokenUndefined();
            if(!IERC20(_d.token).transferFrom(
                _msgSender(),
                _d.feeReceiver,
                _d.creationFee
            )) revert TransferFromFailed();
        }
    }

    /**
     * @dev Get a campaign from the factory using an index or position
     * @notice It returns empty campaign if the index is not correct or out of bound
     * @param title : Course title
        @param creatorName : Name of the course creator
        @param description : Course description
        @param avatarURL : Course avatar URL
        @param thumbnailURL : Course thumbnail URL
        @param promoVideoURL : Course promo video URL
        @param courseContentURL : Course content URL
        @param tags : Course tags
     */
    function addCourse(
        string title,
        string creatorName,
        string description,
        string avatarURL,
        string thumbnailURL,
        string promoVideoURL,
        string courseContentURL,
        string tags
    ) external returns(bool) {
        uint creatorId = _initialCheck(_msgSender(), title);
        uint courseId = userCourses[creatorId].length;
        userCourses[creatorId].push(Course({
            creatorId: creatorId,
            courseId: courseId,
            dateAdded: block.timestamp,
            creator: _msgSender(),
            title: _encode(title)
            creatorName: _encode(creatorName)
            description: _encode(description),
            avatarURL: _encode(avatarURL),
            thumbnailURL: _encode(thumbnailURL),
            promoVideoURL: _encode(promoVideoURL),
            courseContentURL: _encode(courseContentURL),
            tags: _encode(tags),
            active: true
        }));
        _getFee();
        emit CourseAdded(_getCourse(creatorId, courseId));
        
        return true
    }

    /**@dev Course creator can update the following data for a specific
        @param courseId : Course index in the courses array
        @param description : New course description
        @param avatarURL : New avatar URL
        @param thumbnailURL : New thumbnail URL
        @param promoVideoURL : New promo video URL
        @param courseContentURL : New course content URL
        @param tags : New course tags
     */
    function updateCourseData(
        uint courseId,
        string description,
        string avatarURL,
        string thumbnailURL,
        string promoVideoURL,
        string courseContentURL,
        string tags
   ) external returns(bool) {
        PrimaryData memory _d = primaryData(_msgSender());
        if(!_d.isCreator) revert NotACreator();
        _validateCourseRef(_d.id, courseId);
        Course storage course = userCourses[_d.id][courseId];
        if(bytes(description).length > 0) {
            course.description = _encode(description);
        }
        if(bytes(avatarURL).length > 0) {
            course.avatarURL = _encode(avatarURL);
        }
        if(bytes(thumbnailURL).length > 0) {
            course.thumbnailURL = _encode(thumbnailURL);
        }
        if(bytes(promoVideoURL).length > 0) {
            course.promoVideoURL = _encode(promoVideoURL);
        }
        if(bytes(courseContentURL).length > 0) {
            course.courseContentURL = _encode(courseContentURL);
        }
        if(bytes(tags).length > 0) {
            course.tags = _encode(tags);
        }
        _getFee();
        emit CourseUpdated(_getCourse(_d.id, courseId));

        return true;
    }

    function getCourse(uint courseId, uint creatorId) external view returns(Course memory course) {
        _validateCourseRef(creatorId, courseId);
        PrimaryData memory _d = primaryData(_msgSender());
        if(!_d.isCreator) revert NotACreator();
        if(userCourses[_d.id].length == 0) revert NoCoursesAvailable();
        if(courseId >= userCourses[_d.id].length) revert InvalidCourseId();
        course = userCourses[_d.id][courseId];
    }

    // Retrieve storage data
    function getData() external view returns(ReadData memory data) {
        data.creatorCount = creatorCount;
        data.storageAddress = storageAddress;
        for(uint i = 1; i <= creatorCount; i++) {
            ReadCourse memory rc;
            rc.id = i;
            rc.courses = userCourses[i];
            data.allCourses.push(rc);
        }
        return data;
    }

}