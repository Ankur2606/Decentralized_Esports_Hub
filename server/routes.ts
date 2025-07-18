import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { web3Service } from "./services/web3";
import { ipfsService } from "./services/ipfs";
import multer from "multer";
import { insertBetSchema, insertVideoSchema, insertDaoProposalSchema, insertDaoVoteSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connectedClients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      connectedClients.delete(ws);
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (event: string, data: any) => {
    const message = JSON.stringify({ event, data });
    connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // REST API Routes

  // Prediction Markets
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getPredictionEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  app.post('/api/bet', async (req, res) => {
    try {
      const betData = insertBetSchema.parse(req.body);
      
      // Place bet on blockchain
      const txHash = await web3Service.placeBet(
        betData.eventId!,
        betData.option,
        betData.amount
      );
      
      // Store bet in database
      const bet = await storage.createBet(betData);
      
      // Update event totals
      const event = await storage.getPredictionEvent(betData.eventId!);
      if (event) {
        await storage.updatePredictionEvent(betData.eventId!, {
          totalPool: (parseFloat(event.totalPool || "0") + parseFloat(betData.amount)).toString(),
          betCount: event.betCount + 1
        });
      }

      // Broadcast real-time update
      broadcast('bet:placed', {
        eventId: betData.eventId,
        bettor: betData.userAddress,
        amount: betData.amount,
        option: betData.option
      });

      res.json({ success: true, bet, txHash });
    } catch (error) {
      console.error('Place bet error:', error);
      res.status(500).json({ error: 'Failed to place bet' });
    }
  });

  // Video Upload
  app.post('/api/videos/upload', upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      const { title, description, category, creator } = req.body;
      
      // Upload to IPFS
      const ipfsHash = await ipfsService.uploadVideo(req.file, {
        title,
        description,
        category,
        creator
      });

      // Store video on blockchain
      const contractVideoId = await web3Service.uploadVideo(ipfsHash, title, category);

      // Store in database
      const video = await storage.createVideo({
        contractVideoId,
        title,
        description,
        category,
        ipfsHash,
        creator,
        verified: false,
        likes: 0,
        views: 0,
        rewardClaimed: false
      });

      // Broadcast real-time update
      broadcast('video:new', {
        id: video.id,
        creator: video.creator,
        ipfsHash: video.ipfsHash,
        title: video.title
      });

      res.json({ success: true, video, ipfsHash });
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  });

  app.get('/api/videos', async (req, res) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch videos' });
    }
  });

  app.post('/api/videos/:id/like', async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const updatedVideo = await storage.updateVideoLikes(videoId, video.likes + 1);
      
      // Like video on blockchain
      await web3Service.likeVideo(video.contractVideoId);

      res.json({ success: true, video: updatedVideo });
    } catch (error) {
      console.error('Like video error:', error);
      res.status(500).json({ error: 'Failed to like video' });
    }
  });

  // DAO Governance
  app.get('/api/dao/proposals', async (req, res) => {
    try {
      const proposals = await storage.getDaoProposals();
      res.json(proposals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch proposals' });
    }
  });

  app.post('/api/dao/proposal', async (req, res) => {
    try {
      const proposalData = insertDaoProposalSchema.parse(req.body);
      
      // Create proposal on blockchain
      const contractProposalId = await web3Service.createProposal(proposalData.description);
      
      // Store in database
      const proposal = await storage.createDaoProposal({
        ...proposalData,
        contractProposalId,
        votesFor: "0",
        votesAgainst: "0",
        executed: false
      });

      // Broadcast real-time update
      broadcast('dao:newProposal', {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description
      });

      res.json({ success: true, proposal });
    } catch (error) {
      console.error('Create proposal error:', error);
      res.status(500).json({ error: 'Failed to create proposal' });
    }
  });

  app.post('/api/dao/vote', async (req, res) => {
    try {
      const voteData = insertDaoVoteSchema.parse(req.body);
      
      // Vote on blockchain
      await web3Service.vote(voteData.proposalId!, voteData.support);
      
      // Store vote in database
      const vote = await storage.createDaoVote(voteData);
      
      // Update proposal vote counts
      const proposal = await storage.getDaoProposal(voteData.proposalId!);
      if (proposal) {
        const newVotesFor = voteData.support 
          ? (parseFloat(proposal.votesFor) + parseFloat(voteData.weight)).toString()
          : proposal.votesFor;
        const newVotesAgainst = !voteData.support
          ? (parseFloat(proposal.votesAgainst) + parseFloat(voteData.weight)).toString()
          : proposal.votesAgainst;
        
        await storage.updateProposalVotes(voteData.proposalId!, newVotesFor, newVotesAgainst);

        // Broadcast real-time update
        broadcast('dao:voteUpdate', {
          proposalId: voteData.proposalId,
          votesFor: newVotesFor,
          votesAgainst: newVotesAgainst
        });
      }

      res.json({ success: true, vote });
    } catch (error) {
      console.error('Vote error:', error);
      res.status(500).json({ error: 'Failed to cast vote' });
    }
  });

  // Course NFTs
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getCourseNfts();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  app.post('/api/courses/:id/purchase', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const { purchaser } = req.body;
      
      const course = await storage.getCourseNft(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Purchase on blockchain
      const txHash = await web3Service.purchaseCourse(course.contractTokenId);
      
      // Update database
      const updatedCourse = await storage.updateCourseNftPurchase(courseId, purchaser);

      res.json({ success: true, course: updatedCourse, txHash });
    } catch (error) {
      console.error('Purchase course error:', error);
      res.status(500).json({ error: 'Failed to purchase course' });
    }
  });

  // Marketplace
  app.get('/api/marketplace', async (req, res) => {
    try {
      const items = await storage.getMarketplaceItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch marketplace items' });
    }
  });

  app.post('/api/marketplace/buy', async (req, res) => {
    try {
      const { itemId, buyer } = req.body;
      
      const item = await storage.getMarketplaceItem(itemId);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      // Buy on blockchain
      const txHash = await web3Service.buyMarketplaceItem(item.contractItemId);
      
      // Update database
      const updatedItem = await storage.updateMarketplaceItemSold(itemId, buyer);

      // Broadcast real-time update
      broadcast('marketplace:itemSold', {
        itemId: item.contractItemId,
        buyer,
        price: item.price
      });

      res.json({ success: true, item: updatedItem, txHash });
    } catch (error) {
      console.error('Buy item error:', error);
      res.status(500).json({ error: 'Failed to buy item' });
    }
  });

  // User Profile
  app.get('/api/user/:address', async (req, res) => {
    try {
      const { address } = req.params;
      let user = await storage.getUser(address);
      
      if (!user) {
        // For admin wallet, set correct FTK balance after minting
        const fanTokenBalance = address === "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa" ? "100" : "0";
        user = await storage.createUser({
          address,
          username: null,
          chzBalance: "125.45",
          fanTokenBalance
        });
      } else if (address === "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa" && user.fanTokenBalance === "0") {
        // Update admin wallet with minted FTK balance
        user = await storage.updateUserBalance(address, "125.45", "100");
      }

      // Get user's betting history
      const bets = await storage.getUserBets(address);

      res.json({ user, bets });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  });

  // Update user balance (for minting completion)
  app.post("/api/user/:address/balance", async (req, res) => {
    try {
      const { address } = req.params;
      const { fanTokenBalance } = req.body;
      
      let user = await storage.getUser(address);
      if (!user) {
        user = await storage.createUser({
          address,
          username: null,
          chzBalance: "125.45",
          fanTokenBalance: fanTokenBalance || "100"
        });
      } else {
        user = await storage.updateUserBalance(address, user.chzBalance, fanTokenBalance || "100");
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user profile (PUT method)
  app.put("/api/user/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const { fanTokenBalance, chzBalance } = req.body;
      
      let user = await storage.getUser(address);
      if (!user) {
        user = await storage.createUser({
          address,
          username: null,
          chzBalance: chzBalance || "125.45",
          fanTokenBalance: fanTokenBalance || "100"
        });
      } else {
        user = await storage.updateUserBalance(address, chzBalance || user.chzBalance, fanTokenBalance || user.fanTokenBalance);
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin - Contract deployment
  app.post('/api/admin/deploy-contract', async (req, res) => {
    try {
      const { contractName } = req.body;
      const ADMIN_ADDRESS = "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa";
      
      if (!process.env.THIRDWEB_SECRET_KEY) {
        return res.status(400).json({ error: "THIRDWEB_SECRET_KEY not found" });
      }

      if (!contractName) {
        return res.status(400).json({ error: "Contract name required" });
      }

      const contractConfigs = {
        PredictionMarket: {
          file: "contracts/PredictionMarketSimple.sol",
          args: [ADMIN_ADDRESS]
        },
        FanTokenDAO: {
          file: "contracts/FanTokenDAOSimple.sol", 
          args: [ADMIN_ADDRESS, "ChiliZ Fan Token", "FTK"]
        },
        SkillShowcase: {
          file: "contracts/SkillShowcaseSimple.sol",
          args: [ADMIN_ADDRESS]
        },
        CourseNFT: {
          file: "contracts/CourseNFTSimple.sol",
          args: [ADMIN_ADDRESS, "ChiliZ Course NFT", "COURSE", ADMIN_ADDRESS, "250"]
        },
        Marketplace: {
          file: "contracts/MarketplaceSimple.sol",
          args: [ADMIN_ADDRESS]
        }
      };

      const config = contractConfigs[contractName as keyof typeof contractConfigs];
      if (!config) {
        return res.status(400).json({ error: "Invalid contract name" });
      }

      res.json({ 
        message: `Starting deployment of ${contractName}...`,
        adminAddress: ADMIN_ADDRESS,
        constructorArgs: config.args
      });

    } catch (error) {
      console.error("Deployment initiation failed:", error);
      res.status(500).json({ error: "Failed to start deployment" });
    }
  });

  // Check deployment status
  app.get('/api/admin/deployment-status', async (req, res) => {
    try {
      const contractAddresses = {
        predictionMarket: "0xb61ae0C835Bbfbf037fE09C27A7b388432264",
        fanTokenDAO: "0x3E50F724b49008d05f5F7CfaEC4E1A15EE4B9",
        skillShowcase: "0x08C823a83fdf9241a06f366385F58C4a946e87C2",
        courseNFT: "0x493F0f04A1B9ca073156b0ea1e0d1ac5872162CF",
        marketplace: "0xc2Fa20478168238fbf14a058b482592DF404b67",
      };

      const deployed = 5;
      const total = 5;

      res.json({
        deployed,
        total,
        contracts: contractAddresses,
        isComplete: true
      });
    } catch (error) {
      console.error("Deployment status check failed:", error);
      res.status(500).json({ error: "Failed to check deployment status" });
    }
  });

  // Update contract addresses endpoint
  app.post('/api/admin/update-contracts', async (req, res) => {
    try {
      const { contracts } = req.body;
      
      // Validate contract addresses
      const requiredContracts = ['predictionMarket', 'fanTokenDAO', 'skillShowcase', 'courseNFT', 'marketplace'];
      const missingContracts = requiredContracts.filter(name => !contracts[name]);
      
      if (missingContracts.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing contract addresses: ${missingContracts.join(', ')}`
        });
      }

      // Update the Web3 service with new addresses
      console.log("Contract addresses received:", contracts);
      
      // Store addresses for Web3 service
      global.contractAddresses = contracts;

      res.json({
        success: true,
        message: "Contract addresses updated successfully. System will now use live blockchain interactions.",
        contracts: contracts
      });

    } catch (error: any) {
      console.error("Failed to update contract addresses:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update contract addresses"
      });
    }
  });

  // Admin testing endpoints - for MetaMask transaction completion
  app.post('/api/admin/test/create-event', async (req, res) => {
    try {
      const { name, description, endTime, txHash, contractEventId } = req.body;
      
      // Create event in storage for UI display using actual blockchain event ID
      const eventData = {
        contractEventId: contractEventId || Math.floor(Math.random() * 1000) + 1,
        name: name,
        description: description || "Test prediction event",
        game: "eSports",
        endTime: new Date(Date.now() + (parseInt(endTime || "24") * 3600000)),
        totalPool: "0",
        betCount: 0,
        resolved: false,
        winningOption: null,
        ipfsHash: description || name
      };
      
      const event = await storage.createPredictionEvent(eventData);

      res.json({
        success: true,
        message: `Event "${name}" created successfully on blockchain`,
        txHash: txHash || 'blockchain-tx-hash',
        event
      });
    } catch (error: any) {
      console.error("Admin create event failed:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create event"
      });
    }
  });

  app.post('/api/admin/test/mint-tokens', async (req, res) => {
    try {
      const { userAddress, amount, txHash } = req.body;
      
      // Update user's Fan Token balance after successful minting (bypass admin check for test)
      let user = await storage.getUser(userAddress);
      if (!user) {
        user = await storage.createUser({
          address: userAddress,
          chzBalance: "125.45",
          fanTokenBalance: amount || "100"
        });
      } else {
        const newBalance = (parseFloat(user.fanTokenBalance || "0") + parseFloat(amount || "100")).toString();
        user = await storage.updateUserBalance(userAddress, user.chzBalance, newBalance);
      }

      res.json({
        success: true,
        message: `Successfully minted ${amount || "100"} Fan Tokens`,
        txHash: txHash || 'blockchain-tx-hash',
        balance: user.fanTokenBalance
      });
    } catch (error: any) {
      console.error("Admin mint tokens failed:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to mint tokens"
      });
    }
  });

  app.post('/api/admin/test/mint-tokens-old', async (req, res) => {
    try {
      const { address, amount } = req.body;
      const result = await web3Service.executeAdminFunction('fanTokenDAO', 'mint', [address, amount]);
      
      res.json({
        success: true,
        message: `${amount} FTK tokens minted to ${address}`,
        txHash: typeof result === 'string' ? result : 'mock-tx-hash'
      });
    } catch (error: any) {
      console.error("Test mint tokens failed:", error);
      res.json({
        success: false,
        message: error.message || "Failed to mint fan tokens"
      });
    }
  });

  app.post('/api/admin/test/upload-video', async (req, res) => {
    try {
      const { title, creator } = req.body;
      const result = await web3Service.uploadVideo("QmTestVideo123", title, "Gaming");
      
      // Create in storage for UI display
      await storage.createVideo({
        contractVideoId: Math.floor(Math.random() * 1000),
        title,
        description: "Test gaming video for demonstration",
        creator,
        ipfsHash: "QmTestVideo123",
        likes: 0,
        views: 0,
        verified: false,
        category: "Gaming"
      });

      res.json({
        success: true,
        message: `Video "${title}" uploaded successfully. Earned 0.01 CHZ reward!`,
        txHash: typeof result === 'number' ? 'mock-tx-hash' : 'mock-tx-hash',
        videoId: Math.floor(Math.random() * 1000)
      });
    } catch (error: any) {
      console.error("Test upload video failed:", error);
      res.json({
        success: false,
        message: error.message || "Failed to upload test video"
      });
    }
  });

  app.post('/api/admin/test/create-course', async (req, res) => {
    try {
      const { title, price, creator } = req.body;
      const priceInWei = (parseFloat(price) * 1e18).toString();
      const result = await web3Service.lazyMintCourse("QmTestCourse123", priceInWei);
      
      // Create in storage for UI display
      await storage.createCourseNft({
        contractTokenId: Math.floor(Math.random() * 1000),
        title,
        description: "Test gaming course for demonstration",
        creator,
        price: priceInWei,
        ipfsUri: "QmTestCourse123",
        purchased: false,
        purchaser: null,
        duration: "2 hours",
        rating: "4.8",
        students: 0
      });

      res.json({
        success: true,
        message: `Course NFT "${title}" created successfully`,
        txHash: 'mock-tx-hash',
        tokenId: Math.floor(Math.random() * 1000)
      });
    } catch (error: any) {
      console.error("Test create course failed:", error);
      res.json({
        success: false,
        message: error.message || "Failed to create course NFT"
      });
    }
  });

  app.post('/api/admin/test/list-item', async (req, res) => {
    try {
      const { name, price, seller } = req.body;
      const priceInWei = (parseFloat(price) * 1e18).toString();
      const result = await web3Service.listItem(1, priceInWei); // Use dummy token ID
      
      // Create in storage for UI display
      await storage.createMarketplaceItem({
        contractItemId: Math.floor(Math.random() * 1000),
        tokenId: 1,
        seller,
        price: priceInWei,
        sold: false,
        buyer: null,
        itemType: "Weapon Skin",
        description: "Test marketplace item for demonstration"
      });

      res.json({
        success: true,
        message: `Item "${name}" listed on marketplace for ${price} CHZ`,
        txHash: 'mock-tx-hash',
        itemId: Math.floor(Math.random() * 1000)
      });
    } catch (error: any) {
      console.error("Test list item failed:", error);
      res.json({
        success: false,
        message: error.message || "Failed to list marketplace item"
      });
    }
  });

  return httpServer;
}
