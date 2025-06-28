// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SkillShowcase {
    address public admin;
    uint256 public videoCounter;
    uint256 public constant UPLOAD_REWARD = 0.01 ether;
    
    struct Video {
        uint256 id;
        address creator;
        string title;
        string ipfsHash;
        string category;
        uint256 likes;
        uint256 views;
        bool verified;
        bool rewardClaimed;
        uint256 uploadTime;
    }
    
    mapping(uint256 => Video) public videos;
    mapping(address => uint256[]) public userVideos;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    
    event VideoUploaded(uint256 indexed videoId, address indexed creator, string title);
    event VideoLiked(uint256 indexed videoId, address indexed user);
    event VideoVerified(uint256 indexed videoId);
    event RewardClaimed(uint256 indexed videoId, address indexed creator, uint256 amount);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier videoExists(uint256 videoId) {
        require(videoId <= videoCounter, "Video does not exist");
        _;
    }
    
    constructor(address _admin) {
        admin = _admin;
    }
    
    receive() external payable {}
    
    function uploadVideo(string memory title, string memory ipfsHash, string memory category) external returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        
        videoCounter++;
        Video storage newVideo = videos[videoCounter];
        newVideo.id = videoCounter;
        newVideo.creator = msg.sender;
        newVideo.title = title;
        newVideo.ipfsHash = ipfsHash;
        newVideo.category = category;
        newVideo.uploadTime = block.timestamp;
        
        userVideos[msg.sender].push(videoCounter);
        
        emit VideoUploaded(videoCounter, msg.sender, title);
        return videoCounter;
    }
    
    function likeVideo(uint256 videoId) external videoExists(videoId) {
        require(!hasLiked[videoId][msg.sender], "Already liked");
        
        videos[videoId].likes++;
        hasLiked[videoId][msg.sender] = true;
        
        emit VideoLiked(videoId, msg.sender);
    }
    
    function verifyVideo(uint256 videoId) external onlyAdmin videoExists(videoId) {
        videos[videoId].verified = true;
        emit VideoVerified(videoId);
    }
    
    function claimReward(uint256 videoId) external videoExists(videoId) {
        Video storage video = videos[videoId];
        require(video.creator == msg.sender, "Not video creator");
        require(video.verified, "Video not verified");
        require(!video.rewardClaimed, "Reward already claimed");
        require(address(this).balance >= UPLOAD_REWARD, "Insufficient contract balance");
        
        video.rewardClaimed = true;
        
        (bool success, ) = msg.sender.call{value: UPLOAD_REWARD}("");
        require(success, "Reward transfer failed");
        
        emit RewardClaimed(videoId, msg.sender, UPLOAD_REWARD);
    }
    
    function fundContract() external payable onlyAdmin {}
    
    function getVideo(uint256 videoId) external view videoExists(videoId) returns (
        address creator,
        string memory title,
        string memory ipfsHash,
        string memory category,
        uint256 likes,
        uint256 views,
        bool verified,
        bool rewardClaimed
    ) {
        Video storage video = videos[videoId];
        return (
            video.creator,
            video.title,
            video.ipfsHash,
            video.category,
            video.likes,
            video.views,
            video.verified,
            video.rewardClaimed
        );
    }
    
    function getUserVideos(address user) external view returns (uint256[] memory) {
        return userVideos[user];
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}