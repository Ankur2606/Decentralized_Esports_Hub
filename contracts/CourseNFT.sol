// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC721LazyMint.sol";
import "@thirdweb-dev/contracts/extension/Royalty.sol";

contract CourseNFT is ERC721LazyMint, Royalty {
    address public admin;
    uint256 public tokenCounter;
    
    struct Course {
        uint256 tokenId;
        string uri;
        uint256 price;
        address creator;
        bool purchased;
        address purchaser;
        uint256 createdAt;
    }
    
    mapping(uint256 => Course) public courses;
    mapping(address => uint256[]) public creatorCourses;
    mapping(address => uint256[]) public purchasedCourses;
    
    event CourseMinted(uint256 indexed tokenId, address indexed creator, string uri, uint256 price);
    event CoursePurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier courseExists(uint256 tokenId) {
        require(tokenId < tokenCounter, "Course does not exist");
        _;
    }
    
    modifier courseNotPurchased(uint256 tokenId) {
        require(!courses[tokenId].purchased, "Course already purchased");
        _;
    }
    
    constructor(
        address _admin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps
    ) ERC721LazyMint(_admin, _name, _symbol, _royaltyRecipient, _royaltyBps) {
        admin = _admin;
    }
    
    function lazyMint(
        string memory uri,
        uint256 price
    ) external returns (uint256) {
        require(price >= 0.1 ether, "Minimum price is 0.1 CHZ");
        require(bytes(uri).length > 0, "URI cannot be empty");
        
        uint256 tokenId = tokenCounter++;
        Course storage newCourse = courses[tokenId];
        newCourse.tokenId = tokenId;
        newCourse.uri = uri;
        newCourse.price = price;
        newCourse.creator = msg.sender;
        newCourse.purchased = false;
        newCourse.createdAt = block.timestamp;
        
        creatorCourses[msg.sender].push(tokenId);
        
        // Lazy mint the NFT
        _safeMint(msg.sender, tokenId);
        
        emit CourseMinted(tokenId, msg.sender, uri, price);
        return tokenId;
    }
    
    function purchase(uint256 tokenId) 
        external 
        payable 
        courseExists(tokenId) 
        courseNotPurchased(tokenId) 
    {
        Course storage course = courses[tokenId];
        require(msg.value >= course.price, "Insufficient payment");
        require(msg.sender != course.creator, "Cannot purchase own course");
        
        course.purchased = true;
        course.purchaser = msg.sender;
        purchasedCourses[msg.sender].push(tokenId);
        
        // Transfer payment to creator (minus royalty)
        uint256 royaltyAmount = (msg.value * royaltyInfo(tokenId, msg.value).royaltyAmount) / 10000;
        uint256 creatorAmount = msg.value - royaltyAmount;
        
        // Send royalty to royalty recipient
        (bool royaltySuccess, ) = payable(royaltyInfo(tokenId, msg.value).receiver).call{value: royaltyAmount}("");
        require(royaltySuccess, "Royalty transfer failed");
        
        // Send remaining to creator
        (bool creatorSuccess, ) = payable(course.creator).call{value: creatorAmount}("");
        require(creatorSuccess, "Creator payment failed");
        
        // Transfer NFT to buyer
        _transfer(course.creator, msg.sender, tokenId);
        
        emit CoursePurchased(tokenId, msg.sender, msg.value);
    }
    
    function setRoyalty(address recipient, uint256 bps) external onlyAdmin {
        _setupDefaultRoyalty(recipient, uint96(bps));
    }
    
    function getCourseDetails(uint256 tokenId) 
        external 
        view 
        courseExists(tokenId) 
        returns (
            string memory uri,
            uint256 price,
            address creator,
            bool purchased,
            address purchaser,
            uint256 createdAt
        ) 
    {
        Course storage course = courses[tokenId];
        return (
            course.uri,
            course.price,
            course.creator,
            course.purchased,
            course.purchaser,
            course.createdAt
        );
    }
    
    function getCreatorCourses(address creator) external view returns (uint256[] memory) {
        return creatorCourses[creator];
    }
    
    function getPurchasedCourses(address buyer) external view returns (uint256[] memory) {
        return purchasedCourses[buyer];
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return courses[tokenId].uri;
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override(ERC721LazyMint, IERC165) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId) || type(IERC2981).interfaceId == interfaceId;
    }
}