#!/bin/bash

# Test PredictionMarket deployment with hardcoded admin (recommended)
echo "Testing PredictionMarket deployment for MetaMask integration..."

# Validate environment
if [ -z "$THIRDWEB_SECRET_KEY" ]; then
    echo "Error: THIRDWEB_SECRET_KEY not set"
    exit 1
fi

echo "Environment: OK"
echo "Admin Address: 0x0734EdcC126a08375a08C02c3117d44B24dF47Fa (hardcoded)"
echo "Network: Chiliz Spicy Testnet (88882)"
echo ""

echo "Starting deployment with hardcoded admin - browser will open for MetaMask approval..."
echo "No constructor arguments needed!"
echo ""

# Deploy hardcoded version (recommended)
npx thirdweb deploy contracts/PredictionMarketHardcoded.sol -k "$THIRDWEB_SECRET_KEY"

echo ""
echo "Deployment initiated. Complete the process in browser and copy the contract address."
echo "After deployment, update the admin panel with the contract address."