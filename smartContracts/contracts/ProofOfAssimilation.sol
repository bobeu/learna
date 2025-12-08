// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IProofOfAssimilation } from "./v3/interfaces/ICampaignTemplate.sol";

contract ProofOfAssimilation is IProofOfAssimilation, ERC20, Ownable, ReentrancyGuard {
    enum Share { REWARD, LIQUIDITY, TEAM }

    address internal interfacer;
    address internal governance;

    bool internal swapPoints;

    /**@dev Mapping of shares to their respective values
        See constructor for more details
     */
    mapping(Share => uint256) internal shares;

    /**@dev Timelock variables for team tokens
        @notice Team tokens are vested over 6 months, withdrawable every 30 days
     */
    uint256 public constant VESTING_DURATION = 180 days; // 6 months
    uint256 public constant VESTING_INTERVAL = 30 days; // 30 days
    uint256 internal teamVestingStart;
    uint256 internal teamVestingEnd;
    uint256 internal lastTeamWithdrawal;
    uint256 internal teamTokensWithdrawn;
    uint256 internal totalTeamShare; // Original team share amount for vesting calculations

    /** Constructor
        @param tkName : Token Name
        @param ticker : Token Symbol
        @param dev : Address to mint dev share
        @param governance : Governance contract address (becomes owner)

        rewards - 15% - Will be used to reward participation and community enagements
        daoTreasury - 10% - Is assigned to DAO Treasury
        liquidity - 50%
        operations - 12% - Includes marketing, partnership, etc
        devs - 3%
        team - 10%

        @notice Reward, Team and Liquidity shares are minted to the token contract
            DAO treasury, Operation and Partnership shares are minted to the governance address
     */     
    constructor(
        string memory tkName, 
        string memory ticker, 
        address dev,
        address _governance
    ) ERC20(tkName, ticker) Ownable(_governance)
    {
        require(_governance != address(0), "Governance address cannot be zero");
        require(dev != address(0), "Dev address cannot be zero");
        
        uint256 totalSupply = 1_000_000_000 * (10 ** decimals()); // 1 billion/1_000_000_000
        uint256 reward = (totalSupply * 15) / 100;
        uint256 liquidity = (totalSupply * 50) / 100;
        uint256 team = (totalSupply * 10) / 100;
        uint256 operation = (totalSupply * 12) / 100;
        _mint(_governance, operation + (totalSupply * 10) / 100);
        _mint(dev, (totalSupply * 3) / 100);
        _mint(address(this), reward + liquidity + team); // Includes rewards (15%), Liquidity (50%) and Team (10%)
        shares[Share.REWARD] = reward;
        shares[Share.LIQUIDITY] = liquidity;
        shares[Share.TEAM] = team;
        totalTeamShare = team; // Store original amount for vesting calculations
        
        // Set governance address (governance is already the owner via Ownable)
        governance = _governance;
        
        // Initialize team vesting
        uint256 currentTime = block.timestamp;
        teamVestingStart = currentTime;
        teamVestingEnd = currentTime + VESTING_DURATION;
        lastTeamWithdrawal = currentTime;
    }

    /**@dev Sets new interfacer address
        @param newInterfacer : New interfacer address
        @notice Only owner (governance) can call this function
     */
    function setInterfacer(address newInterfacer) public onlyOwner returns(bool) {
        require(newInterfacer != address(0), "New Interfacer is zero address");
        interfacer = newInterfacer;
        return true;
    }

    // Toggle swapPoints variable 
    function toggleSwapPoints() public onlyOwner returns(bool) {
        swapPoints = !swapPoints;
        return true;
    }

    /**@dev Converts points earned to token
        @param points : Points to swap
     */
    function swapPointsForToken(uint points) external nonReentrant returns(bool) {
        require(interfacer != address(0), "Interfacer not set");
        require(_msgSender() == interfacer, "Not authorized");
        uint256 amount = points * (10 ** decimals());
        if(swapPoints) {
            if(shares[Share.REWARD] >= amount) {
                unchecked {
                    shares[Share.REWARD] -= amount;
                }
                _transfer(address(this), _msgSender(), amount);
            }
        }
        return true;
    }

    /**@dev Withdraws team tokens based on vesting schedule
        @notice Can only be called by owner, every 30 days, over 6 months
        @param amount : Amount to withdraw (must be within available vesting amount)
     */
    function withdrawTeamTokens(uint256 amount) external onlyOwner nonReentrant returns(bool) {
        uint256 currentTime = block.timestamp;
        require(currentTime >= teamVestingStart, "Vesting not started");
        require(amount > 0, "Amount must be greater than zero");
        
        uint256 available = _calculateAvailableTeamTokens();
        require(amount <= available, "Amount exceeds available tokens");
        
        // Check interval requirement (only if vesting period hasn't ended)
        if(currentTime < teamVestingEnd) {
            require(currentTime >= lastTeamWithdrawal + VESTING_INTERVAL, "30 days not elapsed");
        }
        
        unchecked {
            shares[Share.TEAM] -= amount;
            teamTokensWithdrawn += amount;
        }
        lastTeamWithdrawal = currentTime;
        
        _transfer(address(this), _msgSender(), amount);
        return true;
    }

    /**@dev Calculates available team tokens for withdrawal
        @return Available tokens based on linear vesting schedule
     */
    function _calculateAvailableTeamTokens() internal view returns(uint256) {
        uint256 currentTime = block.timestamp;
        if(currentTime < teamVestingStart) {
            return 0;
        }
        if(currentTime >= teamVestingEnd) {
            return shares[Share.TEAM];
        }
        
        uint256 elapsed = currentTime - teamVestingStart;
        uint256 vestedAmount = (totalTeamShare * elapsed) / VESTING_DURATION;
        
        if(vestedAmount > teamTokensWithdrawn) {
            unchecked {
                uint256 available = vestedAmount - teamTokensWithdrawn;
                // Ensure we don't return more than what's actually available
                return available > shares[Share.TEAM] ? shares[Share.TEAM] : available;
            }
        }
        return 0;
    }

    /**@dev Returns available team tokens for withdrawal
        @return Available tokens based on vesting schedule
     */
    function getAvailableTeamTokens() external view returns(uint256) {
        return _calculateAvailableTeamTokens();
    }

    /**@dev Withdraws liquidity share
        @notice Can only be called by governance contract (owner)
        @param amount : Amount to withdraw (can withdraw all at once)
     */
    function withdrawLiquidity(uint256 amount) external nonReentrant returns(bool) {
        require(_msgSender() == governance, "Not authorized");
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= shares[Share.LIQUIDITY], "Insufficient liquidity share");
        
        unchecked {
            shares[Share.LIQUIDITY] -= amount;
        }
        
        _transfer(address(this), _msgSender(), amount);
        return true;
    }

    /**@dev Returns all relevant state variables at once
        @return interfacer_ : Current interfacer address
        @return governance_ : Current governance address
        @return swapPoints_ : Current swapPoints status
        @return rewardShare : Reward share amount
        @return liquidityShare : Liquidity share amount
        @return teamShare : Team share amount
        @return vestingStart : Team vesting start timestamp
        @return vestingEnd : Team vesting end timestamp
        @return lastWithdrawal : Last team withdrawal timestamp
        @return tokensWithdrawn : Total team tokens withdrawn
        @return totalTeam : Original total team share
     */
    function getState() external view returns(
        address interfacer_,
        address governance_,
        bool swapPoints_,
        uint256 rewardShare,
        uint256 liquidityShare,
        uint256 teamShare,
        uint256 vestingStart,
        uint256 vestingEnd,
        uint256 lastWithdrawal,
        uint256 tokensWithdrawn,
        uint256 totalTeam
    ) {
        return (
            interfacer,
            governance,
            swapPoints,
            shares[Share.REWARD],
            shares[Share.LIQUIDITY],
            shares[Share.TEAM],
            teamVestingStart,
            teamVestingEnd,
            lastTeamWithdrawal,
            teamTokensWithdrawn,
            totalTeamShare
        );
    }
}


contract Governance is ReentrancyGuard {
    enum Share { OPERATION, TREASURY }
    enum ProposalType { UPDATE_THRESHOLD, WITHDRAW_LIQUIDITY, OTHER }
    enum VoteType { FOR, AGAINST, ABSTAIN }
    enum ProposalStatus { PENDING, ACTIVE, PASSED, REJECTED, EXECUTED }

    struct Proposal {
        uint256 id;
        address proposer;
        ProposalType proposalType;
        string description;
        uint256 amount; // For liquidity withdrawal proposals
        uint256 newProposalThreshold; // For threshold update proposals
        uint256 newVoteThreshold; // For threshold update proposals
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        ProposalStatus status;
        bool executed;
    }

    IERC20 internal token;
    ProofOfAssimilation internal proofOfAssimilation;

    mapping(Share => uint256) internal shares;
    mapping(uint256 => Proposal) internal proposals;
    mapping(uint256 => mapping(address => bool)) internal hasVoted;
    mapping(uint256 => mapping(address => VoteType)) internal votes;
    mapping(address => uint256) internal proposalCount;

    uint256 internal proposalThreshold; // Minimum tokens required to propose
    uint256 internal voteThreshold; // Minimum tokens required to vote
    uint256 internal votingPeriod; // Voting period in seconds (default 7 days)
    uint256 internal proposalCounter;
    uint256 internal quorumPercentage; // Minimum percentage of total supply needed for quorum

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, ProposalType proposalType, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, VoteType voteType, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    event ThresholdsUpdated(uint256 newProposalThreshold, uint256 newVoteThreshold);

    constructor(address _token) {
        require(_token != address(0), "Token address cannot be zero");
        proofOfAssimilation = ProofOfAssimilation(_token);
        token = IERC20(_token);
        
        uint256 mantissa = 10 ** 18;
        shares[Share.OPERATION] = 120_000_000 * mantissa;
        shares[Share.TREASURY] = 100_000_000 * mantissa;
        
        // Initialize thresholds (1% of total supply for proposal, 0.1% for vote)
        proposalThreshold = 10_000_000 * mantissa; // 1% of 1 billion
        voteThreshold = 1_000_000 * mantissa; // 0.1% of 1 billion
        votingPeriod = 7 days;
        quorumPercentage = 4; // 4% quorum required
    }

    function setToken(IERC20 _token) public returns(bool) {
        require(_token != token, 'Token address is the same in storage');
        token = _token;
        if(address(_token) != address(0)) {
            proofOfAssimilation = ProofOfAssimilation(address(_token));
        }
        return true;
    }

    /**@dev Creates a new proposal
        @param proposalType : Type of proposal
        @param description : Description of the proposal
        @param amount : Amount for liquidity withdrawal (if applicable)
        @param newProposalThreshold : New proposal threshold (if updating thresholds)
        @param newVoteThreshold : New vote threshold (if updating thresholds)
     */
    function createProposal(
        ProposalType proposalType,
        string memory description,
        uint256 amount,
        uint256 newProposalThreshold,
        uint256 newVoteThreshold
    ) external returns(uint256) {
        require(token.balanceOf(msg.sender) >= proposalThreshold, "Insufficient tokens to propose");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        if(proposalType == ProposalType.UPDATE_THRESHOLD) {
            require(newProposalThreshold > 0, "Invalid proposal threshold");
            require(newVoteThreshold > 0, "Invalid vote threshold");
        }
        
        proposalCounter++;
        uint256 proposalId = proposalCounter;
        uint256 currentTime = block.timestamp;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            proposalType: proposalType,
            description: description,
            amount: amount,
            newProposalThreshold: newProposalThreshold,
            newVoteThreshold: newVoteThreshold,
            startTime: currentTime,
            endTime: currentTime + votingPeriod,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            status: ProposalStatus.ACTIVE,
            executed: false
        });
        
        proposalCount[msg.sender]++;
        
        emit ProposalCreated(proposalId, msg.sender, proposalType, description);
        return proposalId;
    }

    /**@dev Casts a vote on a proposal
        @param proposalId : ID of the proposal
        @param voteType : Type of vote (FOR, AGAINST, ABSTAIN)
        @notice Voting power is based on token balance at time of voting
     */
    function castVote(uint256 proposalId, VoteType voteType) external nonReentrant returns(bool) {
        Proposal storage proposal = proposals[proposalId];
        uint256 currentTime = block.timestamp;
        require(proposal.id > 0, "Proposal does not exist");
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(currentTime >= proposal.startTime, "Voting not started");
        require(currentTime <= proposal.endTime, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(token.balanceOf(msg.sender) >= voteThreshold, "Insufficient tokens to vote");
        
        uint256 voterBalance = token.balanceOf(msg.sender);
        hasVoted[proposalId][msg.sender] = true;
        votes[proposalId][msg.sender] = voteType;
        
        if(voteType == VoteType.FOR) {
            unchecked {
                proposal.forVotes += voterBalance;
            }
        } else if(voteType == VoteType.AGAINST) {
            unchecked {
                proposal.againstVotes += voterBalance;
            }
        } else {
            unchecked {
                proposal.abstainVotes += voterBalance;
            }
        }
        
        emit VoteCast(proposalId, msg.sender, voteType, voterBalance);
        return true;
    }

    /**@dev Finalizes a proposal after voting period ends
        @param proposalId : ID of the proposal
        @notice Can be called by anyone after voting period ends
     */
    function finalizeProposal(uint256 proposalId) external returns(bool) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id > 0, "Proposal does not exist");
        require(proposal.status == ProposalStatus.ACTIVE, "Proposal not active");
        require(block.timestamp > proposal.endTime, "Voting still active");
        
        uint256 totalSupply = token.totalSupply();
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        uint256 quorum = (totalSupply * quorumPercentage) / 100;
        
        if(totalVotes >= quorum && proposal.forVotes > proposal.againstVotes) {
            proposal.status = ProposalStatus.PASSED;
        } else {
            proposal.status = ProposalStatus.REJECTED;
        }
        
        return true;
    }

    /**@dev Executes a passed proposal
        @param proposalId : ID of the proposal
        @notice Can be called by anyone after proposal is passed
     */
    function executeProposal(uint256 proposalId) external nonReentrant returns(bool) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.id > 0, "Proposal does not exist");
        require(proposal.status == ProposalStatus.PASSED, "Proposal not passed");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        proposal.status = ProposalStatus.EXECUTED;
        
        if(proposal.proposalType == ProposalType.UPDATE_THRESHOLD) {
            proposalThreshold = proposal.newProposalThreshold;
            voteThreshold = proposal.newVoteThreshold;
            emit ThresholdsUpdated(proposal.newProposalThreshold, proposal.newVoteThreshold);
        } else if(proposal.proposalType == ProposalType.WITHDRAW_LIQUIDITY) {
            require(proposal.amount > 0, "Invalid amount");
            proofOfAssimilation.withdrawLiquidity(proposal.amount);
        }
        
        emit ProposalExecuted(proposalId);
        return true;
    }

    /**@dev Gets proposal details
        @param proposalId : ID of the proposal
     */
    function getProposal(uint256 proposalId) external view returns(Proposal memory) {
        return proposals[proposalId];
    }

    /**@dev Checks if user can propose
        @param user : Address to check
     */
    function canPropose(address user) external view returns(bool) {
        return token.balanceOf(user) >= proposalThreshold;
    }

    /**@dev Checks if user can vote
        @param user : Address to check
     */
    function canVote(address user) external view returns(bool) {
        return token.balanceOf(user) >= voteThreshold;
    }

    /**@dev Returns all relevant state variables at once
        @return token_ : Token contract address
        @return proofOfAssimilation_ : ProofOfAssimilation contract address
        @return operationShare : Operation share amount
        @return treasuryShare : Treasury share amount
        @return proposalThreshold_ : Minimum tokens required to propose
        @return voteThreshold_ : Minimum tokens required to vote
        @return votingPeriod_ : Voting period in seconds
        @return proposalCounter_ : Current proposal counter
        @return quorumPercentage_ : Quorum percentage required
     */
    function getState() external view returns(
        address token_,
        address proofOfAssimilation_,
        uint256 operationShare,
        uint256 treasuryShare,
        uint256 proposalThreshold_,
        uint256 voteThreshold_,
        uint256 votingPeriod_,
        uint256 proposalCounter_,
        uint256 quorumPercentage_
    ) {
        return (
            address(token),
            address(proofOfAssimilation),
            shares[Share.OPERATION],
            shares[Share.TREASURY],
            proposalThreshold,
            voteThreshold,
            votingPeriod,
            proposalCounter,
            quorumPercentage
        );
    }
}