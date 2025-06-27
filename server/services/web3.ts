import { ThirdwebSDK } from "@thirdweb-dev/sdk";

class Web3Service {
  private sdk: ThirdwebSDK;
  private contracts: {
    predictionMarket?: any;
    fanTokenDAO?: any;
    skillShowcase?: any;
    courseNFT?: any;
    marketplace?: any;
  } = {};

  constructor() {
    // Initialize thirdweb SDK with Chiliz Spicy Testnet
    this.sdk = ThirdwebSDK.fromPrivateKey(
      process.env.ADMIN_PRIVATE_KEY || "",
      {
        name: "Chiliz Spicy Testnet",
        chainId: 88882,
        rpc: ["https://spicy-rpc.chiliz.com/"],
      }
    );
    
    this.initializeContracts();
  }

  private async initializeContracts() {
    try {
      // Initialize contracts with deployed addresses
      // These addresses would be set after deployment
      const PREDICTION_MARKET_ADDRESS = process.env.PREDICTION_MARKET_ADDRESS || "";
      const FAN_TOKEN_DAO_ADDRESS = process.env.FAN_TOKEN_DAO_ADDRESS || "";
      const SKILL_SHOWCASE_ADDRESS = process.env.SKILL_SHOWCASE_ADDRESS || "";
      const COURSE_NFT_ADDRESS = process.env.COURSE_NFT_ADDRESS || "";
      const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS || "";

      if (PREDICTION_MARKET_ADDRESS) {
        this.contracts.predictionMarket = await this.sdk.getContract(PREDICTION_MARKET_ADDRESS);
      }
      if (FAN_TOKEN_DAO_ADDRESS) {
        this.contracts.fanTokenDAO = await this.sdk.getContract(FAN_TOKEN_DAO_ADDRESS);
      }
      if (SKILL_SHOWCASE_ADDRESS) {
        this.contracts.skillShowcase = await this.sdk.getContract(SKILL_SHOWCASE_ADDRESS);
      }
      if (COURSE_NFT_ADDRESS) {
        this.contracts.courseNFT = await this.sdk.getContract(COURSE_NFT_ADDRESS);
      }
      if (MARKETPLACE_ADDRESS) {
        this.contracts.marketplace = await this.sdk.getContract(MARKETPLACE_ADDRESS);
      }
    } catch (error) {
      console.error("Failed to initialize contracts:", error);
    }
  }

  // Prediction Market functions
  async createEvent(name: string, ipfsHash: string, endTime: number): Promise<string> {
    if (!this.contracts.predictionMarket) throw new Error("PredictionMarket contract not initialized");
    
    const tx = await this.contracts.predictionMarket.call("createEvent", [name, ipfsHash, endTime]);
    return tx.receipt.transactionHash;
  }

  async placeBet(eventId: number, option: number, amount: string): Promise<string> {
    if (!this.contracts.predictionMarket) throw new Error("PredictionMarket contract not initialized");
    
    const tx = await this.contracts.predictionMarket.call("placeBet", [eventId, option], {
      value: amount
    });
    return tx.receipt.transactionHash;
  }

  async resolveEvent(eventId: number, winningOption: number): Promise<string> {
    if (!this.contracts.predictionMarket) throw new Error("PredictionMarket contract not initialized");
    
    const tx = await this.contracts.predictionMarket.call("resolveEvent", [eventId, winningOption]);
    return tx.receipt.transactionHash;
  }

  // SkillShowcase functions
  async uploadVideo(ipfsHash: string, title: string, category: string): Promise<number> {
    if (!this.contracts.skillShowcase) throw new Error("SkillShowcase contract not initialized");
    
    const tx = await this.contracts.skillShowcase.call("uploadVideo", [ipfsHash, title, category]);
    // Extract video ID from event logs
    const events = tx.receipt.events;
    const videoUploadedEvent = events.find((e: any) => e.event === "VideoUploaded");
    return videoUploadedEvent?.args?.videoId || 0;
  }

  async likeVideo(videoId: number): Promise<string> {
    if (!this.contracts.skillShowcase) throw new Error("SkillShowcase contract not initialized");
    
    const tx = await this.contracts.skillShowcase.call("likeVideo", [videoId]);
    return tx.receipt.transactionHash;
  }

  async verifyVideo(videoId: number): Promise<string> {
    if (!this.contracts.skillShowcase) throw new Error("SkillShowcase contract not initialized");
    
    const tx = await this.contracts.skillShowcase.call("verifyVideo", [videoId]);
    return tx.receipt.transactionHash;
  }

  // FanTokenDAO functions
  async createProposal(description: string): Promise<number> {
    if (!this.contracts.fanTokenDAO) throw new Error("FanTokenDAO contract not initialized");
    
    const tx = await this.contracts.fanTokenDAO.call("createProposal", [description]);
    const events = tx.receipt.events;
    const proposalCreatedEvent = events.find((e: any) => e.event === "ProposalCreated");
    return proposalCreatedEvent?.args?.proposalId || 0;
  }

  async vote(proposalId: number, support: boolean): Promise<string> {
    if (!this.contracts.fanTokenDAO) throw new Error("FanTokenDAO contract not initialized");
    
    const tx = await this.contracts.fanTokenDAO.call("vote", [proposalId, support]);
    return tx.receipt.transactionHash;
  }

  async executeProposal(proposalId: number): Promise<string> {
    if (!this.contracts.fanTokenDAO) throw new Error("FanTokenDAO contract not initialized");
    
    const tx = await this.contracts.fanTokenDAO.call("executeProposal", [proposalId]);
    return tx.receipt.transactionHash;
  }

  // CourseNFT functions
  async lazyMintCourse(uri: string, price: string): Promise<number> {
    if (!this.contracts.courseNFT) throw new Error("CourseNFT contract not initialized");
    
    const tx = await this.contracts.courseNFT.call("lazyMint", [uri, price]);
    const events = tx.receipt.events;
    const courseMintedEvent = events.find((e: any) => e.event === "CourseMinted");
    return courseMintedEvent?.args?.tokenId || 0;
  }

  async purchaseCourse(tokenId: number): Promise<string> {
    if (!this.contracts.courseNFT) throw new Error("CourseNFT contract not initialized");
    
    // Get course price first
    const price = await this.contracts.courseNFT.call("getPrice", [tokenId]);
    const tx = await this.contracts.courseNFT.call("purchase", [tokenId], { value: price });
    return tx.receipt.transactionHash;
  }

  // Marketplace functions
  async listItem(tokenId: number, price: string): Promise<number> {
    if (!this.contracts.marketplace) throw new Error("Marketplace contract not initialized");
    
    const tx = await this.contracts.marketplace.call("listItem", [tokenId, price]);
    const events = tx.receipt.events;
    const itemListedEvent = events.find((e: any) => e.event === "ItemListed");
    return itemListedEvent?.args?.itemId || 0;
  }

  async buyMarketplaceItem(itemId: number): Promise<string> {
    if (!this.contracts.marketplace) throw new Error("Marketplace contract not initialized");
    
    const tx = await this.contracts.marketplace.call("buyItem", [itemId]);
    return tx.receipt.transactionHash;
  }

  // Utility functions
  async getChzBalance(address: string): Promise<string> {
    const balance = await this.sdk.getProvider().getBalance(address);
    return balance.toString();
  }

  async getFanTokenBalance(address: string): Promise<string> {
    if (!this.contracts.fanTokenDAO) return "0";
    
    try {
      const balance = await this.contracts.fanTokenDAO.call("balanceOf", [address]);
      return balance.toString();
    } catch (error) {
      console.error("Failed to get fan token balance:", error);
      return "0";
    }
  }
}

export const web3Service = new Web3Service();
