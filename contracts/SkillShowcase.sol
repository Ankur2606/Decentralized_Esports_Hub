// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SkillShowcase is Ownable, ReentrancyGuard, Pausable {
    struct Video {
        uint256 id;
        string ipfsHash;
        string title;
        string category;
        address creator;
        uint256 uploadTime;
        bool verified;
        uint256 likes;
        uint256 views;
        uint256 rewardAmount;
        bool rewardClaimed;
    }

    mapping(uint256 => Video) public videos;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    mapping(address => uint256[]) public creatorVideos;
    mapping(address => uint256) public pendingRewards;
    mapping(string => bool) public usedHashes; // Prevent duplicate uploads
    
    uint256 public videoCounter;
    uint256 public constant UPLOAD_REWARD = 0.01 ether; // 0.01 CHZ
    uint256 public constant VERIFICATION_BONUS = 0.005 ether; // 0.005 CHZ
    uint256 public constant VIEW_REWARD_THRESHOLD = 100; // Reward after 100 views
    uint256 public constant VIEW_REWARD_AMOUNT = 0.002 ether; // 0.002 CHZ per 100 views

    event VideoUploaded(
        uint256 indexed videoId,
        address indexed creator,
        string ipfsHash,
        string title,
        string category
    );
    
    event VideoLiked(
        uint256 indexed videoId,
        address indexed liker,
        uint256 totalLikes
    );
    
    event VideoVerified(
        uint256 indexed videoId,
        address indexed verifier
    );
    
    event RewardClaimed(
        address indexed creator,
        uint256 amount
    );
    
    event ViewRecorded(
        uint256 indexed videoId,
        uint256 totalViews
    );

    constructor() {}

    function uploadVideo(
        string memory _ipfsHash,
        string memory _title,
        string memory _category
    ) external whenNotPaused returns (uint256) {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(!usedHashes[_ipfsHash], "Video already uploaded");

        uint256 videoId = videoCounter++;
        
        videos[videoId] = Video({
            id: videoId,
            ipfsHash: _ipfsHash,
            title: _title,
            category: _category,
            creator: msg.sender,
            uploadTime: block.timestamp,
            verified: false,
            likes: 0,
            views: 0,
            rewardAmount: UPLOAD_REWARD,
            rewardClaimed: false
        });

        usedHashes[_ipfsHash] = true;
        creatorVideos[msg.sender].push(videoId);
        pendingRewards[msg.sender] += UPLOAD_REWARD;

        emit VideoUploaded(videoId, msg.sender, _ipfsHash, _title, _category);
        
        return videoId;
    }

    function likeVideo(uint256 _videoId) external whenNotPaused {
        require(_videoId < videoCounter, "Video does not exist");
        require(!hasLiked[_videoId][msg.sender], "Already liked this video");
        
        Video storage video = videos[_videoId];
        require(video.creator != msg.sender, "Cannot like own video");

        hasLiked[_videoId][msg.sender] = true;
        video.likes++;

        emit VideoLiked(_videoId, msg.sender, video.likes);
    }

    function recordView(uint256 _videoId) external whenNotPaused {
        require(_videoId < videoCounter, "Video does not exist");
        
        Video storage video = videos[_videoId];
        video.views++;

        // Award view milestone rewards
        if (video.views % VIEW_REWARD_THRESHOLD == 0) {
            pendingRewards[video.creator] += VIEW_REWARD_AMOUNT;
            video.rewardAmount += VIEW_REWARD_AMOUNT;
        }

        emit ViewRecorded(_videoId, video.views);
    }

    function verifyVideo(uint256 _videoId) external onlyOwner {
        require(_videoId < videoCounter, "Video does not exist");
        
        Video storage video = videos[_videoId];
        require(!video.verified, "Video already verified");

        video.verified = true;
        video.rewardAmount += VERIFICATION_BONUS;
        pendingRewards[video.creator] += VERIFICATION_BONUS;

        emit VideoVerified(_videoId, msg.sender);
    }

    function claimRewards() external nonReentrant {
        uint256 rewards = pendingRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        require(address(this).balance >= rewards, "Insufficient contract balance");

        pendingRewards[msg.sender] = 0;

        // Mark all creator's videos as reward claimed
        uint256[] memory userVideos = creatorVideos[msg.sender];
        for (uint256 i = 0; i < userVideos.length; i++) {
            videos[userVideos[i]].rewardClaimed = true;
        }

        payable(msg.sender).transfer(rewards);
        
        emit RewardClaimed(msg.sender, rewards);
    }

    function getVideo(uint256 _videoId) 
        external 
        view 
        returns (Video memory) 
    {
        require(_videoId < videoCounter, "Video does not exist");
        return videos[_videoId];
    }

    function getCreatorVideos(address _creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorVideos[_creator];
    }

    function getPendingRewards(address _creator) 
        external 
        view 
        returns (uint256) 
    {
        return pendingRewards[_creator];
    }

    function getVideosByCategory(string memory _category) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory categoryVideos = new uint256[](videoCounter);
        uint256 count = 0;

        for (uint256 i = 0; i < videoCounter; i++) {
            if (keccak256(bytes(videos[i].category)) == keccak256(bytes(_category))) {
                categoryVideos[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = categoryVideos[i];
        }

        return result;
    }

    function getTrendingVideos(uint256 _limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        require(_limit > 0 && _limit <= videoCounter, "Invalid limit");

        uint256[] memory videoIds = new uint256[](videoCounter);
        for (uint256 i = 0; i < videoCounter; i++) {
            videoIds[i] = i;
        }

        // Simple bubble sort by likes (descending)
        for (uint256 i = 0; i < videoCounter - 1; i++) {
            for (uint256 j = 0; j < videoCounter - i - 1; j++) {
                if (videos[videoIds[j]].likes < videos[videoIds[j + 1]].likes) {
                    uint256 temp = videoIds[j];
                    videoIds[j] = videoIds[j + 1];
                    videoIds[j + 1] = temp;
                }
            }
        }

        // Return top _limit videos
        uint256[] memory trending = new uint256[](_limit);
        for (uint256 i = 0; i < _limit; i++) {
            trending[i] = videoIds[i];
        }

        return trending;
    }

    function isVideoLiked(uint256 _videoId, address _user) 
        external 
        view 
        returns (bool) 
    {
        require(_videoId < videoCounter, "Video does not exist");
        return hasLiked[_videoId][_user];
    }

    function getVideoStats(uint256 _videoId) 
        external 
        view 
        returns (
            uint256 likes,
            uint256 views,
            uint256 uploadTime,
            bool verified,
            uint256 rewardAmount
        ) 
    {
        require(_videoId < videoCounter, "Video does not exist");
        
        Video storage video = videos[_videoId];
        return (
            video.likes,
            video.views,
            video.uploadTime,
            video.verified,
            video.rewardAmount
        );
    }

    function fundContract() external payable onlyOwner {
        // Allow owner to fund the contract for rewards
    }

    function withdrawFunds(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(_amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function updateRewardAmounts(
        uint256 _uploadReward,
        uint256 _verificationBonus,
        uint256 _viewRewardAmount
    ) external onlyOwner {
        // Allow owner to update reward amounts if needed
        // Note: This would require additional storage variables
    }

    receive() external payable {}
}
