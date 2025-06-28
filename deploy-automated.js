#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ADMIN_ADDRESS = "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa";

const contracts = [
  {
    name: "PredictionMarket",
    file: "contracts/PredictionMarketSimple.sol",
    args: `["${ADMIN_ADDRESS}"]`
  },
  {
    name: "FanTokenDAO", 
    file: "contracts/FanTokenDAOSimple.sol",
    args: `["${ADMIN_ADDRESS}", "ChiliZ Fan Token", "FTK"]`
  },
  {
    name: "SkillShowcase",
    file: "contracts/SkillShowcaseSimple.sol", 
    args: `["${ADMIN_ADDRESS}"]`
  },
  {
    name: "CourseNFT",
    file: "contracts/CourseNFTSimple.sol",
    args: `["${ADMIN_ADDRESS}", "ChiliZ Course NFT", "COURSE", "${ADMIN_ADDRESS}", 250]`
  },
  {
    name: "Marketplace",
    file: "contracts/MarketplaceSimple.sol",
    args: `["${ADMIN_ADDRESS}"]`
  }
];

async function deployContract(contract) {
  return new Promise((resolve, reject) => {
    console.log(`\n📄 Deploying ${contract.name}...`);
    console.log(`Constructor args: ${contract.args}`);
    
    const process = spawn('npx', [
      'thirdweb', 
      'deploy', 
      contract.file,
      '-k',
      process.env.THIRDWEB_SECRET_KEY,
      '--constructor-args',
      contract.args
    ], {
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${contract.name} deployed successfully!`);
        resolve();
      } else {
        console.log(`❌ Failed to deploy ${contract.name}`);
        reject(new Error(`Deployment failed with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      console.error(`Error deploying ${contract.name}:`, error);
      reject(error);
    });
  });
}

async function main() {
  console.log('🚀 Starting automated contract deployment...');
  console.log(`Admin Address: ${ADMIN_ADDRESS}`);
  console.log('Network: Chiliz Spicy Testnet (Chain ID: 88882)');
  
  try {
    for (const contract of contracts) {
      await deployContract(contract);
    }
    
    console.log('\n🎉 All contracts deployed successfully!');
    console.log('\nNext steps:');
    console.log('1. Copy contract addresses from deployment output');
    console.log('2. Update constants file in application');
    console.log('3. Test functionality in admin panel at /admin');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { deployContract, contracts };