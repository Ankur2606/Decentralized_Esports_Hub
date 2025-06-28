#!/bin/bash

# Fix deployment error - deploy one contract at a time
ADMIN_ADDRESS="0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"

echo "🚀 ChiliZ eSports Hub - Single Contract Deployment"
echo "Admin Address: $ADMIN_ADDRESS"
echo ""

echo "Starting PredictionMarket deployment..."
echo "Constructor args: [\"$ADMIN_ADDRESS\"]"

npx thirdweb deploy contracts/PredictionMarketSimple.sol \
  -k "$THIRDWEB_SECRET_KEY" \
  --constructor-args "[\"$ADMIN_ADDRESS\"]" \
  --network chiliz-spicy-testnet

echo ""
echo "Deployment command completed. Check browser for contract address."
echo "Copy the deployed address and run the next contract deployment."