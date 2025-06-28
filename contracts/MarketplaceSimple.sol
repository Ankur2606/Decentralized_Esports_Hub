// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    address public admin;
    uint256 public itemCounter;
    uint256 public platformFeePercent = 250; // 2.5%
    
    struct MarketplaceItem {
        uint256 itemId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool sold;
        address buyer;
        string itemType;
    }
    
    mapping(uint256 => MarketplaceItem) public items;
    mapping(address => uint256[]) public userListings;
    
    event ItemListed(uint256 indexed itemId, address indexed seller, uint256 price, string itemType);
    event ItemSold(uint256 indexed itemId, address indexed buyer, uint256 price);
    event ItemPriceUpdated(uint256 indexed itemId, uint256 newPrice);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier itemExists(uint256 itemId) {
        require(itemId <= itemCounter, "Item does not exist");
        _;
    }
    
    constructor(address _admin) {
        admin = _admin;
    }
    
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        string memory itemType
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        
        itemCounter++;
        items[itemCounter] = MarketplaceItem({
            itemId: itemCounter,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            sold: false,
            buyer: address(0),
            itemType: itemType
        });
        
        userListings[msg.sender].push(itemCounter);
        
        emit ItemListed(itemCounter, msg.sender, price, itemType);
        return itemCounter;
    }
    
    function buyItem(uint256 itemId) external payable itemExists(itemId) {
        MarketplaceItem storage item = items[itemId];
        require(!item.sold, "Item already sold");
        require(msg.value >= item.price, "Insufficient payment");
        require(msg.sender != item.seller, "Cannot buy own item");
        
        uint256 platformFee = (item.price * platformFeePercent) / 10000;
        uint256 sellerAmount = item.price - platformFee;
        
        item.sold = true;
        item.buyer = msg.sender;
        
        // Pay seller
        (bool success1, ) = item.seller.call{value: sellerAmount}("");
        require(success1, "Seller payment failed");
        
        // Pay platform fee to admin
        if (platformFee > 0) {
            (bool success2, ) = admin.call{value: platformFee}("");
            require(success2, "Platform fee payment failed");
        }
        
        // Refund excess payment
        if (msg.value > item.price) {
            (bool success3, ) = msg.sender.call{value: msg.value - item.price}("");
            require(success3, "Refund failed");
        }
        
        emit ItemSold(itemId, msg.sender, item.price);
    }
    
    function updatePrice(uint256 itemId, uint256 newPrice) external itemExists(itemId) {
        MarketplaceItem storage item = items[itemId];
        require(msg.sender == item.seller, "Only seller can update price");
        require(!item.sold, "Cannot update price of sold item");
        require(newPrice > 0, "Price must be greater than 0");
        
        item.price = newPrice;
        emit ItemPriceUpdated(itemId, newPrice);
    }
    
    function getItem(uint256 itemId) external view itemExists(itemId) returns (
        address seller,
        address nftContract,
        uint256 tokenId,
        uint256 price,
        bool sold,
        address buyer,
        string memory itemType
    ) {
        MarketplaceItem storage item = items[itemId];
        return (
            item.seller,
            item.nftContract,
            item.tokenId,
            item.price,
            item.sold,
            item.buyer,
            item.itemType
        );
    }
    
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }
    
    function setPlatformFee(uint256 newFeePercent) external onlyAdmin {
        require(newFeePercent <= 1000, "Fee cannot exceed 10%");
        platformFeePercent = newFeePercent;
    }
    
    function withdrawFees() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = admin.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}