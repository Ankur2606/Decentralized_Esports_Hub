import { spawn } from 'child_process';

const ADMIN_ADDRESS = "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa";

// Validate admin address format
function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

console.log("ChiliZ eSports Hub - Contract Deployment");
console.log(`Admin Address: ${ADMIN_ADDRESS}`);
console.log(`Address Valid: ${isValidAddress(ADMIN_ADDRESS)}`);
console.log("Network: Chiliz Spicy Testnet (Chain ID: 88882)");
console.log("");

if (!isValidAddress(ADMIN_ADDRESS)) {
  console.error("Invalid admin address format");
  process.exit(1);
}

console.log("Deploying PredictionMarket contract...");
console.log("Browser will open for MetaMask approval");
console.log("");
console.log("In the browser interface:");
console.log("1. Select 'Chiliz Spicy Testnet' network");
console.log("2. For constructor arguments, enter EXACTLY:");
console.log(`   ${ADMIN_ADDRESS}`);
console.log("   (without quotes or brackets)");
console.log("3. Click 'Deploy Now'");
console.log("4. Approve in MetaMask");
console.log("");

const deployProcess = spawn('npx', [
  'thirdweb',
  'deploy',
  'contracts/PredictionMarketSimple.sol',
  '-k',
  process.env.THIRDWEB_SECRET_KEY
], {
  stdio: 'inherit'
});

deployProcess.on('close', (code) => {
  console.log(`\nDeployment process completed with code: ${code}`);
  if (code === 0) {
    console.log("Check browser for contract address");
  }
});

deployProcess.on('error', (error) => {
  console.error('Deployment error:', error);
});