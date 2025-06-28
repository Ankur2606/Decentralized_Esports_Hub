#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';

const ADMIN_ADDRESS = "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa";

// Contract deployment configurations with constructor args
const contracts = [
  {
    name: "PredictionMarket",
    file: "contracts/PredictionMarketSimple.sol",
    args: [ADMIN_ADDRESS]
  },
  {
    name: "FanTokenDAO", 
    file: "contracts/FanTokenDAOSimple.sol",
    args: [ADMIN_ADDRESS, "ChiliZ Fan Token", "FTK"]
  },
  {
    name: "SkillShowcase",
    file: "contracts/SkillShowcaseSimple.sol", 
    args: [ADMIN_ADDRESS]
  },
  {
    name: "CourseNFT",
    file: "contracts/CourseNFTSimple.sol",
    args: [ADMIN_ADDRESS, "ChiliZ Course NFT", "COURSE", ADMIN_ADDRESS, "250"]
  },
  {
    name: "Marketplace",
    file: "contracts/MarketplaceSimple.sol",
    args: [ADMIN_ADDRESS]
  }
];

function deployContract(contract) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Deploying ${contract.name}...`);
    console.log(`📁 File: ${contract.file}`);
    console.log(`⚙️  Constructor args: [${contract.args.join(', ')}]`);
    
    // Verify contract file exists
    if (!existsSync(contract.file)) {
      reject(new Error(`Contract file not found: ${contract.file}`));
      return;
    }

    // Build command with constructor args
    const cmd = [
      'thirdweb', 'deploy', contract.file,
      '--constructor-args', ...contract.args,
      '-k', process.env.THIRDWEB_SECRET_KEY
    ];

    console.log(`📟 Command: npx ${cmd.join(' ')}`);
    console.log(`🌐 Opening browser for MetaMask approval...\n`);

    const deployProcess = spawn('npx', cmd, {
      stdio: 'inherit'
    });

    deployProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${contract.name} deployment completed successfully`);
        console.log(`📋 Copy the contract address from the browser interface`);
        resolve({ name: contract.name, success: true });
      } else {
        reject(new Error(`${contract.name} deployment failed with code: ${code}`));
      }
    });

    deployProcess.on('error', (error) => {
      reject(new Error(`${contract.name} deployment error: ${error.message}`));
    });
  });
}

async function deployAll() {
  console.log("🔥 ChiliZ eSports Hub - Smart Contract Deployment");
  console.log("🌐 Network: Chiliz Spicy Testnet (Chain ID: 88882)");
  console.log(`👤 Admin Address: ${ADMIN_ADDRESS}`);
  console.log("🔧 Using Thirdweb CLI with constructor arguments\n");

  if (!process.env.THIRDWEB_SECRET_KEY) {
    console.error("❌ THIRDWEB_SECRET_KEY environment variable not set");
    process.exit(1);
  }

  console.log("📋 Deployment Instructions:");
  console.log("1. Browser will open for each contract");
  console.log("2. Select 'Chiliz Spicy Testnet' network");
  console.log("3. Constructor arguments are pre-filled");
  console.log("4. Click 'Deploy Now' and approve in MetaMask");
  console.log("5. Copy contract address when deployment succeeds\n");

  const deployedContracts = [];

  for (const contract of contracts) {
    try {
      const result = await deployContract(contract);
      deployedContracts.push(result);
      
      // Wait for user confirmation before next deployment
      if (contracts.indexOf(contract) < contracts.length - 1) {
        console.log(`\n⏸️  Press Enter when ready to deploy next contract...`);
        await new Promise(resolve => {
          process.stdin.once('data', () => resolve());
        });
      }
    } catch (error) {
      console.error(`❌ ${error.message}`);
      break;
    }
  }

  console.log(`\n🎉 Deployment Summary:`);
  deployedContracts.forEach(contract => {
    console.log(`✅ ${contract.name}: Successfully deployed`);
  });
  
  console.log(`\n📝 Next Steps:`);
  console.log(`1. Update shared/constants.ts with contract addresses`);
  console.log(`2. Test contract functionality through admin panel`);
  console.log(`3. Deploy application to production`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Deployment interrupted');
  process.exit(0);
});

deployAll().catch(error => {
  console.error(`💥 Deployment failed: ${error.message}`);
  process.exit(1);
});