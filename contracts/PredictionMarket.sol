// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract PredictionMarket is Ownable, ReentrancyGuard, Pausable {
    struct Event {
        uint256 id;
        string name;
        string ipfsHash;
        uint256 endTime;
        bool resolved;
        uint8 winningOption;
        uint256 totalPool;
        uint256 option0Pool;
        uint256 option1Pool;
        uint256 betCount;
    }

    struct Bet {
        address bettor;
        uint256 eventId;
        uint8 option;
        uint256 amount;
        uint256 odds;
        bool claimed;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Bet[]) public eventBets;
    mapping(address => uint256[]) public userBets;
    mapping(uint256 => mapping(address => bool)) public hasUserBet;
    
    uint256 public eventCounter;
    uint256 public constant MIN_BET = 0.001 ether; // 0.001 CHZ
    uint256 public constant PLATFORM_FEE = 300; // 3%
    uint256 public constant FEE_DENOMINATOR = 10000;

    event EventCreated(
        uint256 indexed eventId,
        string name,
        string ipfsHash,
        uint256 endTime
    );
    
    event BetPlaced(
        uint256 indexed eventId,
        address indexed bettor,
        uint8 option,
        uint256 amount,
        uint256 odds
    );
    
    event EventResolved(
        uint256 indexed eventId,
        uint8 winningOption
    );
    
    event WinningsClaimed(
        uint256 indexed eventId,
        address indexed winner,
        uint256 amount
    );

    constructor() {}

    function createEvent(
        string memory _name,
        string memory _ipfsHash,
        uint256 _endTime
    ) external onlyOwner {
        require(_endTime > block.timestamp, "End time must be in the future");
        require(bytes(_name).length > 0, "Event name cannot be empty");

        uint256 eventId = eventCounter++;
        
        events[eventId] = Event({
            id: eventId,
            name: _name,
            ipfsHash: _ipfsHash,
            endTime: _endTime,
            resolved: false,
            winningOption: 0,
            totalPool: 0,
            option0Pool: 0,
            option1Pool: 0,
            betCount: 0
        });

        emit EventCreated(eventId, _name, _ipfsHash, _endTime);
    }

    function placeBet(uint256 _eventId, uint8 _option) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(_eventId < eventCounter, "Event does not exist");
        require(msg.value >= MIN_BET, "Bet amount too low");
        require(_option <= 1, "Invalid option");
        
        Event storage eventData = events[_eventId];
        require(block.timestamp < eventData.endTime, "Betting period ended");
        require(!eventData.resolved, "Event already resolved");

        // Calculate odds before the bet (simplified dynamic odds)
        uint256 totalPool = eventData.totalPool;
        uint256 odds;
        
        if (totalPool == 0) {
            odds = 200; // 2.00x initial odds
        } else {
            uint256 thisOptionPool = _option == 0 ? eventData.option0Pool : eventData.option1Pool;
            uint256 otherOptionPool = _option == 0 ? eventData.option1Pool : eventData.option0Pool;
            
            if (thisOptionPool == 0) {
                odds = 300; // 3.00x if no one bet on this option
            } else {
                // Simple odds calculation: (total_pool + bet) / (this_option_pool + bet)
                odds = ((totalPool + msg.value) * 100) / (thisOptionPool + msg.value);
                if (odds < 110) odds = 110; // Minimum 1.10x odds
                if (odds > 1000) odds = 1000; // Maximum 10.00x odds
            }
        }

        // Update event pools
        eventData.totalPool += msg.value;
        eventData.betCount++;
        
        if (_option == 0) {
            eventData.option0Pool += msg.value;
        } else {
            eventData.option1Pool += msg.value;
        }

        // Store bet
        Bet memory newBet = Bet({
            bettor: msg.sender,
            eventId: _eventId,
            option: _option,
            amount: msg.value,
            odds: odds,
            claimed: false
        });

        eventBets[_eventId].push(newBet);
        userBets[msg.sender].push(eventBets[_eventId].length - 1);
        hasUserBet[_eventId][msg.sender] = true;

        emit BetPlaced(_eventId, msg.sender, _option, msg.value, odds);
    }

    function resolveEvent(uint256 _eventId, uint8 _winningOption) 
        external 
        onlyOwner 
    {
        require(_eventId < eventCounter, "Event does not exist");
        require(_winningOption <= 1, "Invalid winning option");
        
        Event storage eventData = events[_eventId];
        require(block.timestamp >= eventData.endTime, "Event not ended yet");
        require(!eventData.resolved, "Event already resolved");

        eventData.resolved = true;
        eventData.winningOption = _winningOption;

        emit EventResolved(_eventId, _winningOption);
    }

    function withdrawWinnings(uint256 _eventId) 
        external 
        nonReentrant 
    {
        require(_eventId < eventCounter, "Event does not exist");
        
        Event storage eventData = events[_eventId];
        require(eventData.resolved, "Event not resolved yet");

        uint256 totalWinnings = 0;
        Bet[] storage bets = eventBets[_eventId];

        for (uint256 i = 0; i < bets.length; i++) {
            Bet storage bet = bets[i];
            
            if (bet.bettor == msg.sender && 
                bet.option == eventData.winningOption && 
                !bet.claimed) {
                
                bet.claimed = true;
                uint256 winAmount = (bet.amount * bet.odds) / 100;
                
                // Apply platform fee
                uint256 fee = (winAmount * PLATFORM_FEE) / FEE_DENOMINATOR;
                uint256 netWinAmount = winAmount - fee;
                
                totalWinnings += netWinAmount;
            }
        }

        require(totalWinnings > 0, "No winnings to claim");
        require(address(this).balance >= totalWinnings, "Insufficient contract balance");

        payable(msg.sender).transfer(totalWinnings);
        
        emit WinningsClaimed(_eventId, msg.sender, totalWinnings);
    }

    function getEvent(uint256 _eventId) 
        external 
        view 
        returns (Event memory) 
    {
        require(_eventId < eventCounter, "Event does not exist");
        return events[_eventId];
    }

    function getEventBets(uint256 _eventId) 
        external 
        view 
        returns (Bet[] memory) 
    {
        require(_eventId < eventCounter, "Event does not exist");
        return eventBets[_eventId];
    }

    function getUserBets(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userBets[_user];
    }

    function getEventOdds(uint256 _eventId) 
        external 
        view 
        returns (uint256 option0Odds, uint256 option1Odds) 
    {
        require(_eventId < eventCounter, "Event does not exist");
        
        Event storage eventData = events[_eventId];
        
        if (eventData.totalPool == 0) {
            return (200, 200); // 2.00x for both options initially
        }

        if (eventData.option0Pool == 0) {
            option0Odds = 300;
        } else {
            option0Odds = (eventData.totalPool * 100) / eventData.option0Pool;
            if (option0Odds < 110) option0Odds = 110;
            if (option0Odds > 1000) option0Odds = 1000;
        }

        if (eventData.option1Pool == 0) {
            option1Odds = 300;
        } else {
            option1Odds = (eventData.totalPool * 100) / eventData.option1Pool;
            if (option1Odds < 110) option1Odds = 110;
            if (option1Odds > 1000) option1Odds = 1000;
        }
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}
