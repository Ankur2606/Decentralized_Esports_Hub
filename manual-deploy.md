# Manual Contract Deployment Guide

## Access Admin Panel
1. Open your app in the browser
2. Navigate to: **http://localhost:5000/admin**
3. Click on "CLI Commands" tab for deployment instructions

## Deploy Contracts Step-by-Step

### 1. Install Thirdweb CLI (if not installed)
```bash
npm install -g @thirdweb-dev/cli
```

### 2. Deploy Each Contract
Run these commands one by one in your terminal:

```bash
# PredictionMarket
npx thirdweb deploy contracts/PredictionMarket.sol

# FanTokenDAO  
npx thirdweb deploy contracts/FanTokenDAO.sol

# SkillShowcase
npx thirdweb deploy contracts/SkillShowcase.sol

# CourseNFT
npx thirdweb deploy contracts/CourseNFT.sol

# Marketplace
npx thirdweb deploy contracts/Marketplace.sol
```

### 3. Constructor Arguments
When prompted during deployment, use these constructor arguments:

**PredictionMarket:**
```
["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]
```

**FanTokenDAO:**
```
["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Fan Token", "FTK"]
```

**SkillShowcase:**
```
["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]
```

**CourseNFT:**
```
["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Course NFT", "COURSE", "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", 250]
```

**Marketplace:**
```
["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]
```

### 4. Network Selection
- Select "Chiliz Spicy Testnet" when prompted
- Chain ID: 88882
- Use your admin wallet: 0x0734EdcC126a08375a08C02c3117d44B24dF47Fa

### 5. After Deployment
1. Copy each contract address
2. Update `client/src/lib/constants.ts` with the new addresses
3. Restart your application
4. Test contracts using the admin panel testing functions

## Quick Links
- Admin Panel: http://localhost:5000/admin
- Chiliz Explorer: https://spicy.chz.tools/
- Thirdweb Dashboard: https://thirdweb.com/dashboard