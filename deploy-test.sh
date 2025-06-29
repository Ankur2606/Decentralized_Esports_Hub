#!/bin/bash

# Test single contract deployment with proper MetaMask flow
echo "Testing PredictionMarket deployment for MetaMask integration..."

# Validate environment
if [ -z "$THIRDWEB_SECRET_KEY" ]; then
    echo "Error: THIRDWEB_SECRET_KEY not set"
    exit 1
fi

echo "Environment: OK"
echo "Admin Address: 0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"
echo "Network: Chiliz Spicy Testnet (88882)"
echo ""

echo "Starting deployment - browser will open for MetaMask approval..."
echo "Constructor args to paste: [\"0x0734EdcC126a08375a08C02c3117d44B24dF47Fa\"]"
echo ""

# Deploy first contract
npx thirdweb deploy contracts/PredictionMarketSimple.sol -k "$THIRDWEB_SECRET_KEY"

echo ""
echo "Deployment initiated. Complete the process in browser and copy the contract address."