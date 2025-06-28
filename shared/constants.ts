// Contract addresses - deployed to Chiliz Spicy Testnet
export const CONTRACT_ADDRESSES = {
  PREDICTION_MARKET: "0xb618a00C835BEbf037FED9c27A47b328B8432E64",
  FAN_TOKEN_DAO: "0x3E50F7248b496D8d05FfB57cf7dEC4E1A15EE4B9",
  SKILL_SHOWCASE: "0x0BC823aB3fdF9241a06F366305F58c4a946e87C2",
  COURSE_NFT: "0x493E9D4BA1B9ca07315c0eca1eDd1ac5872162CF",
  MARKETPLACE: "0xEc2Fa2047816B238Fb14a0589b4825d92DF40467",
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 88882,
  name: "Chiliz Spicy Testnet",
  rpcUrl: "https://spicy-rpc.chiliz.com/",
  blockExplorerUrl: "https://testnet.chiliscan.com/",
  nativeCurrency: {
    name: "CHZ",
    symbol: "CHZ",
    decimals: 18,
  },
};

// Admin configuration
export const ADMIN_CONFIG = {
  address: "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa",
  privateKey: process.env.ADMIN_PRIVATE_KEY || "",
};

// Contract parameters
export const CONTRACT_PARAMS = {
  PREDICTION_MARKET: {
    MIN_BET: "0.001", // CHZ
  },
  SKILL_SHOWCASE: {
    UPLOAD_REWARD: "0.01", // CHZ
  },
  COURSE_NFT: {
    MIN_PRICE: "0.1", // CHZ
    ROYALTY_BPS: 250, // 2.5%
  },
  MARKETPLACE: {
    PLATFORM_FEE_PERCENT: 250, // 2.5%
  },
  FAN_TOKEN_DAO: {
    VOTING_PERIOD: 7 * 24 * 60 * 60, // 7 days in seconds
  },
};

// Deployment status tracking
export const DEPLOYMENT_STATUS = {
  contracts: [
    {
      name: "PredictionMarket",
      file: "contracts/PredictionMarketSimple.sol",
      deployed: false,
      address: "",
      deploymentTx: "",
    },
    {
      name: "FanTokenDAO",
      file: "contracts/FanTokenDAOSimple.sol", 
      deployed: false,
      address: "",
      deploymentTx: "",
    },
    {
      name: "SkillShowcase",
      file: "contracts/SkillShowcaseSimple.sol",
      deployed: false,
      address: "",
      deploymentTx: "",
    },
    {
      name: "CourseNFT", 
      file: "contracts/CourseNFTSimple.sol",
      deployed: false,
      address: "",
      deploymentTx: "",
    },
    {
      name: "Marketplace",
      file: "contracts/MarketplaceSimple.sol",
      deployed: false,
      address: "",
      deploymentTx: "",
    },
  ],
};

// Gas optimization settings
export const GAS_SETTINGS = {
  gasLimit: 3000000,
  maxFeePerGas: "20000000000", // 20 gwei
  maxPriorityFeePerGas: "2000000000", // 2 gwei
};

// IPFS configuration
export const IPFS_CONFIG = {
  gateway: "https://gateway.pinata.cloud/ipfs/",
  apiKey: process.env.NFT_STORAGE_API_KEY || "",
};

// Thirdweb configuration
export const THIRDWEB_CONFIG = {
  clientId: process.env.VITE_THIRDWEB_CLIENT_ID || "",
  secretKey: process.env.THIRDWEB_SECRET_KEY || "",
};