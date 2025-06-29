import { getContract, readContract } from "thirdweb";
import { client, chilizSpicy, CONTRACT_ADDRESSES } from "./thirdweb";

// Contract ABI fragments for the functions we need
const predictionMarketABI = [
  {
    "type": "function",
    "name": "createEvent",
    "inputs": [
      {"name": "name", "type": "string"},
      {"name": "ipfsHash", "type": "string"},
      {"name": "endTime", "type": "uint256"}
    ],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "placeBet",
    "inputs": [
      {"name": "eventId", "type": "uint256"},
      {"name": "option", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "resolveEvent",
    "inputs": [
      {"name": "eventId", "type": "uint256"},
      {"name": "winningOption", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "eventCounter",
    "inputs": [],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view"
  }
] as const;

const fanTokenDAOABI = [
  {
    "type": "function",
    "name": "mint",
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createProposal",
    "inputs": [
      {"name": "description", "type": "string"}
    ],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "vote",
    "inputs": [
      {"name": "proposalId", "type": "uint256"},
      {"name": "support", "type": "bool"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
] as const;

const skillShowcaseABI = [
  {
    "type": "function",
    "name": "uploadVideo",
    "inputs": [
      {"name": "ipfsHash", "type": "string"},
      {"name": "title", "type": "string"},
      {"name": "category", "type": "string"}
    ],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "fundRewards",
    "inputs": [],
    "outputs": [],
    "stateMutability": "payable"
  }
] as const;

const courseNFTABI = [
  {
    "type": "function",
    "name": "lazyMint",
    "inputs": [
      {"name": "_amount", "type": "uint256"},
      {"name": "_baseURIForTokens", "type": "string"},
      {"name": "_data", "type": "bytes"}
    ],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claim",
    "inputs": [
      {"name": "_receiver", "type": "address"},
      {"name": "_quantity", "type": "uint256"},
      {"name": "_currency", "type": "address"},
      {"name": "_pricePerToken", "type": "uint256"},
      {"name": "_allowlistProof", "type": "tuple"},
      {"name": "_data", "type": "bytes"}
    ],
    "outputs": [],
    "stateMutability": "payable"
  }
] as const;

const marketplaceABI = [
  {
    "type": "function",
    "name": "createListing",
    "inputs": [
      {"name": "_params", "type": "tuple"}
    ],
    "outputs": [{"type": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "buyFromListing",
    "inputs": [
      {"name": "_listingId", "type": "uint256"},
      {"name": "_buyFor", "type": "address"},
      {"name": "_quantity", "type": "uint256"},
      {"name": "_currency", "type": "address"},
      {"name": "_expectedTotalPrice", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "payable"
  }
] as const;

// Contract instances
export const predictionMarketContract = getContract({
  client,
  chain: chilizSpicy,
  address: CONTRACT_ADDRESSES.PREDICTION_MARKET,
  abi: predictionMarketABI,
});

export const fanTokenDAOContract = getContract({
  client,
  chain: chilizSpicy,
  address: CONTRACT_ADDRESSES.FAN_TOKEN_DAO,
  abi: fanTokenDAOABI,
});

export const skillShowcaseContract = getContract({
  client,
  chain: chilizSpicy,
  address: CONTRACT_ADDRESSES.SKILL_SHOWCASE,
  abi: skillShowcaseABI,
});

export const courseNFTContract = getContract({
  client,
  chain: chilizSpicy,
  address: CONTRACT_ADDRESSES.COURSE_NFT,
  abi: courseNFTABI,
});

export const marketplaceContract = getContract({
  client,
  chain: chilizSpicy,
  address: CONTRACT_ADDRESSES.MARKETPLACE,
  abi: marketplaceABI,
});

// Helper function to get the latest event counter from blockchain
export async function getLatestEventCounter(): Promise<bigint> {
  try {
    const result = await readContract({
      contract: predictionMarketContract,
      method: "eventCounter"
    });
    return result;
  } catch (error) {
    console.error("Failed to get event counter:", error);
    return BigInt(1); // Fallback to 1 if unable to read from contract
  }
}


  } catch (error) {
    console.error("Error reading event counter:", error);
    return BigInt(0);
  }
}