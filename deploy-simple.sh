#!/bin/bash

# Set admin address
ADMIN_ADDRESS="0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"

echo "🚀 Starting contract deployment to Chiliz Spicy Testnet..."
echo "Admin Address: $ADMIN_ADDRESS"
echo ""

# Function to deploy a contract
deploy_contract() {
    local contract_file=$1
    local contract_name=$2
    local constructor_args=$3
    
    echo "📄 Deploying $contract_name..."
    echo "Constructor args: $constructor_args"
    
    # Deploy using thirdweb
    npx thirdweb deploy "$contract_file" -k "$THIRDWEB_SECRET_KEY" --constructor-args "$constructor_args"
    
    if [ $? -eq 0 ]; then
        echo "✅ $contract_name deployed successfully!"
    else
        echo "❌ Failed to deploy $contract_name"
        exit 1
    fi
    echo ""
}

# Deploy all contracts
echo "Starting deployment sequence..."
echo ""

# 1. PredictionMarket
deploy_contract "contracts/PredictionMarketSimple.sol" "PredictionMarket" "[\"$ADMIN_ADDRESS\"]"

# 2. FanTokenDAO
deploy_contract "contracts/FanTokenDAOSimple.sol" "FanTokenDAO" "[\"$ADMIN_ADDRESS\", \"ChiliZ Fan Token\", \"FTK\"]"

# 3. SkillShowcase
deploy_contract "contracts/SkillShowcaseSimple.sol" "SkillShowcase" "[\"$ADMIN_ADDRESS\"]"

# 4. CourseNFT
deploy_contract "contracts/CourseNFTSimple.sol" "CourseNFT" "[\"$ADMIN_ADDRESS\", \"ChiliZ Course NFT\", \"COURSE\", \"$ADMIN_ADDRESS\", 250]"

# 5. Marketplace
deploy_contract "contracts/MarketplaceSimple.sol" "Marketplace" "[\"$ADMIN_ADDRESS\"]"

echo "🎉 All contracts deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy the contract addresses from the deployment output"
echo "2. Update the constants file in your application"
echo "3. Test the functionality in the admin panel"