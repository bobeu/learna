// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface ILearna {
    enum Mode { LOCAL, LIVE }

    error UserBlacklisted();
    error NotEligible();
    error ClaimEnded(uint64);
    error InvalidAddress(address);
    error CampaignClaimNotActivated();
    error InsufficientAllowance(uint256);
    error ClaimAddressNotSet();
    error NotInitialized();

    event NewCampaign(Campaign campaign);
    event CampaignUpdated(Campaign campaign);
    event PointRecorded(address indexed user, uint weekId, bytes32 campainHash, QuizResultInput quizResult);
    event Sorted(uint _weekId, uint newWeekId, CampaignData[] campaigns);
    event CampaignCreated(uint weekId, address indexed tipper, Campaign data, bytes32[] campainHashes);
    event UserStatusChanged(address[] users, bool[] newStatus);

    struct CData {
        uint platformToken;
        uint256 fundsNative;
        uint256 fundsERC20;
        uint96 totalPoints;
        uint64 lastUpdated;
        uint activeLearners; 
        address operator;
        address token;
        CampaignData data;
    }

    struct Campaign {
        CData data;
        address[] users;
    }

    struct GetCampaign {
        Campaign cp;
        uint32 slot;
    }

    struct CampaignData {
        bytes32 hash_;
        bytes encoded;
    }

    struct WeekInitializer {
        bool hasSlot;
        uint32 slot;
    }

    struct WeekProfileData {
        uint weekId;
        ReadProfile[] campaigns;
    }

    struct ReadProfile {
        Eligibility eligibility;
        Profile profile;
        bool isClaimed;
        bytes32 hash_;
    }

    struct Answer {
        bytes questionHash;
        uint64 selected;
        bool isUserSelected;
    }

    struct AnswerInput {
        string questionHash;
        uint64 selected;
        bool isUserSelected;
    }

    struct QuizResultOther {
        bytes id;
        bytes quizId;
        uint32 score;
        bytes title;
        uint64 totalPoints;
        uint16 percentage;
        uint64 timeSpent;
        bytes completedAt;
    }

    struct QuizResultOtherInput {
        string id;
        string quizId;
        uint32 score;
        string title;
        uint64 totalPoints;
        uint16 percentage;
        uint64 timeSpent;
        string completedAt;
    }

    struct QuizResultInput {
        AnswerInput[] answers;
        QuizResultOtherInput other;
    }

    struct QuizResult {
        Answer[] answers;
        QuizResultOther other;
    }

    struct ProfileOther {
        uint amountMinted;
        uint8 totalQuizPerWeek;
        bytes32 passkey;
        bool haskey;
    }

    struct Profile {
        QuizResult[] quizResults;
        ProfileOther other;
    }

    struct WeekData {
        uint weekId;
        Campaign[] campaigns;
        uint96 claimDeadline;
    } 

    // Readonly data
    struct ReadData {
        State state;
        WeekData[] wd;
        CampaignData[] approved;
        WeekProfileData[] profileData;
    }

    struct State {
        uint minimumToken;
        uint64 transitionInterval;
        uint64 transitionDate;
        uint weekId;
    }

    struct Eligibility {
        bool isEligible;
        uint erc20Amount;
        uint nativeAmount;
        uint platform;
        address token;
        bytes32 hash_;
        uint weekId;
    }

    // Eligibilities for the previous 3 weeks at most
    struct Eligibilities {
        Eligibility[] elgs;
        uint weekId;
    }

    struct UserCampaigns {
        uint weekId;
        bytes32[] campaigns;
    }

    function checkEligibility(address user) external view returns (Eligibilities[] memory);
    function setIsClaimed(address user, uint weekId, bytes32 hash_) external;
    function hasClaimed(address user, uint weekId, bytes32 hash_) external view returns(bool);
    function getPlatformToken() external view returns(address);
    function onCampaignValueChanged(
        uint weekId, 
        bytes32 hash_, 
        uint256 fundsNative, 
        uint256 fundsERC20,
        uint256 platformToken
    ) external;
}
