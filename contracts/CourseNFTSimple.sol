// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CourseNFT {
    address public admin;
    address public royaltyRecipient;
    uint256 public royaltyBps;
    uint256 public tokenIdCounter;
    string private _name;
    string private _symbol;
    
    // ERC721 implementation
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    struct Course {
        uint256 tokenId;
        string uri;
        uint256 price;
        address creator;
        bool purchased;
        address purchaser;
    }
    
    mapping(uint256 => Course) public courses;
    mapping(uint256 => string) private _tokenURIs;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event CourseMinted(uint256 indexed tokenId, string uri, uint256 price);
    event CoursePurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor(
        address _admin,
        string memory name_,
        string memory symbol_,
        address _royaltyRecipient,
        uint256 _royaltyBps
    ) {
        admin = _admin;
        _name = name_;
        _symbol = symbol_;
        royaltyRecipient = _royaltyRecipient;
        royaltyBps = _royaltyBps;
    }
    
    // ERC721 functions
    function name() public view returns (string memory) {
        return _name;
    }
    
    function symbol() public view returns (string memory) {
        return _symbol;
    }
    
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "ERC721: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
    
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "ERC721: balance query for the zero address");
        return _balances[owner];
    }
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "ERC721: owner query for nonexistent token");
        return owner;
    }
    
    function approve(address to, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");
        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "ERC721: approve caller is not owner nor approved for all"
        );
        _approve(to, tokenId);
    }
    
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "ERC721: approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "ERC721: approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        transferFrom(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory) public {
        transferFrom(from, to, tokenId);
    }
    
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }
    
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");
        
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
        require(to != address(0), "ERC721: transfer to the zero address");
        
        _approve(address(0), tokenId);
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
    
    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }
    
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = uri;
    }
    
    // Course functions
    function lazyMint(string memory uri, uint256 price) external onlyAdmin returns (uint256) {
        require(price >= 0.1 ether, "Price too low");
        
        tokenIdCounter++;
        uint256 tokenId = tokenIdCounter;
        
        courses[tokenId] = Course({
            tokenId: tokenId,
            uri: uri,
            price: price,
            creator: msg.sender,
            purchased: false,
            purchaser: address(0)
        });
        
        _mint(address(this), tokenId);
        _setTokenURI(tokenId, uri);
        
        emit CourseMinted(tokenId, uri, price);
        return tokenId;
    }
    
    function purchase(uint256 tokenId) external payable {
        require(_exists(tokenId), "Course does not exist");
        require(!courses[tokenId].purchased, "Course already purchased");
        require(msg.value >= courses[tokenId].price, "Insufficient payment");
        
        courses[tokenId].purchased = true;
        courses[tokenId].purchaser = msg.sender;
        
        // Calculate royalty
        uint256 royaltyAmount = (msg.value * royaltyBps) / 10000;
        uint256 creatorAmount = msg.value - royaltyAmount;
        
        // Transfer NFT to buyer
        _transfer(address(this), msg.sender, tokenId);
        
        // Pay creator
        (bool success1, ) = courses[tokenId].creator.call{value: creatorAmount}("");
        require(success1, "Creator payment failed");
        
        // Pay royalty
        if (royaltyAmount > 0) {
            (bool success2, ) = royaltyRecipient.call{value: royaltyAmount}("");
            require(success2, "Royalty payment failed");
        }
        
        emit CoursePurchased(tokenId, msg.sender, msg.value);
    }
    
    function getCourse(uint256 tokenId) external view returns (
        string memory uri,
        uint256 price,
        address creator,
        bool purchased,
        address purchaser
    ) {
        Course storage course = courses[tokenId];
        return (
            course.uri,
            course.price,
            course.creator,
            course.purchased,
            course.purchaser
        );
    }
    
    function setRoyalty(address recipient, uint256 bps) external onlyAdmin {
        require(bps <= 1000, "Royalty too high"); // Max 10%
        royaltyRecipient = recipient;
        royaltyBps = bps;
    }
    
    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC165
            interfaceId == 0x80ac58cd || // ERC721
            interfaceId == 0x5b5e139f;   // ERC721Metadata
    }
}