// Contract ABIs for live blockchain interactions
export const PREDICTION_MARKET_ABI = [
  {
    "inputs": [
      {"name": "_name", "type": "string"},
      {"name": "_description", "type": "string"}, 
      {"name": "_endTime", "type": "uint256"}
    ],
    "name": "createEvent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_eventId", "type": "uint256"},
      {"name": "_option", "type": "uint256"}
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

export const FAN_TOKEN_DAO_ABI = [
  {
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_amount", "type": "uint256"}
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_description", "type": "string"}
    ],
    "name": "createProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_proposalId", "type": "uint256"},
      {"name": "_support", "type": "bool"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const SKILL_SHOWCASE_ABI = [
  {
    "inputs": [],
    "name": "fundContract",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_ipfsHash", "type": "string"},
      {"name": "_title", "type": "string"},
      {"name": "_category", "type": "string"}
    ],
    "name": "uploadVideo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const COURSE_NFT_ABI = [
  {
    "inputs": [
      {"name": "_uri", "type": "string"},
      {"name": "_price", "type": "uint256"}
    ],
    "name": "lazyMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_tokenId", "type": "uint256"}
    ],
    "name": "purchase",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

export const MARKETPLACE_ABI = [
  {
    "inputs": [
      {"name": "_tokenId", "type": "uint256"},
      {"name": "_price", "type": "uint256"}
    ],
    "name": "listItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_itemId", "type": "uint256"}
    ],
    "name": "buyItem",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;