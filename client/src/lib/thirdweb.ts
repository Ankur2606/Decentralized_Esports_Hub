import { createThirdwebClient, defineChain } from "thirdweb";

// Create the thirdweb client
export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "your-client-id-here",
});

// Define Chiliz Spicy Testnet
export const chilizSpicy = defineChain({
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
      url: "https://testnet.chiliscan.com",
    },
  ],
  testnet: true,
});

// Contract addresses
export const CONTRACT_ADDRESSES = {
  PREDICTION_MARKET: "0xb618a00C835BEbf037FED9c27A47b328B8432E64",
  FAN_TOKEN_DAO: "0x3E50F7248b496D8d05FfB57cf7dEC4E1A15EE4B9",
  SKILL_SHOWCASE: "0x0BC823aB3fdF9241a06F366305F58c4a946e87C2",
  COURSE_NFT: "0x493E9D4BA1B9ca07315c0eca1eDd1ac5872162CF",
  MARKETPLACE: "0xEc2Fa2047816B238Fb14a0589b4825d92DF40467",
} as const;