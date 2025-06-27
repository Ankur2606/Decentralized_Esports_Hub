// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FanTokenDAO is ERC20, Ownable, ReentrancyGuard {
    struct Proposal {
        uint256 id;
        string description;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) voteWeight;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public lastVoteTime;
    
    uint256 public proposalCounter;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 100 * 10**18; // 100 tokens
    uint256 public constant QUORUM_PERCENTAGE = 20; // 20% of total supply
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        bool success
    );
    
    event TokensMinted(
        address indexed to,
        uint256 amount,
        string reason
    );

    constructor() ERC20("ChiliZ Fan Token", "FTK") {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**18); // 1M tokens
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, "Admin mint");
    }

    function mintForActivity(address to, uint256 amount, string memory reason) 
        external 
        onlyOwner 
    {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }

    function createProposal(string memory _description) 
        external 
        returns (uint256) 
    {
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(balanceOf(msg.sender) >= MIN_PROPOSAL_THRESHOLD, "Insufficient tokens to propose");

        uint256 proposalId = proposalCounter++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.description = _description;
        proposal.proposer = msg.sender;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + VOTING_PERIOD;
        proposal.votesFor = 0;
        proposal.votesAgainst = 0;
        proposal.executed = false;

        emit ProposalCreated(proposalId, msg.sender, _description, proposal.endTime);
        
        return proposalId;
    }

    function vote(uint256 _proposalId, bool _support) 
        external 
        nonReentrant 
    {
        require(_proposalId < proposalCounter, "Proposal does not exist");
        
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");

        uint256 voterBalance = balanceOf(msg.sender);
        require(voterBalance > 0, "No voting power");

        proposal.hasVoted[msg.sender] = true;
        proposal.voteWeight[msg.sender] = voterBalance;
        lastVoteTime[msg.sender] = block.timestamp;

        if (_support) {
            proposal.votesFor += voterBalance;
        } else {
            proposal.votesAgainst += voterBalance;
        }

        emit VoteCast(_proposalId, msg.sender, _support, voterBalance);
    }

    function executeProposal(uint256 _proposalId) 
        external 
        returns (bool) 
    {
        require(_proposalId < proposalCounter, "Proposal does not exist");
        
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");

        // Check quorum
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 quorumRequired = (totalSupply() * QUORUM_PERCENTAGE) / 100;
        require(totalVotes >= quorumRequired, "Quorum not reached");

        // Check if proposal passed
        bool passed = proposal.votesFor > proposal.votesAgainst;
        
        proposal.executed = true;

        emit ProposalExecuted(_proposalId, passed);
        
        return passed;
    }

    function getProposal(uint256 _proposalId) 
        external 
        view 
        returns (
            uint256 id,
            string memory description,
            address proposer,
            uint256 startTime,
            uint256 endTime,
            uint256 votesFor,
            uint256 votesAgainst,
            bool executed
        ) 
    {
        require(_proposalId < proposalCounter, "Proposal does not exist");
        
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.description,
            proposal.proposer,
            proposal.startTime,
            proposal.endTime,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.executed
        );
    }

    function hasVoted(uint256 _proposalId, address _voter) 
        external 
        view 
        returns (bool) 
    {
        require(_proposalId < proposalCounter, "Proposal does not exist");
        return proposals[_proposalId].hasVoted[_voter];
    }

    function getVoteWeight(uint256 _proposalId, address _voter) 
        external 
        view 
        returns (uint256) 
    {
        require(_proposalId < proposalCounter, "Proposal does not exist");
        return proposals[_proposalId].voteWeight[_voter];
    }

    function getQuorumInfo() 
        external 
        view 
        returns (uint256 totalSupply_, uint256 quorumRequired) 
    {
        totalSupply_ = totalSupply();
        quorumRequired = (totalSupply_ * QUORUM_PERCENTAGE) / 100;
    }

    function isProposalActive(uint256 _proposalId) 
        external 
        view 
        returns (bool) 
    {
        require(_proposalId < proposalCounter, "Proposal does not exist");
        
        Proposal storage proposal = proposals[_proposalId];
        return (
            block.timestamp >= proposal.startTime &&
            block.timestamp <= proposal.endTime &&
            !proposal.executed
        );
    }

    function canPropose(address _user) 
        external 
        view 
        returns (bool) 
    {
        return balanceOf(_user) >= MIN_PROPOSAL_THRESHOLD;
    }

    function getProposalStatus(uint256 _proposalId)
        external
        view
        returns (string memory)
    {
        require(_proposalId < proposalCounter, "Proposal does not exist");
        
        Proposal storage proposal = proposals[_proposalId];
        
        if (proposal.executed) {
            return "Executed";
        } else if (block.timestamp <= proposal.endTime) {
            return "Active";
        } else {
            uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
            uint256 quorumRequired = (totalSupply() * QUORUM_PERCENTAGE) / 100;
            
            if (totalVotes < quorumRequired) {
                return "Failed - No Quorum";
            } else if (proposal.votesFor > proposal.votesAgainst) {
                return "Passed - Awaiting Execution";
            } else {
                return "Failed - Rejected";
            }
        }
    }

    // Governance token should not be transferable during voting
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
        
        // Allow minting and burning
        if (from == address(0) || to == address(0)) {
            return;
        }
        
        // Prevent transfers within 1 day after voting to prevent vote manipulation
        require(
            lastVoteTime[from] == 0 || 
            block.timestamp > lastVoteTime[from] + 1 days,
            "Cannot transfer tokens within 1 day of voting"
        );
    }
}
