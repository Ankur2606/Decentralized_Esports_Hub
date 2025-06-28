# ChiliZ eSports Hub - Deployment Fix

## Address Validation Error Fix

The "is not a valid address" error occurs because the Thirdweb interface expects individual parameter values, not JSON array format.

## Correct Deployment Process

### Step 1: Run Command
```bash
npx thirdweb deploy contracts/PredictionMarketSimple.sol -k "$THIRDWEB_SECRET_KEY"
```

### Step 2: Browser Interface
When the Thirdweb interface opens:

1. **Network**: Select "Chiliz Spicy Testnet"
2. **Constructor Parameters**: 
   - **DO NOT** paste: `["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]`
   - **INSTEAD** enter: `0x0734EdcC126a08375a08C02c3117d44B24dF47Fa`
   - (Without quotes, brackets, or spaces)

### Step 3: Deploy
- Click "Deploy Now"
- Approve in MetaMask
- Copy contract address from success page

## All Contract Deployment Parameters

### PredictionMarket
- Command: `npx thirdweb deploy contracts/PredictionMarketSimple.sol -k "$THIRDWEB_SECRET_KEY"`
- Parameter: `0x0734EdcC126a08375a08C02c3117d44B24dF47Fa`

### FanTokenDAO
- Command: `npx thirdweb deploy contracts/FanTokenDAOSimple.sol -k "$THIRDWEB_SECRET_KEY"`
- Parameters (enter each in separate field):
  1. `0x0734EdcC126a08375a08C02c3117d44B24dF47Fa`
  2. `ChiliZ Fan Token`
  3. `FTK`

### SkillShowcase
- Command: `npx thirdweb deploy contracts/SkillShowcaseSimple.sol -k "$THIRDWEB_SECRET_KEY"`
- Parameter: `0x0734EdcC126a08375a08C02c3117d44B24dF47Fa`

### CourseNFT
- Command: `npx thirdweb deploy contracts/CourseNFTSimple.sol -k "$THIRDWEB_SECRET_KEY"`
- Parameters (enter each in separate field):
  1. `0x0734EdcC126a08375a08C02c3117d44B24dF47Fa`
  2. `ChiliZ Course NFT`
  3. `COURSE`
  4. `0x0734EdcC126a08375a08C02c3117d44B24dF47Fa`
  5. `250`

### Marketplace
- Command: `npx thirdweb deploy contracts/MarketplaceSimple.sol -k "$THIRDWEB_SECRET_KEY"`
- Parameter: `0x0734EdcC126a08375a08C02c3117d44B24dF47Fa`

## Key Points
- Enter address values directly (no quotes or brackets)
- Each parameter goes in a separate input field
- Use exact case-sensitive values
- Ensure MetaMask is on Chiliz Spicy Testnet
- Gas costs: ~0.001-0.003 CHZ per deployment