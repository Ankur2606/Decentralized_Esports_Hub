import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Wallet } from "ethers";
import fs from "fs";
import path from "path";

// Chiliz Spicy Testnet configuration
const CHAIN_ID = 88882;
const RPC_URL = "https://spicy-rpc.chiliz.com/";
const ADMIN_ADDRESS = "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa";

async function deployContracts() {
  console.log("🎯 ChiliZ eSports Hub - Direct Deployment");
  console.log("📋 Admin Address:", ADMIN_ADDRESS);
  console.log("🌐 Network: Chiliz Spicy Testnet");
  
  try {
    // Initialize SDK with Chiliz Spicy Testnet
    const sdk = ThirdwebSDK.fromPrivateKey(
      process.env.ADMIN_PRIVATE_KEY || "your-private-key-here",
      {
        name: "Chiliz Spicy Testnet",
        chainId: CHAIN_ID,
        rpc: [RPC_URL],
      }
    );

    console.log("\n📦 Starting contract deployment...\n");

    const contracts = {};

    // Deploy PredictionMarket
    console.log("1️⃣ Deploying PredictionMarket...");
    const predictionMarket = await sdk.deployer.deployContract({
      name: "PredictionMarket",
      abi: [], // Will be filled from compiled contract
      constructorParams: [ADMIN_ADDRESS],
    });
    contracts.predictionMarket = predictionMarket.getAddress();
    console.log("✅ PredictionMarket deployed:", contracts.predictionMarket);

    // Deploy FanTokenDAO
    console.log("\n2️⃣ Deploying FanTokenDAO...");
    const fanTokenDAO = await sdk.deployer.deployContract({
      name: "FanTokenDAO", 
      abi: [],
      constructorParams: [ADMIN_ADDRESS, "ChiliZ Fan Token", "FTK"],
    });
    contracts.fanTokenDAO = fanTokenDAO.getAddress();
    console.log("✅ FanTokenDAO deployed:", contracts.fanTokenDAO);

    // Deploy SkillShowcase
    console.log("\n3️⃣ Deploying SkillShowcase...");
    const skillShowcase = await sdk.deployer.deployContract({
      name: "SkillShowcase",
      abi: [],
      constructorParams: [ADMIN_ADDRESS],
    });
    contracts.skillShowcase = skillShowcase.getAddress();
    console.log("✅ SkillShowcase deployed:", contracts.skillShowcase);

    // Deploy CourseNFT
    console.log("\n4️⃣ Deploying CourseNFT...");
    const courseNFT = await sdk.deployer.deployContract({
      name: "CourseNFT",
      abi: [],
      constructorParams: [
        ADMIN_ADDRESS,
        "ChiliZ Course NFT", 
        "COURSE",
        ADMIN_ADDRESS,
        250
      ],
    });
    contracts.courseNFT = courseNFT.getAddress();
    console.log("✅ CourseNFT deployed:", contracts.courseNFT);

    // Deploy Marketplace
    console.log("\n5️⃣ Deploying Marketplace...");
    const marketplace = await sdk.deployer.deployContract({
      name: "Marketplace",
      abi: [],
      constructorParams: [ADMIN_ADDRESS],
    });
    contracts.marketplace = marketplace.getAddress();
    console.log("✅ Marketplace deployed:", contracts.marketplace);

    // Update constants file
    console.log("\n📝 Updating constants file...");
    updateConstants(contracts);
    
    console.log("\n🎉 All contracts deployed successfully!");
    console.log("\n📋 Contract Addresses:");
    Object.entries(contracts).forEach(([name, address]) => {
      console.log(`${name}: ${address}`);
    });

    console.log("\n🔗 View on Chiliz Explorer:");
    Object.entries(contracts).forEach(([name, address]) => {
      console.log(`${name}: https://spicy.chz.tools/address/${address}`);
    });

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    console.log("\n💡 Alternative: Use manual Thirdweb CLI deployment");
    console.log("Run: npx thirdweb deploy contracts/PredictionMarket.sol");
  }
}

function updateConstants(contracts) {
  const constantsPath = path.join("client", "src", "lib", "constants.ts");
  
  try {
    let content = fs.readFileSync(constantsPath, "utf8");
    
    // Update each contract address
    Object.entries(contracts).forEach(([name, address]) => {
      const contractKey = name.charAt(0).toLowerCase() + name.slice(1);
      const regex = new RegExp(`${contractKey}:\\s*"[^"]*"`, "g");
      content = content.replace(regex, `${contractKey}: "${address}"`);
    });
    
    fs.writeFileSync(constantsPath, content);
    console.log("✅ Constants file updated successfully");
  } catch (error) {
    console.log("⚠️ Could not update constants file automatically");
    console.log("Please update client/src/lib/constants.ts manually with:");
    Object.entries(contracts).forEach(([name, address]) => {
      const contractKey = name.charAt(0).toLowerCase() + name.slice(1);
      console.log(`${contractKey}: "${address}"`);
    });
  }
}

deployContracts();