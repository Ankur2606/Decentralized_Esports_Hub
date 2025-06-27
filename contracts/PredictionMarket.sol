// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC20Base.sol";

contract PredictionMarket {
    address public admin;
    uint256 public eventCounter;
    
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
    
    event EventCreated(uint256 indexed eventId, string name, string ipfsHash, uint256 endTime);
    event BetPlaced(uint256 indexed eventId, address indexed bettor, uint8 option, uint256 amount);
    event EventResolved(uint256 indexed eventId, uint8 winningOption);
    event WinningsWithdrawn(uint256 indexed eventId, address indexed winner, uint256 amount);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier eventExists(uint256 eventId) {
        require(eventId < eventCounter, "Event does not exist");
        _;
    }
    
    modifier eventNotResolved(uint256 eventId) {
        require(!events[eventId].resolved, "Event already resolved");
        _;
    }
    
    modifier eventResolved(uint256 eventId) {
        require(events[eventId].resolved, "Event not resolved yet");
        _;
    }
    
    constructor(address _admin) {
        admin = _admin;
    }
    
    function createEvent(
        string memory name,
        string memory ipfsHash,
        uint256 endTime
    ) external onlyAdmin returns (uint256) {
        require(endTime > block.timestamp, "End time must be in the future");
        
        uint256 eventId = eventCounter++;
        Event storage newEvent = events[eventId];
        newEvent.id = eventId;
        newEvent.name = name;
        newEvent.ipfsHash = ipfsHash;
        newEvent.endTime = endTime;
        newEvent.resolved = false;
        
        emit EventCreated(eventId, name, ipfsHash, endTime);
        return eventId;
    }
    
    function placeBet(uint256 eventId, uint8 option) 
        external 
        payable 
        eventExists(eventId) 
        eventNotResolved(eventId) 
    {
        require(msg.value >= 0.001 ether, "Minimum bet is 0.001 CHZ");
        require(block.timestamp < events[eventId].endTime, "Betting period has ended");
        require(option < 2, "Invalid option");
        
        Event storage evt = events[eventId];
        evt.userBets[msg.sender][option] += msg.value;
        evt.optionPools[option] += msg.value;
        evt.totalPool += msg.value;
        
        emit BetPlaced(eventId, msg.sender, option, msg.value);
    }
    
    function resolveEvent(uint256 eventId, uint8 winningOption) 
        external 
        onlyAdmin 
        eventExists(eventId) 
        eventNotResolved(eventId) 
    {
        require(winningOption < 2, "Invalid winning option");
        require(block.timestamp >= events[eventId].endTime, "Event has not ended yet");
        
        events[eventId].resolved = true;
        events[eventId].winningOption = winningOption;
        
        emit EventResolved(eventId, winningOption);
    }
    
    function withdrawWinnings(uint256 eventId) 
        external 
        eventExists(eventId) 
        eventResolved(eventId) 
    {
        Event storage evt = events[eventId];
        require(!evt.hasWithdrawn[msg.sender], "Already withdrawn");
        
        uint256 userWinningBet = evt.userBets[msg.sender][evt.winningOption];
        require(userWinningBet > 0, "No winning bet found");
        
        uint256 winningPool = evt.optionPools[evt.winningOption];
        uint256 winnings = (userWinningBet * evt.totalPool) / winningPool;
        
        evt.hasWithdrawn[msg.sender] = true;
        
        (bool success, ) = payable(msg.sender).call{value: winnings}("");
        require(success, "Transfer failed");
        
        emit WinningsWithdrawn(eventId, msg.sender, winnings);
    }
    
    function getEventDetails(uint256 eventId) 
        external 
        view 
        eventExists(eventId) 
        returns (
            string memory name,
            string memory ipfsHash,
            uint256 endTime,
            bool resolved,
            uint8 winningOption,
            uint256 totalPool,
            uint256 option0Pool,
            uint256 option1Pool
        ) 
    {
        Event storage evt = events[eventId];
        return (
            evt.name,
            evt.ipfsHash,
            evt.endTime,
            evt.resolved,
            evt.winningOption,
            evt.totalPool,
            evt.optionPools[0],
            evt.optionPools[1]
        );
    }
    
    function getUserBets(uint256 eventId, address user) 
        external 
        view 
        eventExists(eventId) 
        returns (uint256 option0Bet, uint256 option1Bet) 
    {
        Event storage evt = events[eventId];
        return (evt.userBets[user][0], evt.userBets[user][1]);
    }
}