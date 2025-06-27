import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { CHAIN_CONFIG, CONTRACT_ADDRESSES, ADMIN_ADDRESS } from "./constants";

// Initialize Thirdweb SDK for client-side use
export const getSDK = () => {
  return new ThirdwebSDK(CHAIN_CONFIG.chainId, {
    clientId: process.env.VITE_THIRDWEB_CLIENT_ID,
  });
};

// Contract interfaces
export interface PredictionMarketContract {
  createEvent: (name: string, ipfsHash: string, endTime: number) => Promise<any>;
  placeBet: (eventId: number, option: number) => Promise<any>;
  resolveEvent: (eventId: number, winningOption: number) => Promise<any>;
  withdrawWinnings: (eventId: number) => Promise<any>;
}

export interface SkillShowcaseContract {
  uploadVideo: (ipfsHash: string, title: string, category: string) => Promise<any>;
  likeVideo: (videoId: number) => Promise<any>;
  verifyVideo: (videoId: number) => Promise<any>;
  claimRewards: () => Promise<any>;
}

export interface FanTokenDAOContract {
  mint: (to: string, amount: string) => Promise<any>;
  createProposal: (description: string) => Promise<any>;
  vote: (proposalId: number, support: boolean) => Promise<any>;
  executeProposal: (proposalId: number) => Promise<any>;
  balanceOf: (address: string) => Promise<string>;
}

export interface CourseNFTContract {
  lazyMint: (uri: string, price: string) => Promise<any>;
  purchase: (tokenId: number) => Promise<any>;
  setRoyalty: (percentage: number) => Promise<any>;
}

export interface MarketplaceContract {
  listItem: (tokenId: number, price: string) => Promise<any>;
  buyItem: (itemId: number) => Promise<any>;
  updatePrice: (itemId: number, newPrice: string) => Promise<any>;
}

// Contract getters
export const getPredictionMarketContract = async (): Promise<PredictionMarketContract | null> => {
  if (!CONTRACT_ADDRESSES.PREDICTION_MARKET) return null;
  
  try {
    const sdk = getSDK();
    const contract = await sdk.getContract(CONTRACT_ADDRESSES.PREDICTION_MARKET);
    return contract as PredictionMarketContract;
  } catch (error) {
    console.error("Failed to get PredictionMarket contract:", error);
    return null;
  }
};

export const getSkillShowcaseContract = async (): Promise<SkillShowcaseContract | null> => {
  if (!CONTRACT_ADDRESSES.SKILL_SHOWCASE) return null;
  
  try {
    const sdk = getSDK();
    const contract = await sdk.getContract(CONTRACT_ADDRESSES.SKILL_SHOWCASE);
    return contract as SkillShowcaseContract;
  } catch (error) {
    console.error("Failed to get SkillShowcase contract:", error);
    return null;
  }
};

export const getFanTokenDAOContract = async (): Promise<FanTokenDAOContract | null> => {
  if (!CONTRACT_ADDRESSES.FAN_TOKEN_DAO) return null;
  
  try {
    const sdk = getSDK();
    const contract = await sdk.getContract(CONTRACT_ADDRESSES.FAN_TOKEN_DAO);
    return contract as FanTokenDAOContract;
  } catch (error) {
    console.error("Failed to get FanTokenDAO contract:", error);
    return null;
  }
};

export const getCourseNFTContract = async (): Promise<CourseNFTContract | null> => {
  if (!CONTRACT_ADDRESSES.COURSE_NFT) return null;
  
  try {
    const sdk = getSDK();
    const contract = await sdk.getContract(CONTRACT_ADDRESSES.COURSE_NFT);
    return contract as CourseNFTContract;
  } catch (error) {
    console.error("Failed to get CourseNFT contract:", error);
    return null;
  }
};

export const getMarketplaceContract = async (): Promise<MarketplaceContract | null> => {
  if (!CONTRACT_ADDRESSES.MARKETPLACE) return null;
  
  try {
    const sdk = getSDK();
    const contract = await sdk.getContract(CONTRACT_ADDRESSES.MARKETPLACE);
    return contract as MarketplaceContract;
  } catch (error) {
    console.error("Failed to get Marketplace contract:", error);
    return null;
  }
};

// Utility functions
export const formatChzAmount = (amount: string | number): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(3);
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const convertToWei = (amount: string): string => {
  const num = parseFloat(amount);
  return (num * 1e18).toString();
};

export const convertFromWei = (amount: string): string => {
  const num = parseFloat(amount);
  return (num / 1e18).toFixed(6);
};

// IPFS helper functions
export const convertIpfsUrl = (ipfsUrl: string): string => {
  if (ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl.replace("ipfs://", "https://nftstorage.link/ipfs/");
  }
  return ipfsUrl;
};

export const extractIpfsHash = (ipfsUrl: string): string => {
  if (ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl.replace("ipfs://", "");
  }
  if (ipfsUrl.includes("/ipfs/")) {
    return ipfsUrl.split("/ipfs/")[1];
  }
  return ipfsUrl;
};

// Validation functions
export const isValidChzAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0.001 && num <= 1000;
};

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Error handling
export const handleContractError = (error: any): string => {
  if (error?.message?.includes("insufficient funds")) {
    return "Insufficient CHZ balance for this transaction.";
  }
  if (error?.message?.includes("user rejected")) {
    return "Transaction was rejected by user.";
  }
  if (error?.message?.includes("network")) {
    return "Network error. Please check your connection.";
  }
  return "An unexpected error occurred. Please try again.";
};

// Transaction monitoring
export const waitForTransaction = async (txHash: string, maxRetries = 30): Promise<boolean> => {
  const sdk = getSDK();
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const receipt = await sdk.getProvider().getTransactionReceipt(txHash);
      if (receipt) {
        return receipt.status === 1;
      }
    } catch (error) {
      console.log(`Waiting for transaction ${txHash}... (${i + 1}/${maxRetries})`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return false;
};

// Network detection
export const isCorrectNetwork = async (): Promise<boolean> => {
  try {
    const sdk = getSDK();
    const network = await sdk.getProvider().getNetwork();
    return network.chainId === CHAIN_CONFIG.chainId;
  } catch (error) {
    console.error("Failed to check network:", error);
    return false;
  }
};

// Balance checking
export const getChzBalance = async (address: string): Promise<string> => {
  try {
    const sdk = getSDK();
    const balance = await sdk.getProvider().getBalance(address);
    return convertFromWei(balance.toString());
  } catch (error) {
    console.error("Failed to get CHZ balance:", error);
    return "0";
  }
};

export const getFanTokenBalance = async (address: string): Promise<string> => {
  try {
    const contract = await getFanTokenDAOContract();
    if (!contract) return "0";
    
    const balance = await contract.balanceOf(address);
    return convertFromWei(balance);
  } catch (error) {
    console.error("Failed to get Fan Token balance:", error);
    return "0";
  }
};
