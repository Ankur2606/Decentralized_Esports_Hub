// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Marketplace is Ownable, ReentrancyGuard, Pausable, IERC721Receiver {
    struct Listing {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        uint256 listedAt;
        string category; // "course", "collectible", "merchandise"
    }

    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public sellerListings;
    mapping(string => uint256[]) public categoryListings;
    
    uint256 public listingCounter;
    uint256 public constant PLATFORM_FEE = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MIN_PRICE = 0.001 ether; // 0.001 CHZ

    event ItemListed(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        string category
    );
    
    event ItemSold(
        uint256 indexed itemId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    
    event ItemDelisted(
        uint256 indexed itemId,
        address indexed seller
    );
    
    event PriceUpdated(
        uint256 indexed itemId,
        uint256 oldPrice,
        uint256 newPrice
    );

    constructor() {}

    function listItem(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price,
        string memory _category
    ) external whenNotPaused returns (uint256) {
        require(_price >= MIN_PRICE, "Price too low");
        require(_nftContract != address(0), "Invalid NFT contract");
        require(
            keccak256(bytes(_category)) == keccak256(bytes("course")) ||
            keccak256(bytes(_category)) == keccak256(bytes("collectible")) ||
            keccak256(bytes(_category)) == keccak256(bytes("merchandise")),
            "Invalid category"
        );

        IERC721 nft = IERC721(_nftContract);
        require(nft.ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(
            nft.getApproved(_tokenId) == address(this) || 
            nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        uint256 itemId = listingCounter++;
        
        listings[itemId] = Listing({
            itemId: itemId,
            nftContract: _nftContract,
            tokenId: _tokenId,
            seller: msg.sender,
            price: _price,
            active: true,
            listedAt: block.timestamp,
            category: _category
        });

        sellerListings[msg.sender].push(itemId);
        categoryListings[_category].push(itemId);

        // Transfer NFT to marketplace for escrow
        nft.safeTransferFrom(msg.sender, address(this), _tokenId);

        emit ItemListed(itemId, _nftContract, _tokenId, msg.sender, _price, _category);
        
        return itemId;
    }

    function buyItem(uint256 _itemId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(_itemId < listingCounter, "Item does not exist");
        
        Listing storage listing = listings[_itemId];
        require(listing.active, "Item not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own item");

        // Calculate fees
        uint256 platformFee = (listing.price * PLATFORM_FEE) / FEE_DENOMINATOR;
        uint256 sellerPayment = listing.price - platformFee;

        // Mark as sold
        listing.active = false;

        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(
            address(this), 
            msg.sender, 
            listing.tokenId
        );

        // Pay seller
        payable(listing.seller).transfer(sellerPayment);

        // Refund excess payment
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        emit ItemSold(_itemId, msg.sender, listing.seller, listing.price);
    }

    function delistItem(uint256 _itemId) 
        external 
        nonReentrant 
    {
        require(_itemId < listingCounter, "Item does not exist");
        
        Listing storage listing = listings[_itemId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.active, "Item not active");

        listing.active = false;

        // Return NFT to seller
        IERC721(listing.nftContract).safeTransferFrom(
            address(this), 
            msg.sender, 
            listing.tokenId
        );

        emit ItemDelisted(_itemId, msg.sender);
    }

    function updatePrice(uint256 _itemId, uint256 _newPrice) 
        external 
    {
        require(_itemId < listingCounter, "Item does not exist");
        require(_newPrice >= MIN_PRICE, "Price too low");
        
        Listing storage listing = listings[_itemId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.active, "Item not active");

        uint256 oldPrice = listing.price;
        listing.price = _newPrice;

        emit PriceUpdated(_itemId, oldPrice, _newPrice);
    }

    function getListing(uint256 _itemId) 
        external 
        view 
        returns (Listing memory) 
    {
        require(_itemId < listingCounter, "Item does not exist");
        return listings[_itemId];
    }

    function getActiveListings() 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory activeListings = new uint256[](listingCounter);
        uint256 count = 0;

        for (uint256 i = 0; i < listingCounter; i++) {
            if (listings[i].active) {
                activeListings[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeListings[i];
        }

        return result;
    }

    function getListingsByCategory(string memory _category) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory categoryItems = categoryListings[_category];
        uint256[] memory activeItems = new uint256[](categoryItems.length);
        uint256 count = 0;

        for (uint256 i = 0; i < categoryItems.length; i++) {
            if (listings[categoryItems[i]].active) {
                activeItems[count] = categoryItems[i];
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeItems[i];
        }

        return result;
    }

    function getSellerListings(address _seller) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory sellerItems = sellerListings[_seller];
        uint256[] memory activeItems = new uint256[](sellerItems.length);
        uint256 count = 0;

        for (uint256 i = 0; i < sellerItems.length; i++) {
            if (listings[sellerItems[i]].active) {
                activeItems[count] = sellerItems[i];
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeItems[i];
        }

        return result;
    }

    function getListingsByPriceRange(uint256 _minPrice, uint256 _maxPrice) 
        external 
        view 
        returns (uint256[] memory) 
    {
        require(_minPrice <= _maxPrice, "Invalid price range");

        uint256[] memory rangeListings = new uint256[](listingCounter);
        uint256 count = 0;

        for (uint256 i = 0; i < listingCounter; i++) {
            if (
                listings[i].active &&
                listings[i].price >= _minPrice &&
                listings[i].price <= _maxPrice
            ) {
                rangeListings[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = rangeListings[i];
        }

        return result;
    }

    function getMarketplaceStats() 
        external 
        view 
        returns (
            uint256 totalListings,
            uint256 activeListings,
            uint256 totalVolume,
            uint256 totalSales
        ) 
    {
        totalListings = listingCounter;
        uint256 activeListing = 0;
        uint256 volume = 0;
        uint256 sales = 0;

        for (uint256 i = 0; i < listingCounter; i++) {
            if (listings[i].active) {
                activeListing++;
            } else {
                // If not active and was listed, it was sold
                volume += listings[i].price;
                sales++;
            }
        }

        activeListings = activeListing;
        totalVolume = volume;
        totalSales = sales;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
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

    function emergencyWithdrawNFT(
        address _nftContract,
        uint256 _tokenId
    ) external onlyOwner {
        // Emergency function to withdraw stuck NFTs
        IERC721(_nftContract).safeTransferFrom(address(this), owner(), _tokenId);
    }

    receive() external payable {}
}
