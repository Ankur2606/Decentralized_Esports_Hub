#!/bin/bash

# ChiliZ eSports Hub - Simple Contract Deployment
echo "🎯 ChiliZ eSports Hub - Contract Deployment"
echo "📋 Admin Address: 0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"
echo "🌐 Network: Chiliz Spicy Testnet (Chain ID: 88882)"
echo ""

# Set environment variable to suppress warnings
export FOUNDRY_DISABLE_NIGHTLY_WARNING=true

echo "🚀 Starting contract deployment..."
echo ""

# Function to deploy a contract
deploy_contract() {
    local contract_name=$1
    local contract_file=$2
    
    echo "📦 Deploying $contract_name..."
    echo "Command: npx thirdweb deploy $contract_file -k \$THIRDWEB_SECRET_KEY"
    
    # Try deployment with timeout
    timeout 300 npx thirdweb deploy "$contract_file" -k "$THIRDWEB_SECRET_KEY" &
    local deploy_pid=$!
    
    echo "Deployment started (PID: $deploy_pid)"
    echo "This will open in your browser for configuration..."
    echo ""
    
    # Wait for deployment or timeout
    if wait $deploy_pid; then
        echo "✅ $contract_name deployment command completed"
    else
        echo "⏱️ $contract_name deployment timed out - check browser"
    fi
    
    echo "Constructor args for $contract_name:"
    case $contract_name in
        "PredictionMarket")
            echo '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]'
            ;;
        "FanTokenDAO")
            echo '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Fan Token", "FTK"]'
            ;;
        "SkillShowcase")
            echo '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]'
            ;;
        "CourseNFT")
            echo '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Course NFT", "COURSE", "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", 250]'
            ;;
        "Marketplace")
            echo '["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]'
            ;;
    esac
    echo ""
}

# Deploy all contracts
echo "Starting individual contract deployments..."
echo ""

deploy_contract "PredictionMarket" "contracts/PredictionMarket.sol"
deploy_contract "FanTokenDAO" "contracts/FanTokenDAO.sol"
deploy_contract "SkillShowcase" "contracts/SkillShowcase.sol"
deploy_contract "CourseNFT" "contracts/CourseNFT.sol"
deploy_contract "Marketplace" "contracts/Marketplace.sol"

echo "📝 Next Steps:"
echo "1. Complete deployment in browser tabs that opened"
echo "2. Select 'Chiliz Spicy Testnet' for each contract"
echo "3. Use the constructor arguments shown above"
echo "4. Copy contract addresses from Thirdweb dashboard"
echo "5. Update client/src/lib/constants.ts with new addresses"
echo ""
echo "🔗 Useful Links:"
echo "- Thirdweb Dashboard: https://thirdweb.com/dashboard"
echo "- Chiliz Explorer: https://spicy.chz.tools/"
echo "- Admin Panel: http://localhost:5000/admin"