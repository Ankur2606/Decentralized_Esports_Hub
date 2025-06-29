#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting contract deployment to Chiliz Spicy Testnet...');

// Check if required environment variables are present
const requiredEnvVars = [
  'THIRDWEB_SECRET_KEY',
  'ADMIN_WALLET_ADDRESS',
  'ADMIN_PRIVATE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please ensure all secrets are configured in your environment.');
  process.exit(1);
}

// Run the deployment script
const deployScript = path.join(__dirname, 'deploy.js');

exec(`node ${deployScript}`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.error('⚠️  Deployment warnings:', stderr);
  }
  
  console.log(stdout);
  console.log('✅ Contract deployment completed successfully!');
  console.log('📝 Contract addresses have been saved to .env file');
  console.log('🔄 Restart the application to load the new contract addresses');
});