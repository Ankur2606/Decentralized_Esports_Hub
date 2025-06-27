// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract CourseNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, IERC2981 {
    using Counters for Counters.Counter;

    struct Course {
        uint256 tokenId;
        string title;
        address creator;
        uint256 price;
        string category;
        string duration;
        bool isActive;
        uint256 sales;
        uint256 totalRoyalties;
    }

    mapping(uint256 => Course) public courses;
    mapping(uint256 => uint256) public royaltyPercentage; // tokenId => percentage (in basis points)
    mapping(address => uint256[]) public creatorCourses;
    mapping(address => uint256) public creatorEarnings;
    
    Counters.Counter private _tokenIdCounter;
    
    uint256 public constant MAX_ROYALTY = 1000; // 10%
    uint256 public constant PLATFORM_FEE = 300; // 3%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MIN_PRICE = 0.1 ether; // 0.1 CHZ

    event CourseMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        uint256 price,
        string uri
    );
    
    event CoursePurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed creator,
        uint256 price
    );
    
    event RoyaltySet(
        uint256 indexed tokenId,
        uint256 percentage
    );
    
    event CreatorPaid(
        address indexed creator,
        uint256 amount
    );

    constructor() ERC721("ChiliZ Course NFT", "CCNFT") {}

    function lazyMint(
        string memory _uri,
        string memory _title,
        string memory _category,
        string memory _duration,
        uint256 _price
    ) external returns (uint256) {
        require(_price >= MIN_PRICE, "Price too low");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_uri).length > 0, "URI cannot be empty");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        courses[tokenId] = Course({
            tokenId: tokenId,
            title: _title,
            creator: msg.sender,
            price: _price,
            category: _category,
            duration: _duration,
            isActive: true,
            sales: 0,
            totalRoyalties: 0
        });

        creatorCourses[msg.sender].push(tokenId);
        
        // Set default royalty to 5%
        royaltyPercentage[tokenId] = 500; // 5%

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _uri);

        emit CourseMinted(tokenId, msg.sender, _title, _price, _uri);
        
        return tokenId;
    }

    function purchase(uint256 _tokenId) 
        external 
        payable 
        nonReentrant 
    {
        require(_exists(_tokenId), "Course does not exist");
        
        Course storage course = courses[_tokenId];
        require(course.isActive, "Course not available");
        require(msg.value >= course.price, "Insufficient payment");
        require(ownerOf(_tokenId) != msg.sender, "Cannot buy own course");

        address creator = course.creator;
        uint256 price = course.price;

        // Calculate fees and payments
        uint256 platformFee = (price * PLATFORM_FEE) / FEE_DENOMINATOR;
        uint256 creatorPayment = price - platformFee;

        // Update course stats
        course.sales++;
        creatorEarnings[creator] += creatorPayment;

        // Transfer NFT to buyer
        address currentOwner = ownerOf(_tokenId);
        _transfer(currentOwner, msg.sender, _tokenId);

        // Pay creator
        payable(creator).transfer(creatorPayment);

        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit CoursePurchased(_tokenId, msg.sender, creator, price);
        emit CreatorPaid(creator, creatorPayment);
    }

    function setRoyalty(uint256 _tokenId, uint256 _percentage) 
        external 
    {
        require(_exists(_tokenId), "Course does not exist");
        require(courses[_tokenId].creator == msg.sender, "Not the creator");
        require(_percentage <= MAX_ROYALTY, "Royalty too high");

        royaltyPercentage[_tokenId] = _percentage;
        
        emit RoyaltySet(_tokenId, _percentage);
    }

    function updateCoursePrice(uint256 _tokenId, uint256 _newPrice) 
        external 
    {
        require(_exists(_tokenId), "Course does not exist");
        require(courses[_tokenId].creator == msg.sender, "Not the creator");
        require(_newPrice >= MIN_PRICE, "Price too low");

        courses[_tokenId].price = _newPrice;
    }

    function toggleCourseActive(uint256 _tokenId) 
        external 
    {
        require(_exists(_tokenId), "Course does not exist");
        require(courses[_tokenId].creator == msg.sender, "Not the creator");

        courses[_tokenId].isActive = !courses[_tokenId].isActive;
    }

    function getCourse(uint256 _tokenId) 
        external 
        view 
        returns (Course memory) 
    {
        require(_exists(_tokenId), "Course does not exist");
        return courses[_tokenId];
    }

    function getCreatorCourses(address _creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorCourses[_creator];
    }

    function getCoursesByCategory(string memory _category) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 totalSupply = _tokenIdCounter.current();
        uint256[] memory categoryCourses = new uint256[](totalSupply);
        uint256 count = 0;

        for (uint256 i = 0; i < totalSupply; i++) {
            if (
                _exists(i) && 
                courses[i].isActive &&
                keccak256(bytes(courses[i].category)) == keccak256(bytes(_category))
            ) {
                categoryCourses[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = categoryCourses[i];
        }

        return result;
    }

    function getPopularCourses(uint256 _limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 totalSupply = _tokenIdCounter.current();
        require(_limit > 0 && _limit <= totalSupply, "Invalid limit");

        uint256[] memory activeCourses = new uint256[](totalSupply);
        uint256 activeCount = 0;

        // Get all active courses
        for (uint256 i = 0; i < totalSupply; i++) {
            if (_exists(i) && courses[i].isActive) {
                activeCourses[activeCount] = i;
                activeCount++;
            }
        }

        if (activeCount == 0) {
            return new uint256[](0);
        }

        // Sort by sales (simple bubble sort)
        for (uint256 i = 0; i < activeCount - 1; i++) {
            for (uint256 j = 0; j < activeCount - i - 1; j++) {
                if (courses[activeCourses[j]].sales < courses[activeCourses[j + 1]].sales) {
                    uint256 temp = activeCourses[j];
                    activeCourses[j] = activeCourses[j + 1];
                    activeCourses[j + 1] = temp;
                }
            }
        }

        // Return top courses
        uint256 returnCount = _limit > activeCount ? activeCount : _limit;
        uint256[] memory popular = new uint256[](returnCount);
        for (uint256 i = 0; i < returnCount; i++) {
            popular[i] = activeCourses[i];
        }

        return popular;
    }

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        override
        returns (address, uint256)
    {
        require(_exists(_tokenId), "Course does not exist");
        
        address creator = courses[_tokenId].creator;
        uint256 royaltyAmount = (_salePrice * royaltyPercentage[_tokenId]) / FEE_DENOMINATOR;
        
        return (creator, royaltyAmount);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721URIStorage) 
    {
        super._burn(tokenId);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    receive() external payable {}
}
