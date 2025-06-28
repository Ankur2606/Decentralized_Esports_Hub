#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🎯 ChiliZ eSports Hub - Quick Contract Deployment');
console.log('📋 Admin Address: 0x0734EdcC126a08375a08C02c3117d44B24dF47Fa');
console.log('🌐 Target Network: Chiliz Spicy Testnet (Chain ID: 88882)\n');

const contracts = [
  {
    name: 'PredictionMarket',
    file: 'contracts/PredictionMarket.sol',
    args: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]'
  },
  {
    name: 'FanTokenDAO', 
    file: 'contracts/FanTokenDAO.sol',
    args: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Fan Token", "FTK"]'
  },
  {
    name: 'SkillShowcase',
    file: 'contracts/SkillShowcase.sol', 
    args: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]'
  },
  {
    name: 'CourseNFT',
    file: 'contracts/CourseNFT.sol',
    args: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Course NFT", "COURSE", "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", 250]'
  },
  {
    name: 'Marketplace',
    file: 'contracts/Marketplace.sol',
    args: '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]'
  }
];

console.log('📦 Ready to deploy contracts:');
contracts.forEach((contract, i) => {
  console.log(`${i + 1}. ${contract.name} - ${contract.file}`);
});

console.log('\n🚀 DEPLOYMENT COMMANDS:');
console.log('Copy and run these commands in your terminal:\n');

contracts.forEach((contract, i) => {
  console.log(`# ${i + 1}. Deploy ${contract.name}`);
  console.log(`npx thirdweb deploy ${contract.file}`);
  console.log(`# Constructor args: ${contract.args}`);
  console.log('# Select: Chiliz Spicy Testnet (Chain ID: 88882)');
  console.log('# Use wallet: 0x0734EdcC126a08375a08C02c3117d44B24dF47Fa\n');
});

console.log('📝 AFTER DEPLOYMENT:');
console.log('1. Copy each contract address from Thirdweb dashboard');
console.log('2. Update client/src/lib/constants.ts with new addresses');
console.log('3. Restart your application');
console.log('4. Test contracts in admin panel\n');

console.log('🔗 USEFUL LINKS:');
console.log('- Admin Panel: http://localhost:5000/admin');
console.log('- Thirdweb Dashboard: https://thirdweb.com/dashboard');
console.log('- Chiliz Explorer: https://spicy.chz.tools/');
console.log('- Get test CHZ: Chiliz Spicy Testnet Faucet\n');

console.log('💡 TIP: Run contracts one by one for better control');
console.log('Each deployment opens in your browser for easy configuration');