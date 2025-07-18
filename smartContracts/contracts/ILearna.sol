// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface ILearna {
    enum Mode { LOCAL, LIVE }

    error NoPasskey();
    error NotEligible();
    error ClaimEnded(uint64);
    error InvalidAddress(address);
    error CampaignClaimNotActivated();
    error InsufficientAllowance(uint256);

    event NewCampaign(bytes32 campaignHash, Campaign campaign);
    event ClaimedWeeklyReward(address indexed user, Profile profile, Campaign cp);
    event RegisteredForWeeklyEarning(address indexed users, uint weekId, bytes32 campainHash);
    event Banned(address[] indexed users, uint weekId, bytes32[] campainHashes);
    event Sorted(uint _weekId, uint newWeekId, string[] campainHashes);
    event PasskeyGenerated(address indexed sender, uint weekId, bytes32[] campainHashes);
    event CampaignCreated(uint weekId, address indexed tipper, Campaign data, bytes32[] campainHashes);

    struct Campaign {
        uint256 fundsNative;
        uint256 fundsERC20;
        uint96 totalPoints;
        uint64 lastUpdated;
        uint activeLearners; 
        uint64 transitionDate;
        uint64 claimActiveUntil;
        address operator;
        address token;
        bytes32 hash_;
        bool canClaim;
        CampaignData data;
    }

    struct CampaignData {
        bytes32 campaignHash;
        bytes encoded;
    }

    struct Initializer {
        bool initialized;
        uint32 slot;
    }

    struct ReadProfile {
        Profile profile;
        bytes32 campaignHash;
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
        uint amountClaimedInNative;
        uint amountClaimedInERC20;
        bool claimed;
        bytes32 passKey;
        bool haskey;
        uint8 totalQuizPerWeek;
    }

    struct Profile {
        QuizResult[] quizResults;
        ProfileOther other;
    }

    struct WeekData {
        Campaign[] campaigns;
    } 

    // Readonly data
    struct ReadData {
        State state;
        WeekData[] wd;
    }

    struct State {
        uint minimumToken;
        uint64 transitionInterval; 
        uint weekCounter;
    }

    struct Eligibility {
        bool canClaim;
        uint erc20Amount;
        uint nativeAmount;
        uint weekId;
        address token;
        bytes32 campaignHash;
    }

    function checkEligibility(address user,  bytes32 campaignHash) external view returns (Eligibility memory);
    function onClaimed(Eligibility memory elg, address user) external returns(bool);
}
