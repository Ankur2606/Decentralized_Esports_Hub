import { createThirdwebClient, defineChain } from "thirdweb";
import { createWallet } from "thirdweb/wallets";

// Create Thirdweb client
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "demo-client-id",
});

// Define Chiliz Spicy Testnet
export const chilizSpicyTestnet = defineChain({
  id: 88882,
  name: "Chiliz Spicy Testnet",
  nativeCurrency: {
    name: "CHZ",
    symbol: "CHZ",
    decimals: 18,
  },
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

// Supported wallets
export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("walletConnect"),
];

// Contract addresses (will be set after deployment)
export const CONTRACT_ADDRESSES = {
  PREDICTION_MARKET: "",
  FAN_TOKEN_DAO: "",
  SKILL_SHOWCASE: "",
  COURSE_NFT: "",
  MARKETPLACE: "",
} as const;