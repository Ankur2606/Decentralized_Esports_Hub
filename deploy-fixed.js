import { spawn } from 'child_process';
import fs from 'fs';

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

function deployContract(contract) {
  return new Promise((resolve, reject) => {
    console.log(`\nDeploying ${contract.name}...`);
    console.log(`File: ${contract.file}`);
    console.log(`Constructor args: ${contract.args}`);
    
    if (!process.env.THIRDWEB_SECRET_KEY) {
      reject(new Error('THIRDWEB_SECRET_KEY environment variable not set'));
      return;
    }
    
    const deployProcess = spawn('npx', [
      'thirdweb',
      'deploy', 
      contract.file,
      '-k',
      process.env.THIRDWEB_SECRET_KEY,
      '--constructor-args',
      contract.args
    ], {
      stdio: 'inherit'
    });
    
    deployProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${contract.name} deployed successfully!`);
        resolve(contract.name);
      } else {
        console.log(`❌ ${contract.name} deployment failed with code ${code}`);
        reject(new Error(`Deployment failed with exit code ${code}`));
      }
    });
    
    deployProcess.on('error', (error) => {
      console.error(`Error deploying ${contract.name}:`, error);
      reject(error);
    });
  });
}

async function deployAll() {
  console.log('🚀 Starting ChiliZ eSports Hub contract deployment');
  console.log(`Admin Address: ${ADMIN_ADDRESS}`);
  console.log('Network: Chiliz Spicy Testnet (Chain ID: 88882)');
  console.log('');
  
  const deployedContracts = [];
  
  for (const contract of contracts) {
    try {
      const result = await deployContract(contract);
      deployedContracts.push(result);
    } catch (error) {
      console.error(`Failed to deploy ${contract.name}:`, error.message);
      break;
    }
  }
  
  console.log('\n🎉 Deployment Summary:');
  console.log(`Successfully deployed: ${deployedContracts.length}/${contracts.length} contracts`);
  
  if (deployedContracts.length === contracts.length) {
    console.log('\n✅ All contracts deployed successfully!');
    console.log('\nNext steps:');
    console.log('1. Copy contract addresses from deployment outputs');
    console.log('2. Update environment variables with contract addresses');
    console.log('3. Test functionality in admin panel at /admin');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  deployAll().catch(console.error);
}