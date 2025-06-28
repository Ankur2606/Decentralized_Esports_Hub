// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PredictionMarket {
    address public admin;
    uint256 public eventCounter;
    uint256 public constant MIN_BET = 0.001 ether;
    
    struct Event {
        uint256 id;
        string name;
        string ipfsHash;
        uint256 endTime;
        bool resolved;
        uint8 winningOption;
        uint256 totalPool;
        mapping(uint8 => uint256) optionPools;
        mapping(address => mapping(uint8 => uint256)) userBets;
        mapping(address => bool) hasWithdrawn;
    }
    
    mapping(uint256 => Event) public events;
    
    event EventCreated(uint256 indexed eventId, string name, uint256 endTime);
    event BetPlaced(uint256 indexed eventId, address indexed user, uint8 option, uint256 amount);
    event EventResolved(uint256 indexed eventId, uint8 winningOption);
    event WinningsWithdrawn(uint256 indexed eventId, address indexed user, uint256 amount);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier eventExists(uint256 eventId) {
        require(eventId <= eventCounter, "Event does not exist");
        _;
    }
    
    constructor(address _admin) {
        admin = _admin;
    }
    
    function createEvent(string memory name, string memory ipfsHash, uint256 endTime) external onlyAdmin returns (uint256) {
        require(endTime > block.timestamp, "End time must be in future");
        
        eventCounter++;
        Event storage newEvent = events[eventCounter];
        newEvent.id = eventCounter;
        newEvent.name = name;
        newEvent.ipfsHash = ipfsHash;
        newEvent.endTime = endTime;
        newEvent.resolved = false;
        
        emit EventCreated(eventCounter, name, endTime);
        return eventCounter;
    }
    
    function placeBet(uint256 eventId, uint8 option) external payable eventExists(eventId) {
        require(msg.value >= MIN_BET, "Bet too small");
        require(option <= 1, "Invalid option");
        require(block.timestamp < events[eventId].endTime, "Betting closed");
        require(!events[eventId].resolved, "Event resolved");
        
        Event storage event_ = events[eventId];
        event_.userBets[msg.sender][option] += msg.value;
        event_.optionPools[option] += msg.value;
        event_.totalPool += msg.value;
        
        emit BetPlaced(eventId, msg.sender, option, msg.value);
    }
    
    function resolveEvent(uint256 eventId, uint8 winningOption) external onlyAdmin eventExists(eventId) {
        require(!events[eventId].resolved, "Already resolved");
        require(block.timestamp >= events[eventId].endTime, "Event not ended");
        require(winningOption <= 1, "Invalid option");
        
        events[eventId].resolved = true;
        events[eventId].winningOption = winningOption;
        
        emit EventResolved(eventId, winningOption);
    }
    
    function withdrawWinnings(uint256 eventId) external eventExists(eventId) {
        Event storage event_ = events[eventId];
        require(event_.resolved, "Event not resolved");
        require(!event_.hasWithdrawn[msg.sender], "Already withdrawn");
        
        uint256 userBet = event_.userBets[msg.sender][event_.winningOption];
        require(userBet > 0, "No winning bet");
        
        uint256 winningPool = event_.optionPools[event_.winningOption];
        uint256 winnings = (userBet * event_.totalPool) / winningPool;
        
        event_.hasWithdrawn[msg.sender] = true;
        
        (bool success, ) = msg.sender.call{value: winnings}("");
        require(success, "Transfer failed");
        
        emit WinningsWithdrawn(eventId, msg.sender, winnings);
    }
    
    function getEventDetails(uint256 eventId) external view eventExists(eventId) returns (
        string memory name,
        string memory ipfsHash,
        uint256 endTime,
        bool resolved,
        uint8 winningOption,
        uint256 totalPool
    ) {
        Event storage event_ = events[eventId];
        return (
            event_.name,
            event_.ipfsHash,
            event_.endTime,
            event_.resolved,
            event_.winningOption,
            event_.totalPool
        );
    }
    
    function getUserBet(uint256 eventId, address user, uint8 option) external view returns (uint256) {
        return events[eventId].userBets[user][option];
    }
    
    function getOptionPool(uint256 eventId, uint8 option) external view returns (uint256) {
        return events[eventId].optionPools[option];
    }
}