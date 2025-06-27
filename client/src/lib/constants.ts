// Contract addresses (to be updated after deployment)
export const CONTRACT_ADDRESSES = {
  PREDICTION_MARKET: process.env.VITE_PREDICTION_MARKET_ADDRESS || "",
  FAN_TOKEN_DAO: process.env.VITE_FAN_TOKEN_DAO_ADDRESS || "",
  SKILL_SHOWCASE: process.env.VITE_SKILL_SHOWCASE_ADDRESS || "",
  COURSE_NFT: process.env.VITE_COURSE_NFT_ADDRESS || "",
  MARKETPLACE: process.env.VITE_MARKETPLACE_ADDRESS || "",
};

// Chiliz Spicy Testnet configuration
export const CHAIN_CONFIG = {
  chainId: 88882,
  name: "Chiliz Spicy Testnet",
  rpcUrl: "https://spicy-rpc.chiliz.com/",
  blockExplorer: "https://testnet.chiliscan.com/",
  nativeCurrency: {
    name: "CHZ",
    symbol: "CHZ",
    decimals: 18,
  },
};

// Admin wallet address
export const ADMIN_ADDRESS = "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa";

// Gaming theme configuration
export const THEME_CONFIG = {
  colors: {
    darkBg: "#0A0618",
    cyanAccent: "#00FFE0",
    lightText: "#F0F4FF",
    successGreen: "#00FF88",
    warningGold: "#FFD700",
    errorRed: "#FF4757",
  },
  gradients: {
    gaming: "linear-gradient(135deg, #6322FF 0%, #FF0EF5 100%)",
    card: "linear-gradient(145deg, rgba(99, 34, 255, 0.1) 0%, rgba(255, 14, 245, 0.1) 100%)",
  },
};

// Gas and transaction limits
export const TRANSACTION_CONFIG = {
  maxGasPrice: "0.002", // 0.002 CHZ
  minBetAmount: "0.001", // 0.001 CHZ
  videoUploadReward: "0.01", // 0.01 CHZ
  coursePriceMin: "0.1", // 0.1 CHZ
};

// IPFS configuration
export const IPFS_CONFIG = {
  gateway: "https://nftstorage.link/ipfs/",
  uploadEndpoint: "/api/videos/upload",
  maxFileSize: 500 * 1024 * 1024, // 500MB
  supportedFormats: ["video/mp4", "video/mov", "video/avi", "video/webm"],
};

// WebSocket events
export const WS_EVENTS = {
  BET_PLACED: "bet:placed",
  VIDEO_NEW: "video:new",
  DAO_NEW_PROPOSAL: "dao:newProposal",
  DAO_VOTE_UPDATE: "dao:voteUpdate",
  MARKETPLACE_ITEM_LISTED: "marketplace:itemListed",
  MARKETPLACE_ITEM_SOLD: "marketplace:itemSold",
};

// Game categories
export const GAME_CATEGORIES = [
  "CS:GO",
  "Valorant",
  "League of Legends",
  "Fortnite",
  "Rocket League",
  "Dota 2",
  "Overwatch 2",
  "Tutorials",
  "Other",
];

// NFT metadata standards
export const NFT_METADATA = {
  courseAttributes: [
    "duration",
    "difficulty",
    "language",
    "category",
    "creator",
    "rating",
  ],
  videoAttributes: [
    "category",
    "duration",
    "resolution",
    "uploadDate",
    "creator",
    "verified",
  ],
};

// API endpoints
export const API_ENDPOINTS = {
  // Prediction Markets
  EVENTS: "/api/events",
  PLACE_BET: "/api/bet",
  
  // Videos
  VIDEOS: "/api/videos",
  VIDEO_UPLOAD: "/api/videos/upload",
  VIDEO_LIKE: (id: number) => `/api/videos/${id}/like`,
  
  // DAO
  DAO_PROPOSALS: "/api/dao/proposals",
  DAO_CREATE_PROPOSAL: "/api/dao/proposal",
  DAO_VOTE: "/api/dao/vote",
  
  // Courses
  COURSES: "/api/courses",
  COURSE_PURCHASE: (id: number) => `/api/courses/${id}/purchase`,
  
  // Marketplace
  MARKETPLACE: "/api/marketplace",
  MARKETPLACE_BUY: "/api/marketplace/buy",
  
  // User
  USER: (address: string) => `/api/user/${address}`,
};

// Local storage keys
export const STORAGE_KEYS = {
  WALLET_ADDRESS: "chiliz_wallet_address",
  USER_PREFERENCES: "chiliz_user_preferences",
  THEME_MODE: "chiliz_theme_mode",
};

// Default values
export const DEFAULTS = {
  BET_AMOUNT: "0.001",
  COURSE_DURATION: "4.5 hours",
  COURSE_RATING: "4.9",
  PROPOSAL_DURATION_DAYS: 7,
  PAGINATION_LIMIT: 20,
};
