// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FanTokenDAO {
    address public admin;
    uint256 public proposalCounter;
    
    // ERC20 implementation
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals = 18;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    struct Proposal {
        uint256 id;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 endTime;
        bool executed;
        address proposer;
        mapping(address => bool) hasVoted;
    }
    
    mapping(uint256 => Proposal) public proposals;
    
    event ProposalCreated(uint256 indexed proposalId, string description, address proposer);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event TokensMinted(address indexed to, uint256 amount);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor(address _admin, string memory name_, string memory symbol_) {
        admin = _admin;
        _name = name_;
        _symbol = symbol_;
    }
    
    // ERC20 functions
    function name() public view returns (string memory) {
        return _name;
    }
    
    function symbol() public view returns (string memory) {
        return _symbol;
    }
    
    function decimals() public view returns (uint8) {
        return _decimals;
    }
    
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;
        
        emit Transfer(from, to, amount);
    }
    
    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "ERC20: mint to the zero address");
        
        _totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
    
    // DAO functions
    function mint(address to, uint256 amount) external onlyAdmin {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    function createProposal(string memory description) external returns (uint256) {
        require(balanceOf(msg.sender) > 0, "Must hold tokens to propose");
        
        proposalCounter++;
        Proposal storage newProposal = proposals[proposalCounter];
        newProposal.id = proposalCounter;
        newProposal.description = description;
        newProposal.endTime = block.timestamp + 7 days;
        newProposal.proposer = msg.sender;
        
        emit ProposalCreated(proposalCounter, description, msg.sender);
        return proposalCounter;
    }
    
    function vote(uint256 proposalId, bool support) external {
        require(proposalId <= proposalCounter, "Proposal does not exist");
        require(balanceOf(msg.sender) > 0, "Must hold tokens to vote");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 weight = balanceOf(msg.sender);
        proposal.hasVoted[msg.sender] = true;
        
        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }
        
        emit Voted(proposalId, msg.sender, support, weight);
    }
    
    function executeProposal(uint256 proposalId) external onlyAdmin {
        require(proposalId <= proposalCounter, "Proposal does not exist");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.endTime, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal failed");
        
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }
    
    function getProposal(uint256 proposalId) external view returns (
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 endTime,
        bool executed,
        address proposer
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.description,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.endTime,
            proposal.executed,
            proposal.proposer
        );
    }
}