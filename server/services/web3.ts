import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";

const client = createThirdwebClient({
  clientId: process.env.VITE_THIRDWEB_CLIENT_ID || "",
  secretKey: process.env.THIRDWEB_SECRET_KEY || "",
});

const chilizSpicyTestnet = defineChain({
  id: 88882,
  name: "Chiliz Spicy Testnet",
  nativeCurrency: { name: "CHZ", symbol: "CHZ", decimals: 18 },
  rpc: "https://spicy-rpc.chiliz.com/",
  blockExplorers: [
    {
      name: "Chiliz Explorer",
      url: "https://spicy-explorer.chiliz.com/",
      apiUrl: "https://spicy-explorer.chiliz.com/api",
    },
  ],
  testnet: true,
});

class Web3Service {
  private contracts: {
    predictionMarket?: any;
    fanTokenDAO?: any;
    skillShowcase?: any;
    courseNFT?: any;
    marketplace?: any;
  } = {};
  
  private adminAccount?: any;
  private isAdmin = false;

  constructor() {
    // Initialize admin account if private key is provided
    if (process.env.ADMIN_PRIVATE_KEY) {
      this.adminAccount = privateKeyToAccount({
        client,
        privateKey: process.env.ADMIN_PRIVATE_KEY,
      });
      this.isAdmin = true;
      console.log("Web3Service initialized with admin account");
    } else {
      console.log("Web3Service initialized without admin account - using mock functions");
    }
    
    this.initializeContracts();
  }

  private async initializeContracts() {
    try {
      // Use deployed contract addresses from constants
      const { CONTRACT_ADDRESSES } = await import('../../shared/constants.js');
      const PREDICTION_MARKET_ADDRESS = CONTRACT_ADDRESSES.PREDICTION_MARKET;
      const FAN_TOKEN_DAO_ADDRESS = CONTRACT_ADDRESSES.FAN_TOKEN_DAO;
      const SKILL_SHOWCASE_ADDRESS = CONTRACT_ADDRESSES.SKILL_SHOWCASE;
      const COURSE_NFT_ADDRESS = CONTRACT_ADDRESSES.COURSE_NFT;
      const MARKETPLACE_ADDRESS = CONTRACT_ADDRESSES.MARKETPLACE;

      if (PREDICTION_MARKET_ADDRESS) {
        this.contracts.predictionMarket = getContract({
          client,
          chain: chilizSpicyTestnet,
          address: PREDICTION_MARKET_ADDRESS,
        });
        console.log("✅ Prediction Market contract connected");
      }

      if (FAN_TOKEN_DAO_ADDRESS) {
        this.contracts.fanTokenDAO = getContract({
          client,
          chain: chilizSpicyTestnet,
          address: FAN_TOKEN_DAO_ADDRESS,
        });
        console.log("✅ FanToken DAO contract connected");
      }

      if (SKILL_SHOWCASE_ADDRESS) {
        this.contracts.skillShowcase = getContract({
          client,
          chain: chilizSpicyTestnet,
          address: SKILL_SHOWCASE_ADDRESS,
        });
        console.log("✅ Skill Showcase contract connected");
      }

      if (COURSE_NFT_ADDRESS) {
        this.contracts.courseNFT = getContract({
          client,
          chain: chilizSpicyTestnet,
          address: COURSE_NFT_ADDRESS,
        });
        console.log("✅ Course NFT contract connected");
      }

      if (MARKETPLACE_ADDRESS) {
        this.contracts.marketplace = getContract({
          client,
          chain: chilizSpicyTestnet,
          address: MARKETPLACE_ADDRESS,
        });
        console.log("✅ Marketplace contract connected");
      }

      if (Object.keys(this.contracts).length === 0) {
        console.log("ℹ️  No contract addresses found - run deployment script first");
      }

    } catch (error) {
      console.error("Failed to initialize contracts:", error);
    }
  }

  async executeAdminFunction(contractName: string, functionName: string, args: any[] = []) {
    if (!this.isAdmin) {
      throw new Error("Admin privileges required");
    }

    const contract = this.contracts[contractName as keyof typeof this.contracts];
    if (!contract) {
      throw new Error(`Contract ${contractName} not found`);
    }

    try {
      const transaction = prepareContractCall({
        contract,
        method: functionName,
        params: args,
      });

      const result = await sendTransaction({
        transaction,
        account: this.adminAccount,
      });

      return result.transactionHash;
    } catch (error) {
      console.error(`Admin function ${functionName} failed:`, error);
      throw error;
    }
  }

  // Prediction Market Functions
  async createEvent(name: string, ipfsHash: string, endTime: number): Promise<string> {
    if (!this.isAdmin) {
      console.log("Mock: Creating prediction event:", name);
      return "mock_tx_hash_" + Date.now();
    }
    return await this.executeAdminFunction("predictionMarket", "createEvent", [name, ipfsHash, endTime]);
  }

  async placeBet(eventId: number, option: number, amount: string): Promise<string> {
    console.log("Mock: Placing bet on event", eventId, "option", option, "amount", amount);
    return "mock_tx_hash_" + Date.now();
  }

  async resolveEvent(eventId: number, winningOption: number): Promise<string> {
    if (!this.isAdmin) {
      throw new Error("Admin privileges required to resolve events");
    }
    return await this.executeAdminFunction("predictionMarket", "resolveEvent", [eventId, winningOption]);
  }

  // Video Functions
  async uploadVideo(ipfsHash: string, title: string, category: string): Promise<number> {
    console.log("Mock: Uploading video:", title, "with hash:", ipfsHash);
    return Math.floor(Math.random() * 1000);
  }

  async likeVideo(videoId: number): Promise<string> {
    console.log("Mock: Liking video:", videoId);
    return "mock_tx_hash_" + Date.now();
  }

  async verifyVideo(videoId: number): Promise<string> {
    if (!this.isAdmin) {
      throw new Error("Admin privileges required to verify videos");
    }
    return await this.executeAdminFunction("skillShowcase", "verifyVideo", [videoId]);
  }

  // DAO Functions
  async createProposal(description: string): Promise<number> {
    console.log("Mock: Creating DAO proposal:", description);
    return Math.floor(Math.random() * 1000);
  }

  async vote(proposalId: number, support: boolean): Promise<string> {
    console.log("Mock: Voting on proposal:", proposalId, "support:", support);
    return "mock_tx_hash_" + Date.now();
  }

  async executeProposal(proposalId: number): Promise<string> {
    if (!this.isAdmin) {
      throw new Error("Admin privileges required to execute proposals");
    }
    return await this.executeAdminFunction("fanTokenDAO", "executeProposal", [proposalId]);
  }

  // Course NFT Functions
  async lazyMintCourse(uri: string, price: string): Promise<number> {
    console.log("Mock: Lazy minting course NFT with URI:", uri, "price:", price);
    return Math.floor(Math.random() * 1000);
  }

  async purchaseCourse(tokenId: number): Promise<string> {
    console.log("Mock: Purchasing course NFT:", tokenId);
    return "mock_tx_hash_" + Date.now();
  }

  // Marketplace Functions
  async listItem(tokenId: number, price: string): Promise<number> {
    console.log("Mock: Listing item on marketplace:", tokenId, "for", price);
    return Math.floor(Math.random() * 1000);
  }

  async buyMarketplaceItem(itemId: number): Promise<string> {
    console.log("Mock: Buying marketplace item:", itemId);
    return "mock_tx_hash_" + Date.now();
  }

  // Balance Functions
  async getChzBalance(address: string): Promise<string> {
    console.log("Mock: Getting CHZ balance for:", address);
    return (Math.random() * 100).toFixed(4);
  }

  async getFanTokenBalance(address: string): Promise<string> {
    console.log("Mock: Getting Fan Token balance for:", address);
    return (Math.random() * 1000).toFixed(0);
  }
}

export const web3Service = new Web3Service();