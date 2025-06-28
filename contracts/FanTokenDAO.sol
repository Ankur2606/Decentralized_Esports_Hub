// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract FanTokenDAO is IERC20 {
    address public admin;
    uint256 public proposalCounter;
    
    struct Proposal {
        uint256 id;
        string description;
        address creator;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    
    event ProposalCreated(uint256 indexed proposalId, address indexed creator, string description, uint256 endTime);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposalCounter, "Proposal does not exist");
        _;
    }
    
    modifier proposalActive(uint256 proposalId) {
        require(block.timestamp < proposals[proposalId].endTime, "Proposal voting period has ended");
        require(!proposals[proposalId].executed, "Proposal already executed");
        _;
    }
    
    constructor(
        address _admin,
        string memory _name,
        string memory _symbol
    ) ERC20Base(_admin, _name, _symbol) {
        admin = _admin;
    }
    
    function mint(address to, uint256 amount) external onlyAdmin {
        _mint(to, amount);
    }
    
    function createProposal(string memory description) external returns (uint256) {
        require(balanceOf(msg.sender) > 0, "Must hold tokens to create proposal");
        
        uint256 proposalId = proposalCounter++;
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.description = description;
        newProposal.creator = msg.sender;
        newProposal.endTime = block.timestamp + 7 days; // 7 day voting period
        newProposal.executed = false;
        
        emit ProposalCreated(proposalId, msg.sender, description, newProposal.endTime);
        return proposalId;
    }
    
    function vote(uint256 proposalId, bool support) 
        external 
        proposalExists(proposalId) 
        proposalActive(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.hasVoted[msg.sender], "Already voted on this proposal");
        
        uint256 voterBalance = balanceOf(msg.sender);
        require(voterBalance > 0, "Must hold tokens to vote");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.votesFor += voterBalance;
        } else {
            proposal.votesAgainst += voterBalance;
        }
        
        emit VoteCast(proposalId, msg.sender, support, voterBalance);
    }
    
    function executeProposal(uint256 proposalId) 
        external 
        onlyAdmin 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal did not pass");
        
        proposal.executed = true;
        
        emit ProposalExecuted(proposalId);
    }
    
    function getProposalDetails(uint256 proposalId) 
        external 
        view 
        proposalExists(proposalId) 
        returns (
            string memory description,
            address creator,
            uint256 votesFor,
            uint256 votesAgainst,
            uint256 endTime,
            bool executed
        ) 
    {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.description,
            proposal.creator,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.endTime,
            proposal.executed
        );
    }
    
    function hasVoted(uint256 proposalId, address voter) 
        external 
        view 
        proposalExists(proposalId) 
        returns (bool) 
    {
        return proposals[proposalId].hasVoted[voter];
    }
}