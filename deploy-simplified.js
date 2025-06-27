#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const ADMIN_ADDRESS = "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa";

// Create deployment instructions and test setup
async function setupDeployment() {
  console.log('🎯 ChiliZ eSports Hub - Contract Deployment Setup');
  console.log('📋 Admin Address:', ADMIN_ADDRESS);
  
  // Update constants with deployment status
  await updateConstants();
  
  // Create admin test functions
  await createAdminTestFunctions();
  
  // Show deployment instructions
  showDeploymentInstructions();
}

async function updateConstants() {
  const constantsPath = 'client/src/lib/constants.ts';
  
  try {
    let content = await fs.readFile(constantsPath, 'utf8');
    
    const deploymentStatus = {
      deployed: 0,
      total: 5,
      contracts: {
        predictionMarket: undefined,
        fanTokenDAO: undefined,
        skillShowcase: undefined,
        courseNFT: undefined,
        marketplace: undefined
      },
      isComplete: false,
      adminAddress: ADMIN_ADDRESS,
      testFunctionsReady: true
    };
    
    // Add deployment status
    const deploymentStatusCode = `\nexport const DEPLOYMENT_STATUS = ${JSON.stringify(deploymentStatus, null, 2)};`;
    
    // Add contract testing info
    const testingInfo = `
export const CONTRACT_TESTING = {
  minBetAmount: "0.001", // CHZ
  uploadReward: "0.01", // CHZ
  verificationBonus: "0.05", // CHZ
  minCoursePrice: "0.1", // CHZ
  platformFee: "2.5", // percentage
  maxGasCost: "0.002" // CHZ
};

export const ADMIN_FUNCTIONS = {
  // These functions will be available once contracts are deployed
  predictionMarket: [
    "createEvent(name, ipfsHash, endTime)",
    "resolveEvent(eventId, winningOption)"
  ],
  skillShowcase: [
    "verifyVideo(videoId)",
    "fundContract() - Add CHZ for rewards"
  ],
  fanTokenDAO: [
    "mint(userAddress, amount)",
    "executeProposal(proposalId)"
  ],
  courseNFT: [
    "setRoyalty(recipient, bps)"
  ],
  marketplace: [
    "updatePlatformFee(newFee)"
  ]
};`;
    
    content += deploymentStatusCode + testingInfo;
    
    await fs.writeFile(constantsPath, content);
    console.log('✓ Updated constants with deployment configuration');
    
  } catch (error) {
    console.log('Creating constants file...');
    const newContent = `export const ADMIN_ADDRESS = "${ADMIN_ADDRESS}";
export const CHAIN_CONFIG = {
  id: 88882,
  name: "Chiliz Spicy Testnet",
  rpcUrl: "https://spicy-rpc.chiliz.com/",
  explorerUrl: "https://spicy.chz.tools/"
};

export const DEPLOYMENT_STATUS = {
  deployed: 0,
  total: 5,
  contracts: {
    predictionMarket: undefined,
    fanTokenDAO: undefined,
    skillShowcase: undefined,
    courseNFT: undefined,
    marketplace: undefined
  },
  isComplete: false,
  adminAddress: "${ADMIN_ADDRESS}",
  testFunctionsReady: true
};`;
    
    await fs.writeFile(constantsPath, newContent);
  }
}

async function createAdminTestFunctions() {
  const testScript = `// ChiliZ eSports Hub - Admin Test Functions
// Run these after contract deployment to create test content

export class AdminTester {
  constructor(web3Service) {
    this.web3 = web3Service;
    this.adminAddress = "${ADMIN_ADDRESS}";
  }

  // 1. Prediction Market Tests
  async createTestEvent() {
    console.log("Creating test betting event...");
    try {
      const endTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const txHash = await this.web3.createEvent(
        "Team A vs Team B - Valorant Championship",
        "QmTestEventHash123", // Replace with actual IPFS hash
        endTime
      );
      console.log("✓ Test event created, txHash:", txHash);
      return txHash;
    } catch (error) {
      console.error("❌ Failed to create event:", error);
    }
  }

  async fundSkillShowcase() {
    console.log("Funding SkillShowcase contract for rewards...");
    // This would send CHZ to the contract for creator rewards
    console.log("Send 1 CHZ to SkillShowcase contract address");
  }

  // 2. DAO Tests
  async mintTestTokens(userAddress, amount = "100") {
    console.log(\`Minting \${amount} fan tokens to \${userAddress}...\`);
    try {
      const txHash = await this.web3.mintFanTokens(userAddress, amount);
      console.log("✓ Tokens minted, txHash:", txHash);
      return txHash;
    } catch (error) {
      console.error("❌ Failed to mint tokens:", error);
    }
  }

  // 3. Course NFT Tests
  async createTestCourse() {
    console.log("Creating test course NFT...");
    try {
      const txHash = await this.web3.lazyMintCourse(
        "QmTestCourseHash456", // Replace with actual IPFS hash
        "0.1" // 0.1 CHZ price
      );
      console.log("✓ Test course created, txHash:", txHash);
      return txHash;
    } catch (error) {
      console.error("❌ Failed to create course:", error);
    }
  }

  // 4. Full Test Suite
  async runFullTestSuite() {
    console.log("🧪 Running full admin test suite...");
    
    console.log("\\n1. Testing Prediction Market...");
    await this.createTestEvent();
    
    console.log("\\n2. Testing DAO Tokens...");
    await this.mintTestTokens(this.adminAddress);
    
    console.log("\\n3. Testing Course NFTs...");
    await this.createTestCourse();
    
    console.log("\\n4. Funding contracts...");
    await this.fundSkillShowcase();
    
    console.log("\\n✅ Admin test suite completed!");
    console.log("\\nNext steps:");
    console.log("- Users can now place bets on the test event");
    console.log("- Users can upload videos and earn rewards");
    console.log("- DAO token holders can create and vote on proposals");
    console.log("- Users can purchase the test course");
  }
}

// Usage example:
// const tester = new AdminTester(web3Service);
// await tester.runFullTestSuite();
`;

  await fs.writeFile('admin-test-functions.js', testScript);
  console.log('✓ Created admin test functions: admin-test-functions.js');
}

function showDeploymentInstructions() {
  console.log(`
📋 DEPLOYMENT INSTRUCTIONS
${'='.repeat(50)}

🚀 STEP 1: Deploy Contracts via Thirdweb CLI
   Run these commands one by one:

   npx thirdweb deploy contracts/PredictionMarket.sol
   npx thirdweb deploy contracts/FanTokenDAO.sol  
   npx thirdweb deploy contracts/SkillShowcase.sol
   npx thirdweb deploy contracts/CourseNFT.sol
   npx thirdweb deploy contracts/Marketplace.sol

🌐 STEP 2: Configure Deployment
   - Select "Chiliz Spicy Testnet" (Chain ID: 88882)
   - Use admin address: ${ADMIN_ADDRESS}
   - Constructor arguments:
     * PredictionMarket: ["${ADMIN_ADDRESS}"]
     * FanTokenDAO: ["${ADMIN_ADDRESS}", "ChiliZ Fan Token", "FTK"]
     * SkillShowcase: ["${ADMIN_ADDRESS}"]
     * CourseNFT: ["${ADMIN_ADDRESS}", "ChiliZ Course NFT", "COURSE", "${ADMIN_ADDRESS}", 250]
     * Marketplace: ["${ADMIN_ADDRESS}"]

📝 STEP 3: Update Contract Addresses
   After deployment, update these in your constants:
   - Copy each deployed contract address
   - Update CONTRACT_ADDRESSES in constants.ts

🧪 STEP 4: Test Contracts
   Run the admin test functions to create sample content:
   - Import AdminTester from admin-test-functions.js
   - Run test suite to populate with test data

💰 GAS OPTIMIZATION FEATURES:
   - Minimum bet: 0.001 CHZ
   - Video upload reward: 0.01 CHZ  
   - Course minimum price: 0.1 CHZ
   - All transactions under 0.002 CHZ gas cost
   - Platform fee: 2.5%

🔗 USEFUL LINKS:
   - Chiliz Spicy Explorer: https://spicy.chz.tools/
   - Thirdweb Dashboard: https://thirdweb.com/dashboard
   - Get test CHZ: Chiliz Spicy Testnet Faucet

⚡ TESTING PRIORITY ORDER:
   1. PredictionMarket (Core betting)
   2. SkillShowcase (Video + rewards)  
   3. FanTokenDAO (Governance)
   4. CourseNFT (Educational content)
   5. Marketplace (Trading)
`);
}

// Run setup
setupDeployment().catch(console.error);