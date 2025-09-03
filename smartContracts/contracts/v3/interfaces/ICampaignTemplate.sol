// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { Common } from "../../interfaces/Common.sol";
import { IVerifier } from "../../interfaces/IVerifier.sol";
import { IApprovalFactory } from "../ApprovalFactory.sol";

interface ICampaignTemplate {
    error NotVerified();
    error InvalidEpoch();
    error ClaimNotReady();
    error BalanceAnomally();
    error InsufficientValue();
    error MaxFundDepthExceeded();
    error CannotShareZeroValue();
    error MaxProofPerDayExceeded();

    event Claimed(address indexed sender, Common.ShareOut);
    event Proof(ProofOfAssimilation poa, address indexed sender);
    event ERC20FundAdded(bytes32 indexed hash_, address indexed _token, uint amount);
    event PointsUpdated(address[] targets, uint32[] points, uint epoch);

    // POASS - Proof Of Assimilation, POINT - Proof Of Integration
    enum RewardType { POASS, POINT }

    struct ProofOfAssimilation {
        uint8 questionSize;
        uint32 score;
        uint64 totalPoints;
        uint16 percentage;
        uint64 timeSpent;
        bytes completedAt;
    }

    struct ProofOfIntegration {
        bytes link; // Can be any link to learner's portfolio e.g Githuh, figma etc
        uint64 submittedAt; 
        uint64 approvedAt; 
        uint64 score;
    }

    ///@dev Expected to be rated by AI after quiz or test completion
    struct Performance {
        uint64 value; 
        bytes ratedAt; // Date rated
    }
        // ProofOfIntegration poi; // Link to proof of integration if user has taken SDK test
        // ProofOfAssimilation poa;

    // This should be a link to user portfolio such as github or any link to proof that user integrate or learn something valuable;
    // Proof of assimilation is achieved when user successfully complete a short training section with our Agent and take the short test to proof that they understand what they just learnt. They in turn earn POINT token as reward. They earn other asset provided by the campaign operator when they successfully integrate what they learned
    // When users take a test to proof they understand what the learned about a particular subject, they can always retake it. Retaking will override their previous scores. They can continue to retake the test until they find the best scores.
    // Our AI agent provides feedback, possible areas of improvement and ratings to learners before they send the scores to the blockchain. 
    // Note, ratings are hidden until saved onchain. Feedbacks are shown to learners in an instant.
    struct Learner {
        address id;
        Performance[] ratings;
        ProofOfIntegration point;
        ProofOfAssimilation[] poass;
    }
    
    struct ERC20Token {
        address token;
        bytes tokenName;
        bytes tokenSymbol;
        uint256 amount;
    }

    struct Metadata {
        bytes32 hash_; // Keccack256 value of the campaign name with the 
        bytes name; // Campaign name e.g Divvi
        bytes link; // Any other relevant link
        bytes description; // Max length is 300
        bytes imageUrl;
        uint64 endDate;
    }

    struct MetadataInput {
        string name; // Campaign name e.g Divvi
        string link; // Any other relevant link
        string description; // Max length is 300
        string imageUrl;
        uint64 endDateInHr;
    }

    // // Offchain
    // struct Metric {
    //     bytes identifier;
    //     uint24 length;
    //     uint32 totalLearners;
    //     uint32 numOfIntegration;
    //     uint256 nativeFunds;
    //     ERC20Token[] tokenFunds;
    //     //////////////////////////////////////////////////////////////////////Add more metrics and deliverables
    // }

    struct Spot {
        uint value;
        bool hasValue;
    }

    struct Funds {
        ERC20Token[] erc20Ass;
        ERC20Token[] erc20Int;
        uint256 nativeAss; // Proof Of Assimilation native reward
        uint256 nativeInt; // Proof of integration native reward
    }

    struct EpochSetting {
        uint24 maxProof; // Maximum assimilation learners can prove in a day
        uint64 createdAt;
        uint64 activatedAt;
        uint64 endDate;
        Funds funds;
    }

    struct EpochData {
        uint64 totalProofs;
        EpochSetting setting;
        Learner[] learners;
    }

    struct Frequency {
        uint64 lastSeen;
        uint8 times;
    }

    struct EpochSettingInput {
        uint24 maxProof; // Maximum assimilation learners can prove in a day
        bool isEditing;
        uint24 endInHr;
        address[] tokens;
        address newOperator;
    }

    struct ReadData {
        EpochData[] epochData;
        Metadata metadata;
        IVerifier verifier;
        IApprovalFactory approvalFactory;
        uint epoches;
        address owner;
        bool[] isPoassClaimed;
        bool[] isPointClaimed;
    }
}
