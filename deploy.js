const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const fs = require("fs");
require("dotenv").config();

const CHILIZ_SPICY_TESTNET = {
  name: "Chiliz Spicy Testnet",
  chainId: 88882,
  rpc: ["https://spicy-rpc.chiliz.com/"],
  nativeCurrency: {
    name: "CHZ",
    symbol: "CHZ",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Chiliz Explorer",
      url: "https://spicy-explorer.chiliz.com/",
    },
  ],
  testnet: true,
};

async function deployContracts() {
  console.log("🚀 Starting contract deployment to Chiliz Spicy Testnet...");
  
  const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.ADMIN_PRIVATE_KEY,
    CHILIZ_SPICY_TESTNET,
    {
      secretKey: process.env.THIRDWEB_SECRET_KEY,
    }
  );

  const adminAddress = process.env.ADMIN_WALLET_ADDRESS;
  
  if (!adminAddress) {
    throw new Error("ADMIN_WALLET_ADDRESS not found in environment variables");
  }

  console.log(`📝 Admin address: ${adminAddress}`);

  const deployedContracts = {};

  try {
    // Deploy Prediction Market Contract
    console.log("📊 Deploying Prediction Market...");
    const predictionMarket = await sdk.deployer.deployBuiltInContract("marketplace", {
      name: "ChiliZ Prediction Market",
      description: "eSports Prediction Market on Chiliz",
      image: "https://via.placeholder.com/300x300?text=ChiliZ+Predictions",
      external_link: "",
      seller_fee_basis_points: 250, // 2.5% fee
      fee_recipient: adminAddress,
      trusted_forwarders: [],
    });
    
    deployedContracts.predictionMarket = predictionMarket.getAddress();
    console.log(`✅ Prediction Market deployed: ${deployedContracts.predictionMarket}`);

    // Deploy FanToken DAO Contract
    console.log("🗳️  Deploying FanToken DAO...");
    const fanTokenDAO = await sdk.deployer.deployBuiltInContract("token", {
      name: "ChiliZ Fan Token",
      symbol: "CFT",
      description: "Governance token for ChiliZ eSports Hub",
      image: "https://via.placeholder.com/300x300?text=CFT+Token",
      external_link: "",
      primary_sale_recipient: adminAddress,
    });
    
    deployedContracts.fanTokenDAO = fanTokenDAO.getAddress();
    console.log(`✅ FanToken DAO deployed: ${deployedContracts.fanTokenDAO}`);

    // Deploy Skill Showcase Contract (NFT Collection)
    console.log("🎥 Deploying Skill Showcase...");
    const skillShowcase = await sdk.deployer.deployBuiltInContract("nft-collection", {
      name: "ChiliZ Skill Showcase",
      symbol: "CSS",
      description: "Video NFTs for eSports skill showcase",
      image: "https://via.placeholder.com/300x300?text=Skill+Showcase",
      external_link: "",
      seller_fee_basis_points: 500, // 5% royalty
      fee_recipient: adminAddress,
      primary_sale_recipient: adminAddress,
    });
    
    deployedContracts.skillShowcase = skillShowcase.getAddress();
    console.log(`✅ Skill Showcase deployed: ${deployedContracts.skillShowcase}`);

    // Deploy Course NFT Contract
    console.log("📚 Deploying Course NFT...");
    const courseNFT = await sdk.deployer.deployBuiltInContract("nft-drop", {
      name: "ChiliZ Course NFTs",
      symbol: "CCN",
      description: "Educational course NFTs for eSports",
      image: "https://via.placeholder.com/300x300?text=Course+NFTs",
      external_link: "",
      seller_fee_basis_points: 750, // 7.5% royalty
      fee_recipient: adminAddress,
      primary_sale_recipient: adminAddress,
    });
    
    deployedContracts.courseNFT = courseNFT.getAddress();
    console.log(`✅ Course NFT deployed: ${deployedContracts.courseNFT}`);

    // Deploy Marketplace Contract
    console.log("🛒 Deploying Marketplace...");
    const marketplace = await sdk.deployer.deployBuiltInContract("marketplace", {
      name: "ChiliZ NFT Marketplace",
      description: "NFT marketplace for ChiliZ eSports Hub",
      image: "https://via.placeholder.com/300x300?text=NFT+Marketplace",
      external_link: "",
      seller_fee_basis_points: 250, // 2.5% fee
      fee_recipient: adminAddress,
      trusted_forwarders: [],
    });
    
    deployedContracts.marketplace = marketplace.getAddress();
    console.log(`✅ Marketplace deployed: ${deployedContracts.marketplace}`);

    // Save contract addresses to .env file
    const envContent = `
# Contract Addresses (Auto-generated)
PREDICTION_MARKET_ADDRESS=${deployedContracts.predictionMarket}
FAN_TOKEN_DAO_ADDRESS=${deployedContracts.fanTokenDAO}
SKILL_SHOWCASE_ADDRESS=${deployedContracts.skillShowcase}
COURSE_NFT_ADDRESS=${deployedContracts.courseNFT}
MARKETPLACE_ADDRESS=${deployedContracts.marketplace}
`;

    fs.appendFileSync('.env', envContent);
    
    // Also save to a JSON file for easy reference
    fs.writeFileSync('deployed-contracts.json', JSON.stringify(deployedContracts, null, 2));

    console.log("\n🎉 All contracts deployed successfully!");
    console.log("📄 Contract addresses saved to .env and deployed-contracts.json");
    console.log("\n📋 Deployed Contracts:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployContracts().catch(console.error);
}

module.exports = { deployContracts };