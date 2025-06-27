// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SkillShowcase {
    address public admin;
    uint256 public videoCounter;
    uint256 public constant UPLOAD_REWARD = 0.01 ether; // 0.01 CHZ per upload
    uint256 public constant VERIFICATION_BONUS = 0.05 ether; // Additional 0.05 CHZ for verification
    
    struct Video {
        uint256 id;
        string ipfsHash;
        string title;
        string category;
        address creator;
        uint256 likes;
        uint256 views;
        bool verified;
        bool rewardClaimed;
        uint256 uploadTime;
    }
    
    mapping(uint256 => Video) public videos;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    mapping(address => uint256) public creatorEarnings;
    
    event VideoUploaded(uint256 indexed videoId, address indexed creator, string ipfsHash, string title, string category);
    event VideoLiked(uint256 indexed videoId, address indexed liker);
    event VideoVerified(uint256 indexed videoId, address indexed admin);
    event RewardClaimed(address indexed creator, uint256 amount);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier videoExists(uint256 videoId) {
        require(videoId < videoCounter, "Video does not exist");
        _;
    }
    
    constructor(address _admin) {
        admin = _admin;
    }
    
    function uploadVideo(
        string memory ipfsHash,
        string memory title,
        string memory category
    ) external returns (uint256) {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(category).length > 0, "Category cannot be empty");
        
        uint256 videoId = videoCounter++;
        Video storage newVideo = videos[videoId];
        newVideo.id = videoId;
        newVideo.ipfsHash = ipfsHash;
        newVideo.title = title;
        newVideo.category = category;
        newVideo.creator = msg.sender;
        newVideo.likes = 0;
        newVideo.views = 0;
        newVideo.verified = false;
        newVideo.rewardClaimed = false;
        newVideo.uploadTime = block.timestamp;
        
        // Credit upload reward to creator
        creatorEarnings[msg.sender] += UPLOAD_REWARD;
        
        emit VideoUploaded(videoId, msg.sender, ipfsHash, title, category);
        return videoId;
    }
    
    function likeVideo(uint256 videoId) external videoExists(videoId) {
        require(!hasLiked[videoId][msg.sender], "Already liked this video");
        
        hasLiked[videoId][msg.sender] = true;
        videos[videoId].likes++;
        
        emit VideoLiked(videoId, msg.sender);
    }
    
    function verifyVideo(uint256 videoId) external onlyAdmin videoExists(videoId) {
        require(!videos[videoId].verified, "Video already verified");
        
        videos[videoId].verified = true;
        
        // Credit verification bonus to creator
        address creator = videos[videoId].creator;
        creatorEarnings[creator] += VERIFICATION_BONUS;
        
        emit VideoVerified(videoId, msg.sender);
    }
    
    function incrementViews(uint256 videoId) external videoExists(videoId) {
        videos[videoId].views++;
    }
    
    function claimRewards() external {
        uint256 earnings = creatorEarnings[msg.sender];
        require(earnings > 0, "No rewards to claim");
        require(address(this).balance >= earnings, "Insufficient contract balance");
        
        creatorEarnings[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: earnings}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(msg.sender, earnings);
    }
    
    function getVideoDetails(uint256 videoId) 
        external 
        view 
        videoExists(videoId) 
        returns (
            string memory ipfsHash,
            string memory title,
            string memory category,
            address creator,
            uint256 likes,
            uint256 views,
            bool verified,
            uint256 uploadTime
        ) 
    {
        Video storage video = videos[videoId];
        return (
            video.ipfsHash,
            video.title,
            video.category,
            video.creator,
            video.likes,
            video.views,
            video.verified,
            video.uploadTime
        );
    }
    
    function getCreatorEarnings(address creator) external view returns (uint256) {
        return creatorEarnings[creator];
    }
    
    function hasUserLiked(uint256 videoId, address user) external view returns (bool) {
        return hasLiked[videoId][user];
    }
    
    // Allow contract to receive CHZ for rewards
    receive() external payable {}
    
    // Admin function to fund the contract for rewards
    function fundContract() external payable onlyAdmin {}
    
    // Emergency withdraw function for admin
    function emergencyWithdraw() external onlyAdmin {
        (bool success, ) = payable(admin).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}