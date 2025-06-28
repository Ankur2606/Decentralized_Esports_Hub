// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PredictionMarket {
    address public admin = 0x0734EdcC126a08375a08C02c3117d44B24dF47Fa;
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
    
    constructor() {
        // Admin is hardcoded at declaration
    }
    
    function createEvent(string memory name, string memory ipfsHash, uint256 endTime) external onlyAdmin returns (uint256) {
        require(endTime > block.timestamp, "End time must be in future");
        
        eventCounter++;
        Event storage newEvent = events[eventCounter];
        newEvent.id = eventCounter;
        newEvent.name = name;
        newEvent.ipfsHash = ipfsHash;
        newEvent.endTime = endTime;
        
        emit EventCreated(eventCounter, name, endTime);
        return eventCounter;
    }
    
    function placeBet(uint256 eventId, uint8 option) external payable eventExists(eventId) {
        require(msg.value >= MIN_BET, "Bet below minimum");
        require(option == 0 || option == 1, "Invalid option");
        require(block.timestamp < events[eventId].endTime, "Event ended");
        require(!events[eventId].resolved, "Event resolved");
        
        Event storage eventData = events[eventId];
        eventData.userBets[msg.sender][option] += msg.value;
        eventData.optionPools[option] += msg.value;
        eventData.totalPool += msg.value;
        
        emit BetPlaced(eventId, msg.sender, option, msg.value);
    }
    
    function resolveEvent(uint256 eventId, uint8 winningOption) external onlyAdmin eventExists(eventId) {
        require(!events[eventId].resolved, "Already resolved");
        require(block.timestamp >= events[eventId].endTime, "Event not ended");
        require(winningOption == 0 || winningOption == 1, "Invalid option");
        
        events[eventId].resolved = true;
        events[eventId].winningOption = winningOption;
        
        emit EventResolved(eventId, winningOption);
    }
    
    function withdrawWinnings(uint256 eventId) external eventExists(eventId) {
        require(events[eventId].resolved, "Event not resolved");
        require(!events[eventId].hasWithdrawn[msg.sender], "Already withdrawn");
        
        Event storage eventData = events[eventId];
        uint256 userBet = eventData.userBets[msg.sender][eventData.winningOption];
        require(userBet > 0, "No winning bet");
        
        uint256 winnings = (userBet * eventData.totalPool) / eventData.optionPools[eventData.winningOption];
        eventData.hasWithdrawn[msg.sender] = true;
        
        payable(msg.sender).transfer(winnings);
        emit WinningsWithdrawn(eventId, msg.sender, winnings);
    }
    
    function getEvent(uint256 eventId) external view eventExists(eventId) returns (
        uint256 id,
        string memory name,
        string memory ipfsHash,
        uint256 endTime,
        bool resolved,
        uint8 winningOption,
        uint256 totalPool
    ) {
        Event storage eventData = events[eventId];
        return (
            eventData.id,
            eventData.name,
            eventData.ipfsHash,
            eventData.endTime,
            eventData.resolved,
            eventData.winningOption,
            eventData.totalPool
        );
    }
    
    function getUserBet(uint256 eventId, address user, uint8 option) external view returns (uint256) {
        return events[eventId].userBets[user][option];
    }
    
    function getOptionPool(uint256 eventId, uint8 option) external view returns (uint256) {
        return events[eventId].optionPools[option];
    }
}