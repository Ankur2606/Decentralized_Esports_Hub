# ChiliZ eSports Hub - Contract Deployment Guide

## Quick Deployment Steps

The contracts are ready for deployment. Run these commands one by one:

### 1. PredictionMarket Contract
```bash
npx thirdweb deploy contracts/PredictionMarketSimple.sol -k "$THIRDWEB_SECRET_KEY"
```
**Constructor Arguments:** `["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]`

### 2. FanTokenDAO Contract
```bash
npx thirdweb deploy contracts/FanTokenDAOSimple.sol -k "$THIRDWEB_SECRET_KEY"
```
**Constructor Arguments:** `["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Fan Token", "FTK"]`

### 3. SkillShowcase Contract
```bash
npx thirdweb deploy contracts/SkillShowcaseSimple.sol -k "$THIRDWEB_SECRET_KEY"
```
**Constructor Arguments:** `["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]`

### 4. CourseNFT Contract
```bash
npx thirdweb deploy contracts/CourseNFTSimple.sol -k "$THIRDWEB_SECRET_KEY"
```
**Constructor Arguments:** `["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", "ChiliZ Course NFT", "COURSE", "0x0734EdcC126a08375a08C02c3117d44B24dF47Fa", 250]`

### 5. Marketplace Contract
```bash
npx thirdweb deploy contracts/MarketplaceSimple.sol -k "$THIRDWEB_SECRET_KEY"
```
**Constructor Arguments:** `["0x0734EdcC126a08375a08C02c3117d44B24dF47Fa"]`

## Network Configuration
- **Network:** Chiliz Spicy Testnet
- **Chain ID:** 88882
- **Admin Wallet:** 0x0734EdcC126a08375a08C02c3117d44B24dF47Fa

## Contract Features

### PredictionMarket
- Minimum bet: 0.001 CHZ
- Event creation and resolution
- Automatic payout calculation

### FanTokenDAO  
- ERC20 governance token
- Proposal creation and voting
- 7-day voting period

### SkillShowcase
- Video upload rewards: 0.01 CHZ
- Like and verification system
- IPFS content storage

### CourseNFT
- ERC721 educational NFTs
- Minimum price: 0.1 CHZ
- 2.5% platform royalty

### Marketplace
- NFT trading platform
- 2.5% platform fee
- Item listing and purchasing

## Next Steps

1. Run each deployment command
2. Each will open in browser for final configuration
3. Select "Chiliz Spicy Testnet" as network
4. Copy the deployed contract addresses
5. Update the constants file in your application
6. Test functionality in admin panel at `/admin`

## Gas Optimization
- All contracts optimized for low gas usage
- Typical transaction costs under 0.002 CHZ
- Efficient storage patterns implemented