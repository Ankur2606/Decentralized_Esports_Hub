// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC721Base.sol";

contract Marketplace {
    address public admin;
    uint256 public itemCounter;
    uint256 public constant PLATFORM_FEE = 250; // 2.5% platform fee
    
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        bool sold;
        uint256 listedAt;
        string itemType; // "nft", "virtual_item", etc.
        string metadata;
    }
    
    mapping(uint256 => MarketItem) public marketItems;
    mapping(address => uint256[]) public sellerItems;
    mapping(address => uint256[]) public buyerItems;
    
    event ItemListed(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        string itemType
    );
    
    event ItemSold(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );
    
    event PriceUpdated(uint256 indexed itemId, uint256 oldPrice, uint256 newPrice);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier itemExists(uint256 itemId) {
        require(itemId < itemCounter, "Item does not exist");
        _;
    }
    
    modifier itemNotSold(uint256 itemId) {
        require(!marketItems[itemId].sold, "Item already sold");
        _;
    }
    
    modifier onlySeller(uint256 itemId) {
        require(marketItems[itemId].seller == msg.sender, "Only seller can modify this item");
        _;
    }
    
    constructor(address _admin) {
        admin = _admin;
    }
    
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        string memory itemType,
        string memory metadata
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than zero");
        require(bytes(itemType).length > 0, "Item type cannot be empty");
        
        // If it's an NFT, verify ownership
        if (nftContract != address(0)) {
            IERC721 nft = IERC721(nftContract);
            require(nft.ownerOf(tokenId) == msg.sender, "Must own the NFT to list it");
            require(nft.getApproved(tokenId) == address(this) || 
                   nft.isApprovedForAll(msg.sender, address(this)), 
                   "Marketplace not approved to transfer NFT");
        }
        
        uint256 itemId = itemCounter++;
        MarketItem storage newItem = marketItems[itemId];
        newItem.itemId = itemId;
        newItem.nftContract = nftContract;
        newItem.tokenId = tokenId;
        newItem.seller = msg.sender;
        newItem.price = price;
        newItem.sold = false;
        newItem.listedAt = block.timestamp;
        newItem.itemType = itemType;
        newItem.metadata = metadata;
        
        sellerItems[msg.sender].push(itemId);
        
        emit ItemListed(itemId, nftContract, tokenId, msg.sender, price, itemType);
        return itemId;
    }
    
    function buyItem(uint256 itemId) 
        external 
        payable 
        itemExists(itemId) 
        itemNotSold(itemId) 
    {
        MarketItem storage item = marketItems[itemId];
        require(msg.value >= item.price, "Insufficient payment");
        require(msg.sender != item.seller, "Cannot buy your own item");
        
        item.sold = true;
        item.buyer = msg.sender;
        buyerItems[msg.sender].push(itemId);
        
        // Calculate platform fee
        uint256 platformFeeAmount = (msg.value * PLATFORM_FEE) / 10000;
        uint256 sellerAmount = msg.value - platformFeeAmount;
        
        // Transfer platform fee to admin
        (bool feeSuccess, ) = payable(admin).call{value: platformFeeAmount}("");
        require(feeSuccess, "Platform fee transfer failed");
        
        // Transfer payment to seller
        (bool sellerSuccess, ) = payable(item.seller).call{value: sellerAmount}("");
        require(sellerSuccess, "Seller payment failed");
        
        // Transfer NFT if applicable
        if (item.nftContract != address(0)) {
            IERC721(item.nftContract).transferFrom(item.seller, msg.sender, item.tokenId);
        }
        
        emit ItemSold(itemId, item.nftContract, item.tokenId, item.seller, msg.sender, msg.value);
    }
    
    function updatePrice(uint256 itemId, uint256 newPrice) 
        external 
        itemExists(itemId) 
        itemNotSold(itemId) 
        onlySeller(itemId) 
    {
        require(newPrice > 0, "Price must be greater than zero");
        
        uint256 oldPrice = marketItems[itemId].price;
        marketItems[itemId].price = newPrice;
        
        emit PriceUpdated(itemId, oldPrice, newPrice);
    }
    
    function cancelListing(uint256 itemId) 
        external 
        itemExists(itemId) 
        itemNotSold(itemId) 
        onlySeller(itemId) 
    {
        marketItems[itemId].sold = true; // Mark as sold to prevent further transactions
    }
    
    function getMarketItem(uint256 itemId) 
        external 
        view 
        itemExists(itemId) 
        returns (
            address nftContract,
            uint256 tokenId,
            address seller,
            address buyer,
            uint256 price,
            bool sold,
            uint256 listedAt,
            string memory itemType,
            string memory metadata
        ) 
    {
        MarketItem storage item = marketItems[itemId];
        return (
            item.nftContract,
            item.tokenId,
            item.seller,
            item.buyer,
            item.price,
            item.sold,
            item.listedAt,
            item.itemType,
            item.metadata
        );
    }
    
    function getSellerItems(address seller) external view returns (uint256[] memory) {
        return sellerItems[seller];
    }
    
    function getBuyerItems(address buyer) external view returns (uint256[] memory) {
        return buyerItems[buyer];
    }
    
    function getAllActiveItems() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active items
        for (uint256 i = 0; i < itemCounter; i++) {
            if (!marketItems[i].sold) {
                activeCount++;
            }
        }
        
        // Create array of active item IDs
        uint256[] memory activeItems = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < itemCounter; i++) {
            if (!marketItems[i].sold) {
                activeItems[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return activeItems;
    }
    
    function updatePlatformFee(uint256 newFee) external onlyAdmin {
        require(newFee <= 1000, "Platform fee cannot exceed 10%");
        // Note: This would require a state variable for dynamic fees
        // For simplicity, keeping it constant in this implementation
    }
}